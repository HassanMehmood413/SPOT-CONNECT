from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import database, models, schemas
from ..database import get_db
from .hashing import Hash
from typing import List
from . import oauth2
from fastapi.security import OAuth2PasswordRequestForm
from . import token

router = APIRouter(
    tags=["admin"],
    prefix="/admin",
)

# Get all admins
@router.get("/", response_model=List[schemas.AdminOut])
def get_admin(db: Session = Depends(get_db)):
    return db.query(models.Admin).filter(models.Admin.role == "admin").all()

# Admin login
@router.post("/login")
def admin_login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_admin = db.query(models.Admin).filter(models.Admin.username == request.username).first()

    if not db_admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")
    
    if not Hash.verify(db_admin.password, request.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    
    access_token = token.create_access_token(data={"sub": db_admin.username, "role": "admin"})
    
    return {"access_token": access_token, "token_type": "bearer"}

# Create Admin
@router.post('/create_admin', response_model=schemas.AdminOut)
def create_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db), current_user: schemas.UserLogin = Depends(oauth2.get_current_user)):
    # Check if the current user is an admin
    # 
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create other admins")
    
    # Check if admin already exists by username
    existing_admin = db.query(models.Admin).filter(models.Admin.username == admin.username).first()
    if existing_admin:
        raise HTTPException(status_code=400, detail="Admin Already Exists")

    # Hash the admin's password before storing
    hashed_password = Hash.bcrypt(admin.password)

    # Create new admin record
    admin_data = admin.dict()
    admin_data["password"] = hashed_password
    admin_data['role'] = 'admin'  # Set role to admin

    db_admin = models.Admin(**admin_data)
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    return admin_data

# Admin approve feedback
@router.post("/approve_feedback/{feedback_id}")
def approve_feedback(feedback_id: int, db: Session = Depends(get_db), current_user: schemas.UserLogin = Depends(oauth2.get_current_user)):
    feedback = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    feedback.status = "resolved"
    db.commit()
    db.refresh(feedback)
    return {'message': 'Approved successfully'}

# Get all feedbacks
@router.get('/get_all_feedbacks')
def all_feedbacks(db: Session = Depends(get_db)):
    return db.query(models.Feedback).all()

# Delete feedback
@router.post("/delete_feedback/{feedback_id}")
def delete_feedback(feedback_id: int, db: Session = Depends(get_db), current_user: schemas.UserLogin = Depends(oauth2.get_current_user)):
    feedback = db.query(models.Feedback).filter(models.Feedback.feedback_id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(feedback)
    db.commit()
    return {'message': 'Deleted successfully'}
