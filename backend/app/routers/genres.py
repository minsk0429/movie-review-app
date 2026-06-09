from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/genres", tags=["genres"])

@router.get("/", response_model=List[schemas.GenreResponse])
def get_genres(db: Session = Depends(get_db)):
    return db.query(models.Genre).order_by(models.Genre.id).all()
