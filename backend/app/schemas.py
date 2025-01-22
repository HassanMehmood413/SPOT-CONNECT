from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    school_name: str  # For the school name
    school_location: str  # For the school location
    school_info: str  # Optional, if you want to store additional info

class FeedbackCreate(BaseModel):
    user_id: int
    school_id: int
    feedback_type: str  # Use string instead of Enum
    issue_description: str

class SchoolCreate(BaseModel):
    name: str
    location: str
    school_info: dict  # JSON-like structure

class UserLogin(BaseModel):
    username: str
    password: str