import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..ai.engine import generate_study_routine_tasks

router = APIRouter(
    prefix="/api",
    tags=["study routine"]
)

# --- STUDY PROFILE INGESTION ---

@router.get("/profile/{user_id}", response_model=schemas.StudyProfileResponse)
def get_profile(
    user_id: int, 
    current_user: models.User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized profile access")
        
    profile = db.query(models.StudyProfile).filter(models.StudyProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/profile/{user_id}", response_model=schemas.StudyProfileResponse)
def update_profile(
    user_id: int, 
    profile_data: schemas.StudyProfileCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized profile modification")
        
    profile = db.query(models.StudyProfile).filter(models.StudyProfile.user_id == user_id).first()
    
    # Store subjects and difficulties JSON
    # Map default difficulties if missing from profile_data
    subject_diffs = profile_data.subject_difficulties or {}
    for s in profile_data.subjects:
        if s not in subject_diffs:
            subject_diffs[s] = 3 # default difficulty 3 out of 5
            
    if not profile:
        profile = models.StudyProfile(
            user_id=user_id,
            subjects=profile_data.subjects,
            subject_difficulties=subject_diffs,
            available_hours=profile_data.available_hours,
            primary_goal=profile_data.primary_goal
        )
        db.add(profile)
    else:
        profile.subjects = profile_data.subjects
        profile.subject_difficulties = subject_diffs
        profile.available_hours = profile_data.available_hours
        profile.primary_goal = profile_data.primary_goal
            
    db.commit()
    db.refresh(profile)
    
    # Re-trigger routine generation upon updating profile
    regenerate_user_tasks(user_id, db)
    
    return profile


# --- PHASE 4: ADAPTIVE USER FEEDBACK WEBHOOK ---

@router.post("/tasks/{task_id}/feedback", response_model=schemas.TaskResponse)
def submit_task_feedback(
    task_id: int,
    feedback_data: schemas.TaskFeedbackRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized task modification")

    # 1. Update task statuses in Database
    task.completed = feedback_data.completed
    task.skipped = feedback_data.skipped
    task.difficulty_feedback = feedback_data.difficulty_feedback
    db.commit()
    db.refresh(task)

    # 2. Ingest feedback & adjust BehaviorLogs database values
    today = datetime.date.today()
    log = db.query(models.BehaviorLog).filter(
        models.BehaviorLog.user_id == current_user.id,
        models.BehaviorLog.log_date == today,
        models.BehaviorLog.subject == task.subject
    ).first()

    # Calculate mock base log values if none exist for today
    if not log:
        log = models.BehaviorLog(
            user_id=current_user.id,
            log_date=today,
            subject=task.subject,
            time_spent=task.duration_minutes if task.completed else 0,
            completion_rate=100.0 if task.completed else (0.0 if task.skipped else 50.0),
            accuracy=75.0,
            stress_level=5,
            consistent=not task.skipped,
            session_rating=feedback_data.session_rating
        )
        db.add(log)
    else:
        # Dynamic updates
        if task.completed:
            log.completion_rate = min(100.0, log.completion_rate + 25.0)
            log.time_spent += task.duration_minutes
            log.consistent = True
        elif task.skipped:
            log.completion_rate = max(0.0, log.completion_rate - 25.0)
            log.consistent = False

    # Adjust stress levels based on task difficulty feedback
    if feedback_data.difficulty_feedback == "thumbs_down":
        log.stress_level = min(10, log.stress_level + 1)
    elif feedback_data.difficulty_feedback == "thumbs_up":
        log.stress_level = max(1, log.stress_level - 1)

    # Adjust stress & completion rate based on session pacing rating ("Too Fast", "Good", "Too Hard")
    if feedback_data.session_rating:
        log.session_rating = feedback_data.session_rating
        if feedback_data.session_rating == "Too Hard":
            log.stress_level = min(10, log.stress_level + 2)
        elif feedback_data.session_rating == "Too Fast":
            log.stress_level = min(10, log.stress_level + 1)
            # simulate rushed accuracy reduction
            log.accuracy = max(30.0, log.accuracy - 5.0)

    db.commit()

    # 3. Trigger recalculation of AI Routine priority scores dynamically
    regenerate_user_tasks(current_user.id, db)

    return task


# --- INTERNAL ROUTINE REGENERATOR UTILITY ---

def regenerate_user_tasks(user_id: int, db: Session) -> List[models.Task]:
    """
    Core engine loop recalculating tasks priorities.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return []
        
    profile = user.profile
    subjects = profile.subjects if profile else ["Math", "Science", "History"]
    subject_diffs = profile.subject_difficulties if (profile and profile.subject_difficulties) else {"Math": 4, "Science": 3, "History": 2}
    available_hours = profile.available_hours if profile else 3.5
    
    logs_dicts = [
        {"subject": l.subject, "accuracy": l.accuracy, "time_spent": l.time_spent, "stress_level": l.stress_level, "consistent": l.consistent}
        for l in user.behavior_logs
    ]
    
    exams_dicts = [
        {"name": e.name, "exam_date": e.exam_date}
        for e in user.exams
    ]
    
    # AI calculation incorporating subject difficulties
    ai_tasks = generate_study_routine_tasks(
        subjects=subjects,
        exams=exams_dicts,
        behavior_logs=logs_dicts,
        available_hours=available_hours,
        subject_difficulties=subject_diffs
    )
    
    # Query today's tasks to preserve completed states
    today = datetime.date.today()
    existing_tasks = db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.date_scheduled == today
    ).all()
    
    completed_titles = {t.title: (t.completed, t.skipped, t.difficulty_feedback) for t in existing_tasks}
    
    # Delete uncompleted/unskipped to regenerate clean scores, but preserve completed/skipped logs
    db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.date_scheduled == today,
        models.Task.completed == False,
        models.Task.skipped == False
    ).delete()
    
    # Insert recalculated tasks
    db_tasks = []
    for t in ai_tasks:
        # Check if we should restore completed status
        is_completed = False
        is_skipped = False
        diff_feedback = None
        if t["title"] in completed_titles:
            is_completed, is_skipped, diff_feedback = completed_titles[t["title"]]
            
        new_task = models.Task(
            user_id=user_id,
            title=t["title"],
            subject=t["subject"],
            priority_score=t["priority_score"],
            explanation=t["explanation"],
            duration_minutes=t["duration_minutes"],
            is_revision=t["is_revision"],
            is_break=t["is_break"],
            date_scheduled=today,
            completed=is_completed,
            skipped=is_skipped,
            difficulty_feedback=diff_feedback
        )
        db.add(new_task)
        db_tasks.append(new_task)
        
    db.commit()
    
    return db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.date_scheduled == today
    ).order_by(models.Task.priority_score.desc()).all()
