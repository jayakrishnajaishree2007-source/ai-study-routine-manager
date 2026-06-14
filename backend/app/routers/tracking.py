import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_user
from ..services.firebase import firebase_service

router = APIRouter(
    prefix="/api",
    tags=["behavior tracking"]
)

# --- BEHAVIOR LOG INGESTION ---

@router.post("/behavior-logs/{user_id}", response_model=schemas.BehaviorLogResponse)
def create_behavior_log(
    user_id: int, 
    log_data: schemas.BehaviorLogCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized behavior log submission")
        
    db_log = models.BehaviorLog(user_id=user_id, **log_data.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    
    # Import routine task recalculation dynamically to prevent circular imports
    from .routine import regenerate_user_tasks
    regenerate_user_tasks(user_id, db)
    
    return db_log


# --- UPCOMING EXAMS & CONFIDENCE ---

@router.post("/exams/{user_id}", response_model=schemas.ExamResponse)
def create_exam(
    user_id: int, 
    exam_data: schemas.ExamCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized exam scheduling")
        
    db_exam = models.Exam(user_id=user_id, **exam_data.dict())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    from .routine import regenerate_user_tasks
    regenerate_user_tasks(user_id, db)
    
    return db_exam


@router.put("/exams/{exam_id}/confidence", response_model=schemas.ExamResponse)
def update_exam_confidence(
    exam_id: int, 
    confidence_data: schemas.ExamConfidenceUpdate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exam = db.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    if exam.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized exam update")
        
    exam.confidence_level = confidence_data.confidence_level
    db.commit()
    db.refresh(exam)
    return exam


# --- TELEMETRY DASHBOARD RETRIEVAL ---

@router.get("/dashboard/{user_id}", response_model=schemas.DashboardMetricsResponse)
def get_dashboard_metrics(
    user_id: int, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized dashboard metrics access")
        
    user = current_user
    profile = user.profile
    subjects = profile.subjects if profile else ["Math", "Science", "History"]
    
    logs = db.query(models.BehaviorLog).filter(
        models.BehaviorLog.user_id == user_id
    ).order_by(models.BehaviorLog.log_date.asc()).all()
    
    # 1. Consistency metrics (Mon-Sun tracked hours)
    last_7_logs = logs[-7:] if len(logs) >= 7 else logs
    weekly_hours = [0.0] * 7
    for log in last_7_logs:
        day_idx = log.log_date.weekday()
        if day_idx < 7:
            weekly_hours[day_idx] = round(log.time_spent / 60.0, 2)
            
    avg_hours = sum(weekly_hours) / 7.0 if weekly_hours else 0.0
    total_logs_count = len(last_7_logs)
    consistent_count = sum(1 for log in last_7_logs if log.consistent)
    consistency_score = (consistent_count / total_logs_count * 100.0) if total_logs_count > 0 else 100.0
    
    # 2. 6-week Accuracy Trends
    accuracy_trends = {subj: [75.0] * 6 for subj in subjects}
    today = datetime.date.today()
    for log in logs:
        days_ago = (today - log.log_date).days
        week_bucket = days_ago // 7
        if 0 <= week_bucket < 6:
            idx = 5 - week_bucket
            subj = log.subject
            if subj in accuracy_trends:
                current_values = accuracy_trends[subj]
                if current_values[idx] == 75.0:
                    current_values[idx] = log.accuracy
                else:
                    current_values[idx] = round((current_values[idx] + log.accuracy) / 2.0, 1)

    # 3. Stress Index timeline (last 10 logs)
    last_10_logs = logs[-10:] if len(logs) >= 10 else logs
    stress_scores = [float(log.stress_level) for log in last_10_logs]
    stress_dates = [log.log_date.strftime("%m/%d") for log in last_10_logs]
    
    if not stress_scores:
        stress_scores = [5.0] * 5
        stress_dates = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        
    # 4. Generate Recommendation Alerts
    alerts = []
    avg_stress = sum(log.stress_level for log in last_7_logs) / len(last_7_logs) if last_7_logs else 5.0
    if avg_stress >= 7.5:
        alerts.append({
            "type": "danger",
            "text": f"Burnout Fatigue Check (Avg Stress: {avg_stress:.1f}/10): Heavy mental pressure. Routine Optimizer has inserted mandatory dynamic relaxation blocks."
        })
    elif avg_stress >= 5.5:
        alerts.append({
            "type": "warning",
            "text": f"Workload Nudge (Avg Stress: {avg_stress:.1f}/10): Balance is slipping. Recommend using optimal pacing feedback on completed study units."
        })
    else:
        alerts.append({
            "type": "success",
            "text": "Stamina Status: Mentally optimal. Low recovery fatigue!"
        })

    for subj in subjects:
        subj_logs = [log for log in logs if log.subject == subj][-3:]
        if subj_logs:
            avg_acc = sum(log.accuracy for log in subj_logs) / len(subj_logs)
            if avg_acc < 65.0:
                alerts.append({
                    "type": "danger",
                    "text": f"Core Weakness: Accuracy in {subj} is weak ({avg_acc:.1f}%). Revision plan auto-injected spacing repetition modules."
                })
            elif avg_acc < 75.0:
                alerts.append({
                    "type": "warning",
                    "text": f"Pacing Advisory: Accuracy in {subj} is average ({avg_acc:.1f}%). Revise concepts using flashcards."
                })

    if consistency_score < 70.0:
        alerts.append({
            "type": "danger",
            "text": f"Streak Interruption: Consistency index is at {consistency_score:.0f}%. Study one routine block today to restart your streak!"
        })
    
    exams = db.query(models.Exam).filter(models.Exam.user_id == user_id).order_by(models.Exam.exam_date.asc()).all()
    
    # Get today's scheduled tasks
    tasks = db.query(models.Task).filter(
        models.Task.user_id == user_id,
        models.Task.date_scheduled == today
    ).order_by(models.Task.priority_score.desc()).all()
    
    # Auto-generate tasks if none exist
    if not tasks:
        from .routine import regenerate_user_tasks
        tasks = regenerate_user_tasks(user_id, db)

    # Trigger mock FCM notification nudges
    if logs:
        latest_log = logs[-1]
        firebase_service.trigger_motivation_reminder(
            user_name=user.full_name or "Student",
            stress_level=latest_log.stress_level,
            consistency_score=consistency_score
        )

    return schemas.DashboardMetricsResponse(
        average_hours_per_day=round(avg_hours, 2),
        consistency_score=round(consistency_score, 1),
        weekly_hours=weekly_hours,
        subject_accuracy_trends=accuracy_trends,
        stress_scores=stress_scores,
        stress_dates=stress_dates,
        alerts=alerts,
        exams=exams,
        tasks=tasks,
        behavior_logs=logs
    )
