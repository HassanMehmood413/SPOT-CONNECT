from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)  # hashed
    role = Column(String)  # Use string instead of Enum
    school_id = Column(Integer, ForeignKey('schools.id'))
    school = relationship("School", back_populates="users")
    school_name = Column(String)  # Ensure this field exists
    school_location = Column(String)  # Ensure this field exists
    school_info = Column(String)  # Ensure this field exists

class School(Base):
    __tablename__ = 'schools'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    school_info = Column(String)  # JSON-like string for details
    users = relationship("User", back_populates="school")
    feedback = relationship("Feedback", back_populates="school")  # Feedback linked to the School

class Feedback(Base):
    __tablename__ = 'feedback'
    feedback_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    school_id = Column(Integer, ForeignKey('schools.id'))
    section = Column(String)  # Can be "teacher" or "student"
    feedback_type = Column(String)  # Use string instead of Enum
    issue_description = Column(Text)
    status = Column(String, default="pending")  # Use string for status
    date_submitted = Column(DateTime, default=datetime.datetime.utcnow)
    
# Relationships
    user = relationship("User")  # Relationship with User
    school = relationship("School", back_populates="feedback")  # Relationship with School