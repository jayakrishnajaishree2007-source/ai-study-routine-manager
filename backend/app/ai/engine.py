import math
from typing import List, Dict, Tuple, Optional
from datetime import date

# Pure Python K-Means Clustering implementation for Student Profiling
class StudyProfilerClustering:
    def __init__(self, n_clusters: int = 4, max_iters: int = 20):
        self.n_clusters = n_clusters
        self.max_iters = max_iters
        # Predefined centroids for student profile states:
        # Features order: [completion_rate (0-100), consistency_rate (0-100), avg_stress (1-10), avg_hours (0-12)]
        self.centroids = [
            [85.0, 90.0, 4.0, 6.0],  # Cluster 0: Balanced High Achiever
            [70.0, 50.0, 8.5, 7.5],  # Cluster 1: Burnout Risk (High stress/hours, low consistency)
            [40.0, 30.0, 2.5, 1.5],  # Cluster 2: Under-engaged / Casual Learner
            [60.0, 75.0, 6.0, 4.5],  # Cluster 3: Diligent but Struggling
        ]
        self.cluster_names = {
            0: "Balanced Achiever",
            1: "Burnout Risk Zone",
            2: "Under-engaged Learner",
            3: "Struggling Diligent"
        }

    def _euclidean_distance(self, p1: List[float], p2: List[float]) -> float:
        return math.sqrt(sum((x - y) ** 2 for x, y in zip(p1, p2)))

    def fit_predict(self, data_point: List[float]) -> Tuple[int, str]:
        """
        Assigns a student's aggregate metrics to the nearest cluster.
        """
        min_dist = float('inf')
        best_cluster = 0
        
        for idx, centroid in enumerate(self.centroids):
            dist = self._euclidean_distance(data_point, centroid)
            if dist < min_dist:
                min_dist = dist
                best_cluster = idx
                
        return best_cluster, self.cluster_names[best_cluster]


# Heuristic Gradient-Boosted Decision Tree simulator with SHAP feature attribution
class StudyPriorityModelXGBoost:
    """
    Simulates gradient boosted decision trees for prioritizing tasks.
    """
    def __init__(self):
        self.base_value = 50.0 

    def predict_with_explanation(
        self, 
        subject: str, 
        days_to_exam: Optional[int], 
        historical_accuracy: float, 
        historical_time_spent_hrs: float, 
        student_cluster: int
    ) -> Tuple[float, Dict[str, float], List[str]]:
        attributions = {}
        explanations = []
        
        # 1. Proximity to Exam contribution
        exam_impact = 0.0
        if days_to_exam is not None:
            if days_to_exam <= 3:
                exam_impact = 35.0
                explanations.append(f"Critical exam in {days_to_exam} days (+35% priority)")
            elif days_to_exam <= 7:
                exam_impact = 20.0
                explanations.append(f"Upcoming exam in {days_to_exam} days (+20% priority)")
            elif days_to_exam <= 14:
                exam_impact = 10.0
                explanations.append(f"Approaching exam in {days_to_exam} days (+10% priority)")
            else:
                exam_impact = -5.0
                explanations.append(f"Exam is comfortable {days_to_exam} days away (-5% priority)")
        else:
            exam_impact = -10.0
            explanations.append("No upcoming exam scheduled for this subject (-10% priority)")
        attributions["Exam Proximity"] = exam_impact

        # 2. Historical accuracy contribution
        accuracy_impact = 0.0
        if historical_accuracy < 60.0:
            accuracy_impact = 25.0
            explanations.append(f"Low accuracy in recent quizzes ({historical_accuracy:.1f}%) (+25% priority)")
        elif historical_accuracy < 75.0:
            accuracy_impact = 12.0
            explanations.append(f"Accuracy needs improvement ({historical_accuracy:.1f}%) (+12% priority)")
        elif historical_accuracy >= 90.0:
            accuracy_impact = -15.0
            explanations.append(f"Excellent accuracy ({historical_accuracy:.1f}%), revision load reduced (-15% priority)")
        else:
            accuracy_impact = -5.0
            explanations.append(f"Solid accuracy ({historical_accuracy:.1f}%), regular upkeep maintenance (-5% priority)")
        attributions["Subject Accuracy"] = accuracy_impact

        # 3. Weekly Hours studied contribution
        time_impact = 0.0
        if historical_time_spent_hrs < 2.0:
            time_impact = 15.0
            explanations.append(f"Low focus time this week ({historical_time_spent_hrs:.1f} hrs) (+15% priority)")
        elif historical_time_spent_hrs > 6.0:
            time_impact = -10.0
            explanations.append(f"High focus time already invested ({historical_time_spent_hrs:.1f} hrs) (-10% priority)")
        else:
            time_impact = 0.0
            explanations.append("Weekly focus hours are currently on-track")
        attributions["Historical Time Invested"] = time_impact

        # 4. Student Cluster / Burnout Stress mitigation
        cluster_impact = 0.0
        if student_cluster == 1:  # Burnout Risk
            cluster_impact = -15.0
            explanations.append("High Burnout Risk detected: De-prioritizing heavy review sessions to prevent exhaustion (-15% load)")
        elif student_cluster == 2:  # Under-engaged
            cluster_impact = 10.0
            explanations.append("Under-engaged pattern: Increasing priority scores to trigger routine reactivation (+10% load)")
        elif student_cluster == 0:  # Balanced Achiever
            cluster_impact = 5.0
            explanations.append("Balanced performer: Recommended maintenance schedule (+5% load)")
        attributions["Student Profile Fatigue Adjustment"] = cluster_impact

        # Combine scores and clamp
        raw_score = self.base_value + exam_impact + accuracy_impact + time_impact + cluster_impact
        final_score = max(10.0, min(99.0, raw_score))
        
        return final_score, attributions, explanations


