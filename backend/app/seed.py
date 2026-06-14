import datetime
import random
from sqlalchemy.orm import Session
from .database import SessionLocal, Base, engine
from . import models

def seed_data():
    db = SessionLocal()
    
    # Recreate all tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # 1. Create a demo user with hashed password (password123)
    from .auth import get_password_hash
    
    demo_user = models.User(
        email="demo@student.com",
        password_hash=get_password_hash("password123"),
        full_name="Alex Mercer"
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)
    
    # 2. Create study profile with custom subject difficulties
    demo_profile = models.StudyProfile(
        user_id=demo_user.id,
        subjects=["Math", "Science", "History"],
        subject_difficulties={"Math": 5, "Science": 3, "History": 2},
        available_hours=4.0,
        primary_goal="Excel in upcoming exams and improve consistency"
    )
    db.add(demo_profile)
    db.commit()
    
    # 3. Create upcoming exams
    today = datetime.date.today()
    exams = [
        models.Exam(
            user_id=demo_user.id,
            name="Math Final Exam",
            exam_date=today + datetime.timedelta(days=5),
            confidence_level=62.0
        ),
        models.Exam(
            user_id=demo_user.id,
            name="Science Midterm",
            exam_date=today + datetime.timedelta(days=12),
            confidence_level=85.0
        ),
        models.Exam(
            user_id=demo_user.id,
            name="History Quiz",
            exam_date=today + datetime.timedelta(days=3),
            confidence_level=45.0
        )
    ]
    db.add_all(exams)
    db.commit()
    
    # 4. Generate 6 weeks (42 days) of study logs
    subjects = ["Math", "Science", "History"]
    logs = []
    
    # We walk backwards for 36 days to populate historical data
    for days_ago in range(36, 0, -1):
        log_date = today - datetime.timedelta(days=days_ago)
        
        # Skip some days to simulate realistic behavior
        if log_date.weekday() in [5, 6] and random.random() > 0.3: # less studies on weekends
            continue
            
        # Select subjects studied on that day
        subjects_today = random.sample(subjects, k=random.randint(1, 2))
        
        for subj in subjects_today:
            # Progression mapping to show realistic "trends"
            # Accuracy progresses over time
            progress_ratio = (36 - days_ago) / 36.0
            
            if subj == "Math":
                # Accuracy moves from ~55% to ~78%
                accuracy = 55.0 + (progress_ratio * 23.0) + random.uniform(-5, 5)
                time_spent = random.randint(60, 150) # 1h to 2.5h
                stress = random.randint(4, 9) if days_ago < 8 else random.randint(3, 7) # stress rises close to exams
                consistent = random.choice([True, True, True, False])
            elif subj == "Science":
                # Accuracy stays high ~80-92%
                accuracy = 80.0 + (progress_ratio * 10.0) + random.uniform(-4, 4)
                time_spent = random.randint(45, 120)
                stress = random.randint(2, 6)
                consistent = True
            else: # History
                # Accuracy fluctuates around ~60-70%
                accuracy = 58.0 + (progress_ratio * 8.0) + random.uniform(-8, 8)
                time_spent = random.randint(30, 90)
                stress = random.randint(3, 8)
                consistent = random.choice([True, False])

            # Clean and clamp
            accuracy = max(30.0, min(100.0, accuracy))
            
            log = models.BehaviorLog(
                user_id=demo_user.id,
                log_date=log_date,
                subject=subj,
                time_spent=time_spent,
                completion_rate=random.uniform(70.0, 100.0) if consistent else random.uniform(30.0, 65.0),
                accuracy=round(accuracy, 1),
                stress_level=stress,
                consistent=consistent,
                session_rating="Good"
            )
            logs.append(log)
            
    db.add_all(logs)
    db.commit()
    
    print(f"Successfully seeded demo database with User ID: {demo_user.id} and {len(logs)} study logs.")
    db.close()

if __name__ == "__main__":
    seed_data()
