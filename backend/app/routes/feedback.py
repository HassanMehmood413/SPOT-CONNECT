from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from .auth import oauth2_scheme

get_current_user = oauth2_scheme

router = APIRouter()


@router.post("/submit_feedback")
def submit_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db),current_user:models.User = Depends(get_current_user)):
    # Ensure feedback is linked to the current user's school
    if feedback.school_id != current_user.school_id:
        raise HTTPException(
            status_code=403,
            detail="You can only submit feedback for your own school.",
        )
    
    # Ensure feedback is submitted to the correct section (teacher/student)
    if feedback.section != current_user.role:
        raise HTTPException(
            status_code=403,
            detail=f"Only {current_user.role}s can submit feedback in this section.",
        )
    
    #Create feedback
    db_feedback = models.Feedback(**feedback.dict())
    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)
    return db_feedback

@router.get("/school_feedback/{school_id}")
def get_feedback(school_id: int, section: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user),):
    
# Ensure the user is only fetching feedback for their own school
    if school_id != current_user.school_id:
        raise HTTPException(
            status_code=403,
            detail="You can only view feedback for your own school.",
        )

# Ensure the user can only fetch feedback for their section (teacher/student)
    if section != current_user.role:
        raise HTTPException(
            status_code=403,
            detail=f"Only {current_user.role}s can view feedback in this section.",
        )

#Fetch feedback 

    feedback = db.query(models.Feedback).filter
    # (models.Feedback.school_id == school_id).all()
    (models.Feedback.school_id == school_id,
     models.Feedback.section == section,).all()
    return feedback

@router.post("/approve_feedback/{feedback_id}")
def approve_feedback(feedback_id: int, 
                     db: Session = Depends(get_db),
                     current_user: model.User = Depends(get_current_user),
                     ):
    feedback = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
# Ensure the feedback belongs to the current user's school
    if feedback.school_id != current_user.school_id:
        raise HTTPException(
            status_code=403,
            detail="You can only approve feedback for your own school.",
        )

    # Ensure only teachers can approve feedback
    if current_user.role != "teacher":
        raise HTTPException(
            status_code=403,
            detail="Only teachers can approve feedback.",
        )
# Approve feedback
    feedback.status = "resolved"  # Update status to resolved
    db.commit()
    return feedback