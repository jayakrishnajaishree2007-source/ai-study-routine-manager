import os
import sys
import uvicorn

# Ensure backend directory is in python search path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # If database file does not exist, trigger database seeding automatically
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "study_routine.db")
    if not os.path.exists(db_path) or "--seed" in sys.argv:
        print("Database not found or seed requested. Running database seed script...")
        from app.seed import seed_data
        seed_data()
        
    print("Starting FastAPI REST API server...")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
