from fastapi import FastAPI,BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
<<<<<<< HEAD
from .routes import auth, feedback, schools
from app.routes import schools
=======
from .routes import  admin  , users 
from . import models
>>>>>>> c3bb572465a950ca02e42f97c99ed1c8602a0484

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

models.Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:3000",  # or your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allows requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


<<<<<<< HEAD
@app.get("/")
def read_root():
    return {"message": "Welcome to the School Feedback Platform API"}

# inlcuding school router
app.inlcude_router(schools.router)
=======


app.include_router(admin.router)
app.include_router(users.router)
>>>>>>> c3bb572465a950ca02e42f97c99ed1c8602a0484
