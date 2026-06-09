-- 1. 회원
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(100) UNIQUE NOT NULL,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 2. 장르
CREATE TABLE genres (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) UNIQUE NOT NULL
);

-- 3. 영화
CREATE TABLE movies (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    director      VARCHAR(100),
    release_year  INTEGER,
    description   TEXT,
    poster_url    VARCHAR(500),
    avg_rating    NUMERIC(3,2) DEFAULT 0.00,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- 4. 영화-장르 (n:m)
CREATE TABLE movie_genres (
    movie_id   INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    genre_id   INTEGER REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre_id)
);

-- 5. 리뷰
CREATE TABLE reviews (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id    INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    rating      NUMERIC(2,1) CHECK (rating >= 0.5 AND rating <= 5.0),
    content     TEXT,
    created_at  TIMESTAMP DEFAULT NOW(),
    UNIQUE (user_id, movie_id)
);

-- 6. 찜하기
CREATE TABLE watchlist (
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    movie_id   INTEGER REFERENCES movies(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, movie_id)
);

-- 7. 리뷰 좋아요
CREATE TABLE likes (
    user_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    review_id  INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, review_id)
);

-- 8. 장르 샘플 데이터
INSERT INTO genres (name) VALUES
    ('액션'), ('로맨스'), ('공포'), ('코미디'),
    ('SF'), ('애니메이션'), ('드라마'), ('스릴러');

-- 9. 영화 샘플 데이터
INSERT INTO movies (title, director, release_year, description) VALUES
    ('인터스텔라', '크리스토퍼 놀란', 2014, '우주를 배경으로 한 SF 대작'),
    ('기생충', '봉준호', 2019, '두 가족의 이야기를 담은 사회 풍자극'),
    ('어벤져스: 엔드게임', '루소 형제', 2019, '마블 시네마틱 유니버스의 클라이맥스'),
    ('라라랜드', '데이미언 셔젤', 2016, '꿈을 쫓는 두 남녀의 로맨스'),
    ('올드보이', '박찬욱', 2003, '15년간 감금된 남자의 복수극');

-- 10. 영화-장르 샘플
INSERT INTO movie_genres (movie_id, genre_id) VALUES
    (1, 5), (1, 7),
    (2, 7), (2, 8),
    (3, 1), (3, 5),
    (4, 2), (4, 7),
    (5, 8), (5, 7);
