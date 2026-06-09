from sqlalchemy import Column, Integer, String, Text, Numeric, ForeignKey, TIMESTAMP, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(100), unique=True, nullable=False)
    username   = Column(String(50), unique=True, nullable=False)
    password   = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    reviews   = relationship("Review", back_populates="user", cascade="all, delete")
    watchlist = relationship("Watchlist", back_populates="user", cascade="all, delete")
    likes     = relationship("Like", back_populates="user", cascade="all, delete")

class Genre(Base):
    __tablename__ = "genres"
    id   = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)

class Movie(Base):
    __tablename__ = "movies"
    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(200), nullable=False)
    director     = Column(String(100))
    release_year = Column(Integer)
    description  = Column(Text)
    poster_url   = Column(String(500))
    avg_rating   = Column(Numeric(3, 2), default=0.00)
    created_at   = Column(TIMESTAMP, server_default=func.now())

    reviews      = relationship("Review", back_populates="movie", cascade="all, delete")
    watchlist    = relationship("Watchlist", back_populates="movie", cascade="all, delete")
    movie_genres = relationship("MovieGenre", back_populates="movie", cascade="all, delete")

class MovieGenre(Base):
    __tablename__ = "movie_genres"
    movie_id = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True)
    genre_id = Column(Integer, ForeignKey("genres.id", ondelete="CASCADE"), primary_key=True)
    movie    = relationship("Movie", back_populates="movie_genres")
    genre    = relationship("Genre")

class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (
        UniqueConstraint("user_id", "movie_id"),
        CheckConstraint("rating >= 0.5 AND rating <= 5.0"),
    )
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    movie_id   = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), nullable=False)
    rating     = Column(Numeric(2, 1), nullable=False)
    content    = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user  = relationship("User", back_populates="reviews")
    movie = relationship("Movie", back_populates="reviews")
    likes = relationship("Like", back_populates="review", cascade="all, delete")

class Watchlist(Base):
    __tablename__ = "watchlist"
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    movie_id   = Column(Integer, ForeignKey("movies.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user  = relationship("User", back_populates="watchlist")
    movie = relationship("Movie", back_populates="watchlist")

class Like(Base):
    __tablename__ = "likes"
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    review_id  = Column(Integer, ForeignKey("reviews.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user   = relationship("User", back_populates="likes")
    review = relationship("Review", back_populates="likes")
