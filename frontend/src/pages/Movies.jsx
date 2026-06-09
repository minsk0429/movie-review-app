import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sort, setSort] = useState('latest');

  const fetchMovies = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genreId) params.append('genre_id', genreId);
    params.append('sort', sort);
    const res = await api.get(`/movies/?${params}`);
    setMovies(res.data);
  };

  useEffect(() => {
    api.get('/movies/').then(r => setMovies(r.data));
    fetch('http://localhost:8000/movies/')
      .then(r => r.json())
      .then(() => {
        api.get('/movies/').then(r => {
          const allGenres = [];
          r.data.forEach(m => m.genres.forEach(g => {
            if (!allGenres.find(x => x.id === g.id)) allGenres.push(g);
          }));
          setGenres(allGenres);
        });
      });
  }, []);

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <h2 style={{ fontSize: 28, marginBottom: 24 }}>🎬 영화 목록</h2>

      {/* 검색/필터 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <input placeholder="영화 검색..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }} />
        <select value={genreId} onChange={e => setGenreId(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, background: '#1a1a1a', color: '#eee', border: '1px solid #333' }}>
          <option value="">전체 장르</option>
          {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 8, background: '#1a1a1a', color: '#eee', border: '1px solid #333' }}>
          <option value="latest">최신순</option>
          <option value="rating">평점순</option>
        </select>
        <button onClick={fetchMovies} style={{ background: '#e50914', color: '#fff' }}>검색</button>
      </div>

      {/* 영화 카드 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
        {movies.map(movie => (
          <Link to={`/movies/${movie.id}`} key={movie.id}>
            <div style={{
              background: '#1a1a1a', borderRadius: 10, overflow: 'hidden',
              transition: 'transform 0.2s', cursor: 'pointer'
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{
                height: 260, background: '#2a2a2a', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 48
              }}>
                🎬
              </div>
              <div style={{ padding: '14px' }}>
                <h3 style={{ fontSize: 15, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {movie.title}
                </h3>
                <p style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{movie.director} · {movie.release_year}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#f5c518', fontSize: 13 }}>⭐ {movie.avg_rating?.toFixed(1) || '0.0'}</span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {movie.genres.slice(0, 2).map(g => (
                      <span key={g.id} style={{
                        background: '#2a2a2a', color: '#aaa',
                        fontSize: 10, padding: '2px 6px', borderRadius: 4
                      }}>{g.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
