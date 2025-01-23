from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..routes.auth import get_current_user, verify_user_role, verify_user_school

router = APIRouter()

@router.post("/submit_feedback")
def submit_feedback(
    feedback: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Ensure only students can access this route
    verify_user_role("student", current_user)
    
    # Ensure the student belongs to the specified school
    verify_user_school(feedback.school_id, current_user)
    
    db_feedback = models.Feedback(**feedback.dict(), user_id=current_user.id)
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback
