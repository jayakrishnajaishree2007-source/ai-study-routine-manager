from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Study Profile schemas
class StudyProfileBase(BaseModel):
    subjects: List[str]
    subject_difficulties: Optional[dict] = None  # e.g., {"Math": 5, "Science": 3, "History": 2}
    available_hours: float = Field(..., ge=0.0, le=24.0)
    primary_goal: Optional[str] = None

class StudyProfileCreate(StudyProfileBase):
    pass

class StudyProfileResponse(StudyProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Behavior Log schemas
class BehaviorLogBase(BaseModel):
    log_date: date
    subject: str
    time_spent: int = Field(..., ge=0, description="Time spent in minutes")
    completion_rate: float = Field(..., ge=0.0, le=100.0)
    accuracy: float = Field(..., ge=0.0, le=100.0)
    stress_level: int = Field(..., ge=1, le=10, description="Stress index from 1-10")
    consistent: bool = True
    session_rating: Optional[str] = None  # "Too Fast", "Good", "Too Hard"

class BehaviorLogCreate(BehaviorLogBase):
    pass

class BehaviorLogResponse(BehaviorLogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Exam schemas
class ExamBase(BaseModel):
    name: str
    exam_date: date
    confidence_level: float = Field(50.0, ge=0.0, le=100.0)

class ExamCreate(ExamBase):
    pass

class ExamResponse(ExamBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class ExamConfidenceUpdate(BaseModel):
    confidence_level: float = Field(..., ge=0.0, le=100.0)

# JWT Authentication Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# Task schemas
class TaskBase(BaseModel):
    title: str
    subject: str
    priority_score: float = 0.0
    explanation: Optional[str] = None
    duration_minutes: int = 45
    is_revision: bool = False
    is_break: bool = False
    date_scheduled: date
    completed: bool = False
    skipped: bool = False
    difficulty_feedback: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class TaskToggleUpdate(BaseModel):
    completed: bool

class TaskFeedbackRequest(BaseModel):
    completed: bool
    skipped: bool
    difficulty_feedback: Optional[str] = None # "thumbs_up" or "thumbs_down" or None
    session_rating: Optional[str] = None # "Too Fast" or "Good" or "Too Hard" or None

# Dashboard Response schema
class DashboardMetricsResponse(BaseModel):
    # Consistency
    average_hours_per_day: float
    consistency_score: float  # Percentage of consistent days
    weekly_hours: List[float]  # Mon-Sun hours
    
    # Accuracy Trends (Math, Science, History etc over 6 weeks)
    subject_accuracy_trends: dict  # { subject: [accuracy_week1, accuracy_week2, ...] }
    
    # Stress indices
    stress_scores: List[float]  # last 10 log entries
    stress_dates: List[str]      # corresponding dates
    
    # Recommendation alerts
    alerts: List[dict]  # List of {type: 'success'|'warning'|'danger', text: str}
    
    # Upcoming exams
    exams: List[ExamResponse]
    
    # Prioritized learning plan
    tasks: List[TaskResponse]
    
    # Study history behavior logs for motivation streaks
    behavior_logs: List[BehaviorLogResponse]
