from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from fastapi.security import OAuth2PasswordRequestForm
from ..schemas import Token
from .hashing import Hash
from . import token
from . import oauth2
from ..apis import location



router = APIRouter(
    tags=['users'],
    prefix='/users',
)

# Create User
@router.post("/", response_model=schemas.UserOut)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):

    # Check if the username already exists
    existing_user = db.query(models.User).filter(models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    # Hash the user's password before storing it
    hashed_password = Hash.bcrypt(user.password)

    # Convert user Pydantic model to a dictionary and use it to create the user instance
    user_dict = user.dict()

    # Create user instance with the provided details
    db_user = models.User(
        username=user_dict['username'],
        password=hashed_password,
        role='user',
        location=user_dict['location'],
        contact_number=user_dict.get('contact_number'),
        address=user_dict.get('address')
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user



# User login
@router.post("/login")
def user_login(request: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == request.username).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if not Hash.verify(db_user.password, request.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Credentials")
    
    access_token = token.create_access_token(data={"sub": db_user.username, "role": "user","id":db_user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}




# Feedback Submission
@router.post("/feedback")
def submit_feedback(feedback: schemas.FeedbackCreate, db: Session = Depends(get_db), current_user: schemas.UserLogin = Depends(oauth2.get_current_user)):
    if current_user.role != "user":
        raise HTTPException(status_code=403, detail="Only users can submit feedback")

    # Check if the user exists
    user = db.query(models.User).filter(models.User.id == feedback.user_id).first()
    if not user:
        raise HTTPException(status_code=403, detail="User not found")

    # Valid feedback types
    valid_feedback_types = [
        "network_connectivity", "wifi_issue", "slow_internet", "no_signal", 
        "unstable_connection", "router_issue", "ISP_problem", "data_limit_exceeded",
        "packet_loss", "high_latency", "dns_issue", "network_outage"
    ]
    if feedback.feedback_type not in valid_feedback_types:
        raise HTTPException(status_code=400, detail="Invalid feedback type")

    # Ensure necessary details for network connectivity issues
    if feedback.feedback_type == "network_connectivity" and not feedback.issue_description:
        raise HTTPException(status_code=400, detail="Description for network connectivity issue is required")

    # Ensure user location and issue details are provided
    if feedback.feedback_type == "network_connectivity":
        if not feedback.user_location:
            raise HTTPException(status_code=400, detail="User location is required")
        if not feedback.issue_details:
            raise HTTPException(status_code=400, detail="Issue description is required")
    
    # Create feedback record
    db_feedback = models.Feedback(**feedback.dict())

    db.add(db_feedback)
    db.commit()
    db.refresh(db_feedback)

    return {"detail": "Feedback submitted successfully"}



@router.get("/dashboard", response_model=schemas.DashboardData)
async def get_dashboard(db: Session = Depends(get_db), current_user: schemas.TokenData = Depends(oauth2.get_current_user)):
    try:
        print(f"Dashboard request for user ID: {current_user.id}")
        
        # Fetch all feedbacks without filtering by user_id
        feedbacks = db.query(models.Feedback).all()
        
        # Format feedbacks with all required fields
        feedback_list = []
        for feedback in feedbacks:
            feedback_dict = {
                "feedback_id": feedback.id,  # Changed from user_id to id
                "user_id": feedback.user_id,  # Added missing required field
                "feedback_type": feedback.feedback_type,  # Added missing required field
                "issue_description": feedback.issue_description,
                "issue_details": feedback.issue_details,  # Added missing required field
                "user_location": feedback.user_location,
                "repair_contacted": feedback.repair_contacted,  # Added missing required field
                "status": "pending"  # Default status
            }
            feedback_list.append(feedback_dict)

        # Get user for location (still needed for user location)
        user = db.query(models.User).filter(models.User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Get nearby schools
        nearby_schools = []  # Empty list for now
        
        return {
            "feedbacks": feedback_list,
            "nearby_schools": nearby_schools
        }

    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )



@router.get("/profile", response_model=schemas.UserOut)
def get_user_profile(current_user: schemas.TokenData = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user



@router.put("/profile", response_model=schemas.UserOut)
def update_user_profile(user_data: schemas.UserCreate, current_user: schemas.TokenData = Depends(oauth2.get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = user_data.username
    user.location = user_data.location
    user.contact_number = user_data.contact_number
    user.address = user_data.address

    db.commit()
    db.refresh(user)
    return user