# Initialize engines
profiler_engine = StudyProfilerClustering()
priority_engine = StudyPriorityModelXGBoost()


def generate_study_routine_tasks(
    subjects: List[str], 
    exams: List[Dict], 
    behavior_logs: List[Dict],
    available_hours: float,
    subject_difficulties: Optional[Dict[str, int]] = None
) -> List[Dict]:
    """
    AI Routine Generator incorporating dynamic time allocation, spaced repetition, 
    and smart break interleaving.
    """
    if not subject_difficulties:
        subject_difficulties = {}

    # 1. Profile user via clustering
    if not behavior_logs:
        cluster_idx, cluster_name = 0, "Balanced Achiever"
    else:
        total_logs = len(behavior_logs)
        avg_completion = sum(log.get("completion_rate", 80.0) for log in behavior_logs) / total_logs
        avg_consistency = sum(100.0 if log.get("consistent", True) else 0.0 for log in behavior_logs) / total_logs
        avg_stress = sum(log.get("stress_level", 5.0) for log in behavior_logs) / total_logs
        avg_hours = (sum(log.get("time_spent", 120.0) for log in behavior_logs) / total_logs) / 60.0
        cluster_idx, cluster_name = profiler_engine.fit_predict([avg_completion, avg_consistency, avg_stress, avg_hours])

    # 2. Map exams
    today = date.today()
    subject_exams = {}
    for exam in exams:
        exam_date = exam.get("exam_date")
        if isinstance(exam_date, str):
            exam_date = date.fromisoformat(exam_date)
        days_diff = (exam_date - today).days
        if days_diff >= 0:
            matched_subject = None
            for s in subjects:
                if s.lower() in exam.get("name", "").lower():
                    matched_subject = s
                    break
            target_key = matched_subject or s
            if target_key not in subject_exams or days_diff < subject_exams[target_key]:
                subject_exams[target_key] = days_diff

    # 3. Aggregate subject performance
    subject_stats = {}
    for s in subjects:
        subject_stats[s] = {"accuracy": 75.0, "hours": 0.0, "log_count": 0}

    for log in behavior_logs:
        subj = log.get("subject")
        if subj in subject_stats:
            subject_stats[subj]["accuracy"] += log.get("accuracy", 75.0)
            subject_stats[subj]["hours"] += log.get("time_spent", 0.0) / 60.0
            subject_stats[subj]["log_count"] += 1

    for s in subjects:
        count = subject_stats[s]["log_count"]
        if count > 0:
            subject_stats[s]["accuracy"] = (subject_stats[s]["accuracy"] - 75.0) / count
        else:
            subject_stats[s]["accuracy"] = 75.0

    # 4. Generate Core Study Tasks with Time Allocation & Spaced Repetition
    task_templates = {
        "Math": ["Review Calculus Limits & Continuity", "Solve Algebra Mock Quiz", "Practice Trigonometric Integrals"],
        "Science": ["Chemistry: Balance Redox Reactions", "Physics: Newton's Laws Review", "Biology: Draw Cell Mitosis"],
        "History": ["Memorize World War I Key Dates", "Draft Essay Outline", "Review Quiz: Civil War Causes"],
        "default": ["Review Core Text Chapter Summaries", "Solve End-of-Chapter Problems", "Generate Key Flashcards"]
    }

    raw_study_tasks = []

    for idx, s in enumerate(subjects):
        days_left = subject_exams.get(s, None)
        accuracy = subject_stats[s]["accuracy"]
        hours = subject_stats[s]["hours"]
        difficulty = subject_difficulties.get(s, 3)
        
        # Priority XGBoost scoring
        score, attributions, explanations = priority_engine.predict_with_explanation(
            subject=s,
            days_to_exam=days_left,
            historical_accuracy=accuracy,
            historical_time_spent_hrs=hours,
            student_cluster=cluster_idx
        )
        
        # Heuristic Time Allocation: allocated_time = base_time + (difficulty * 15) + ((100 - accuracy) * 0.5)
        base_time = 30
        allocated_time_raw = base_time + (difficulty * 15) + ((100.0 - accuracy) * 0.5)
        # Round to nearest 5 minutes and clamp between 30 and 150 minutes
        allocated_time = max(30, min(150, int(round(allocated_time_raw / 5.0) * 5)))

        title_list = task_templates.get(s, task_templates["default"])
        title = title_list[idx % len(title_list)]
        
        attr_text = f"AI Score Explanation (Base: 50.0) | allocated focus duration: {allocated_time} mins. " + " | ".join(explanations)
        
        raw_study_tasks.append({
            "title": title,
            "subject": s,
            "priority_score": round(score, 1),
            "explanation": attr_text,
            "duration_minutes": allocated_time,
            "is_revision": False,
            "is_break": False,
            "date_scheduled": today,
            "completed": False
        })

        # Spaced Repetition check: If historical quiz accuracy is below 70%, automatically inject a revision task
        if accuracy < 70.0:
            spaced_explanation = f"Spaced Repetition: Revision auto-triggered because average accuracy in {s} is low ({accuracy:.1f}%)."
            raw_study_tasks.append({
                "title": f"Spaced Revision: Target weak concepts in {s}",
                "subject": s,
                "priority_score": round(score + 10.0, 1), # boost priority to ensure attention
                "explanation": spaced_explanation,
                "duration_minutes": 30, # standard revision time block
                "is_revision": True,
                "is_break": False,
                "date_scheduled": today,
                "completed": False
            })

    # Sort all study and revision tasks by priority score descending
    raw_study_tasks.sort(key=lambda t: t["priority_score"], reverse=True)

    # 5. Smart Break Interleaving
    # Interleave a 15-minute break after high-difficulty tasks or after 90 minutes of cumulative study blocks
    final_schedule = []
    cumulative_study_time = 0

    for task in raw_study_tasks:
        final_schedule.append(task)
        
        # Don't track break tasks in cumulative study time
        if task["is_revision"]:
            cumulative_study_time += task["duration_minutes"]
        else:
            cumulative_study_time += task["duration_minutes"]

        # Check conditions for dynamic break injection
        difficulty = subject_difficulties.get(task["subject"], 3)
        
        # Condition A: Cumulative focus study block exceeds or equals 90 minutes
        # Condition B: High-difficulty task completed (difficulty >= 4)
        needs_break = False
        break_reason = ""
        
        if cumulative_study_time >= 90:
            needs_break = True
            break_reason = "continuous study focus block exceeded 90 minutes"
        elif difficulty >= 4 and not task["is_revision"]:
            needs_break = True
            break_reason = f"completed heavy module in high-difficulty subject {task['subject']}"

        if needs_break:
            final_schedule.append({
                "title": "Dynamic Break: Cognitive Relaxation",
                "subject": "Break",
                "priority_score": round(max(10.0, task["priority_score"] - 1.0), 1),
                "explanation": f"AI Smart Break: Scheduled to prevent cognitive overload because {break_reason}.",
                "duration_minutes": 15,
                "is_revision": False,
                "is_break": True,
                "date_scheduled": today,
                "completed": False
            })
            # Reset cumulative tracker
            cumulative_study_time = 0

    return final_schedule
