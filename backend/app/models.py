from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)

    profile = relationship("StudyProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    behavior_logs = relationship("BehaviorLog", back_populates="user", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="user", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")


class StudyProfile(Base):
    __tablename__ = "study_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Store subjects list as JSON (e.g. ["Math", "Science", "History"])
    subjects = Column(JSON, nullable=False)
    
    # Store subject difficulty ratings as JSON (e.g. {"Math": 5, "Science": 3, "History": 2})
    subject_difficulties = Column(JSON, nullable=True)
    
    # Time available daily (hours)
    available_hours = Column(Float, nullable=False)
    
    # Career or study goals (e.g. "Pass SAT", "Improve overall GPA")
    primary_goal = Column(String, nullable=True)

    user = relationship("User", back_populates="profile")


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    log_date = Column(Date, index=True, nullable=False)
    subject = Column(String, nullable=False)
    
    # Time spent in minutes
    time_spent = Column(Integer, nullable=False)
    
    # Task completion rate (0.0 to 100.0)
    completion_rate = Column(Float, nullable=False)
    
    # Quiz/Test Accuracy (0.0 to 100.0)
    accuracy = Column(Float, nullable=False)
    
    # Stress score recorded on a scale of 1-10
    stress_level = Column(Integer, nullable=False)
    
    # Boolean checking whether the student stuck to planned schedule on this day
    consistent = Column(Boolean, default=True)
    
    # Session rating feedback (e.g. "Too Fast", "Good", "Too Hard")
    session_rating = Column(String, nullable=True)

    user = relationship("User", back_populates="behavior_logs")


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    name = Column(String, nullable=False)
    exam_date = Column(Date, nullable=False)
    
    # Subjective readiness indicator (0.0 to 100.0)
    confidence_level = Column(Float, default=50.0)

    user = relationship("User", back_populates="exams")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    
    # AI generated values
    priority_score = Column(Float, default=0.0)
    explanation = Column(String, nullable=True)  # Explainable AI (XAI) feature attribution string
    duration_minutes = Column(Integer, default=45)
    is_revision = Column(Boolean, default=False)
    is_break = Column(Boolean, default=False)
    
    date_scheduled = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    skipped = Column(Boolean, default=False)
    difficulty_feedback = Column(String, nullable=True)  # "thumbs_up" or "thumbs_down"

    user = relationship("User", back_populates="tasks")
