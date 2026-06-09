import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Watchlist() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    api.get('/watchlist/').then(r => setMovies(r.data));
  }, []);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>❤️ 내 찜 목록</h2>
      {movies.length === 0
        ? <p style={{ color: '#555' }}>찜한 영화가 없습니다.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {movies.map(movie => (
              <Link to={`/movies/${movie.id}`} key={movie.id}>
                <div style={{ background: '#1a1a1a', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: 240, background: '#2a2a2a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48
                  }}>🎬</div>
                  <div style={{ padding: 14 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 4 }}>{movie.title}</h3>
                    <span style={{ color: '#f5c518', fontSize: 13 }}>⭐ {movie.avg_rating?.toFixed(1)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      }
    </div>
  );
}
