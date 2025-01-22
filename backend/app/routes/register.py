from fastapi import APIRouter , HTTPException , status , Depends
from sqlalchemy.orm import Session
from .. import database,models,schema, oauth2
from ..database import engine  
from .hashing import hash_password


get_db = database.get_db




def get_all_user(db:Session = Depends(get_db)):
    user = db.query(models.User).all()
    return user



def create_any_user(request: schema.User, db: Session = Depends(get_db),get_current_user : int = Depends(oauth2.get_current_user)):
    hashed_password = hash_password(request.password)
    request.password = hashed_password
    new_user = models.User(**request.dict()) 
    db.add(new_user)
    db.commit()
    db.refresh(new_user) 
    return new_user

def get_user(db:Session = Depends(get_db),id = int):
    user = db.query(models.User).filter(models.User.id== id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
