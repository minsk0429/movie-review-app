from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/movies", tags=["movies"])

def movie_to_response(movie: models.Movie) -> dict:
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
def get_movies(
    search: Optional[str] = Query(None),
    genre_id: Optional[int] = Query(None),
    sort: Optional[str] = Query("latest"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Movie)
    if search:
        query = query.filter(models.Movie.title.ilike(f"%{search}%"))
    if genre_id:
        query = query.join(models.MovieGenre).filter(models.MovieGenre.genre_id == genre_id)
    if sort == "rating":
        query = query.order_by(models.Movie.avg_rating.desc())
    else:
        query = query.order_by(models.Movie.created_at.desc())
    return [movie_to_response(m) for m in query.all()]

@router.get("/{movie_id}", response_model=schemas.MovieResponse)
def get_movie(movie_id: int, db: Session = Depends(get_db)):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="영화를 찾을 수 없습니다.")
    return movie_to_response(movie)

@router.post("/", response_model=schemas.MovieResponse)
def create_movie(
    movie_in: schemas.MovieCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    movie = models.Movie(
        title        = movie_in.title,
        director     = movie_in.director,
        release_year = movie_in.release_year,
        description  = movie_in.description,
        poster_url   = movie_in.poster_url,
    )
    db.add(movie)
    db.flush()
    for genre_id in movie_in.genre_ids:
        db.add(models.MovieGenre(movie_id=movie.id, genre_id=genre_id))
    db.commit()
    db.refresh(movie)
    return movie_to_response(movie)
