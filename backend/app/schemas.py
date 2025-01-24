from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    password: str
    location: str 
    contact_number: Optional[str] = None  
    address: Optional[str] = None  

    class Config:
        orm_mode = True


class UserOut(UserCreate):
    id: int
    username: str

    class Config:
        orm_mode = True


class AdminCreate(BaseModel):
    username: str
    password: str

    class Config:
        orm_mode = True


class AdminOut(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

class AdminLogin(BaseModel):
    username: str
    password: str


class FeedbackCreate(BaseModel):
    user_id: int
    feedback_type: str
    issue_description: str
    user_location: str  # Location of the user providing feedback
    issue_details: str  # Detailed description of the connectivity issue
    repair_contacted: bool  # Whether the user has contacted the repair service or not
    days_without_resolution: Optional[int] = None  # Number of days the issue has been unresolved

    class Config:
        orm_mode = True




class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        orm_mode = True

        
class Token(BaseModel):
    access_token: str
    token_type: str

    class Config:
        orm_mode = True


class TokenData(BaseModel):
    email: str | None = None
    role: str
    id:int # Make sure to include the id




class DashboardData(BaseModel):
    feedbacks: list[FeedbackCreate]  # Assuming you have a Feedback schema defined
    nearby_schools: list[dict]  # Or use a specific school schema if you have one

    class Config:
        from_attributes = True

class NetworkIssueBase(BaseModel):
    title: str
    description: str
    location: str
    source: Optional[str] = None
    severity: str
    isp_affected: Optional[str] = None

class NetworkIssueCreate(NetworkIssueBase):
    pass

class NetworkIssue(NetworkIssueBase):
    id: int
    timestamp: datetime
    is_resolved: bool
    resolved_at: Optional[datetime] = None
    reported_by: int

    class Config:
        from_attributes = True