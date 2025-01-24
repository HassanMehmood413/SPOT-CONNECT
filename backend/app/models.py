from sqlalchemy import Column, Integer, String, ForeignKey,Boolean, Text, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

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
    reported_issues = relationship("NetworkIssue", back_populates="reporter")

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

class NetworkIssue(Base):
    __tablename__ = "network_issues"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    location = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String, nullable=True)
    severity = Column(String)  # 'high', 'medium', 'low'
    isp_affected = Column(String, nullable=True)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    reported_by = Column(Integer, ForeignKey("users.id"))

    # Add relationship to User model
    reporter = relationship("User", back_populates="reported_issues")
