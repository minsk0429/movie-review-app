from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(prefix="/movies/{movie_id}/reviews", tags=["reviews"])

@router.get("/", response_model=List[schemas.ReviewResponse])
def get_reviews(movie_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.movie_id == movie_id).all()
    result = []
    for r in reviews:
        like_count = db.query(func.count(models.Like.review_id)).filter(
            models.Like.review_id == r.id
        ).scalar()
        result.append({
            "id": r.id, "user_id": r.user_id, "movie_id": r.movie_id,
            "rating": float(r.rating), "content": r.content,
            "created_at": r.created_at, "username": r.user.username,
            "like_count": like_count,
        })
    return result

@router.post("/", response_model=schemas.ReviewResponse)
def create_review(
    movie_id: int,
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
    if not movie:
        raise HTTPException(status_code=404, detail="영화를 찾을 수 없습니다.")
    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.movie_id == movie_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 리뷰를 작성했습니다.")

    try:
        # ── Isolation Level: REPEATABLE READ 설정 ──────────────────
        # 동일 트랜잭션 내에서 avg_rating을 두 번 읽어도 일관된 값을 보장
        # Non-Repeatable Read 방지 → 정확한 평균 평점 계산 보장
        db.execute(text("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ"))

        # ── 트랜잭션 시작 ───────────────────────────────────────────
        # 1) 리뷰 저장
        review = models.Review(
            user_id  = current_user.id,
            movie_id = movie_id,
            rating   = review_in.rating,
            content  = review_in.content,
        )
        db.add(review)
        db.flush()  # review.id 확보 (아직 커밋 전)

        # 2) 평균 평점 업데이트
        # 리뷰 저장 + avg_rating 갱신이 하나의 트랜잭션으로 처리됨
        # → 둘 중 하나만 성공하는 상황 방지 (원자성 보장)
        avg = db.query(func.avg(models.Review.rating)).filter(
            models.Review.movie_id == movie_id
        ).scalar()
        movie.avg_rating = round(float(avg), 2)

        db.commit()
        # ── 트랜잭션 종료 ───────────────────────────────────────────

        db.refresh(review)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"리뷰 저장 중 오류: {str(e)}")

    return {
        "id": review.id, "user_id": review.user_id, "movie_id": review.movie_id,
        "rating": float(review.rating), "content": review.content,
        "created_at": review.created_at, "username": current_user.username,
        "like_count": 0,
    }

@router.delete("/{review_id}")
def delete_review(
    movie_id: int,
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    review = db.query(models.Review).filter(
        models.Review.id == review_id,
        models.Review.user_id == current_user.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="리뷰를 찾을 수 없습니다.")
    try:
        # ── Isolation Level: REPEATABLE READ 설정 ──────────────────
        db.execute(text("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ"))

        # ── 트랜잭션: 리뷰 삭제 + 평균 평점 재계산 ─────────────────
        db.delete(review)
        db.flush()
        avg = db.query(func.avg(models.Review.rating)).filter(
            models.Review.movie_id == movie_id
        ).scalar()
        movie = db.query(models.Movie).filter(models.Movie.id == movie_id).first()
        movie.avg_rating = round(float(avg), 2) if avg else 0.00
        db.commit()
        # ── 트랜잭션 종료 ───────────────────────────────────────────
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"삭제 중 오류: {str(e)}")
    return {"message": "리뷰가 삭제되었습니다."}

@router.post("/{review_id}/like")
def toggle_like(
    movie_id: int,
    review_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    existing = db.query(models.Like).filter(
        models.Like.user_id == current_user.id,
        models.Like.review_id == review_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "좋아요 취소"}
    like = models.Like(user_id=current_user.id, review_id=review_id)
    db.add(like)
    db.commit()
    return {"message": "좋아요"}
