from sqlalchemy import Column, Integer, String, ForeignKey,Boolean
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default='user')  # Default role as 'user'
    location = Column(String)
    contact_number = Column(String, nullable=True)  # Optional field
    address = Column(String, nullable=True)  # Optional field
    
    feedbacks = relationship("Feedback", back_populates="user")

class Admin(Base):
    __tablename__ = 'admins'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String, default='admin')  # Default role as 'admin'

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)  # Add this line
    user_id = Column(Integer, ForeignKey("users.id"))
    feedback_type = Column(String)
    issue_description = Column(String)
    user_location = Column(String)
    issue_details = Column(String)
    repair_contacted = Column(Boolean, default=False)
    days_without_resolution = Column(Integer, nullable=True)
    
    user = relationship("User", back_populates="feedbacks")
