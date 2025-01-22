from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.get("/schools")
def get_schools(db: Session = Depends(get_db)):
    return db.query(models.School).all()