from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, movies, reviews, watchlist

app = FastAPI(title="🎬 Movie Review API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(movies.router)
app.include_router(reviews.router)
app.include_router(watchlist.router)

@app.get("/")
def root():
    return {"message": "🎬 Movie Review API 서버 실행 중"}
