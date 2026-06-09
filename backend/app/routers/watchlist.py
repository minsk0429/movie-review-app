from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/watchlist", tags=["watchlist"])

def movie_to_response(movie):
    return {
        "id": movie.id,
        "title": movie.title,
        "director": movie.director,
        "release_year": movie.release_year,
        "description": movie.description,
        "poster_url": movie.poster_url,
        "avg_rating": float(movie.avg_rating) if movie.avg_rating else 0.0,
        "genres": [{"id": mg.genre.id, "name": mg.genre.name} for mg in movie.movie_genres],
    }

@router.get("/", response_model=List[schemas.MovieResponse])
def get_watchlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    items = db.query(models.Watchlist).filter(
        models.Watchlist.user_id == current_user.id
    ).all()
    return [movie_to_response(item.movie) for item in items]

@router.post("/{movie_id}")
def toggle_watchlist(
    movie_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = db.query(models.Watchlist).filter(
        models.Watchlist.user_id == current_user.id,
        models.Watchlist.movie_id == movie_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "찜 취소"}
    item = models.Watchlist(user_id=current_user.id, movie_id=movie_id)
    db.add(item)
    db.commit()
    return {"message": "찜 추가"}
