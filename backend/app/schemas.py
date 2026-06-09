from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ── 유저 ──────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# ── 장르 ──────────────────────────────────────
class GenreResponse(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

# ── 영화 ──────────────────────────────────────
class MovieCreate(BaseModel):
    title: str
    director: Optional[str] = None
    release_year: Optional[int] = None
    description: Optional[str] = None
    poster_url: Optional[str] = None
    genre_ids: Optional[List[int]] = []

class MovieResponse(BaseModel):
    id: int
    title: str
    director: Optional[str]
    release_year: Optional[int]
    description: Optional[str]
    poster_url: Optional[str]
    avg_rating: Optional[float]
    genres: List[GenreResponse] = []
    class Config:
        from_attributes = True

# ── 리뷰 ──────────────────────────────────────
class ReviewCreate(BaseModel):
    rating: float
    content: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    user_id: int
    movie_id: int
    rating: float
    content: Optional[str]
    created_at: datetime
    username: Optional[str] = None
    like_count: Optional[int] = 0
    class Config:
        from_attributes = True
