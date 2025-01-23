from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routes import auth, feedback, schools
from app.routes import schools

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(feedback.router)
app.include_router(schools.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the School Feedback Platform API"}

# inlcuding school router
app.inlcude_router(schools.router)