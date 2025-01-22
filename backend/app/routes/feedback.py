from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import oauth2_scheme

get_current_user = oauth2_scheme

router = APIRouter()


@router.post("/submit_feedback")
def submit_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db),current_user:models.User = Depends(get_current_user)):
    db_feedback = models.Feedback(**feedback.dict())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/school_feedback/{school_id}")
def get_feedback(school_id: int, db: Session = Depends(get_db)):
    feedback = db.query(models.Feedback).filter(models.Feedback.school_id == school_id).all()
    return feedback

@router.post("/approve_feedback/{feedback_id}")
def approve_feedback(feedback_id: int, db: Session = Depends(get_db)):
    feedback = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    feedback.status = "resolved"  # Update status to resolved
    db.commit()
    return feedback