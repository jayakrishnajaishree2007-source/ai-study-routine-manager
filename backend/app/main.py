import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import users, routine, tracking

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AetherRoutine REST API Server",
    description="Scalable modular study routine manager REST API with support for dynamic break scheduling and spaced repetition.",
    version="1.2.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount APIRouters to support scalable database migrations
app.include_router(users.router)
app.include_router(routine.router)
app.include_router(tracking.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy", 
        "version": "1.2.0", 
        "timestamp": datetime.datetime.now().isoformat()
    }
