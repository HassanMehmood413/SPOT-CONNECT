from fastapi import FastAPI,BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from .models import Base
from .routes import admin, users, network
from . import models

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

models.Base.metadata.create_all(bind=engine)


origins = [
    "http://localhost:3000",  # or your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specify frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(admin.router)
app.include_router(users.router)
app.include_router(network.router)