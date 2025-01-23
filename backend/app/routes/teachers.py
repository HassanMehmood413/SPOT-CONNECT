from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..routes.auth import get_current_user, verify_user_role

router = APIRouter()

@router.post("/review_feedback/{feedback_id}")
def review_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Ensure only teachers can access this route
    verify_user_role("teacher", current_user)

    feedback = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    feedback.status = "reviewed"  # Example status update
    db.commit()
    return feedback
