import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sort, setSort] = useState('latest');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', director: '', release_year: '', description: '', genre_ids: []
  });
  const [formError, setFormError] = useState('');
  const token = localStorage.getItem('token');

  const fetchMovies = async () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genreId) params.append('genre_id', genreId);
    params.append('sort', sort);
    const res = await api.get(`/movies/?${params}`);
    setMovies(res.data);
  };

  useEffect(() => {
    fetchMovies();
    api.get('/genres/').then(r => setGenres(r.data));
  }, []);

  const submitMovie = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/movies/', {
        ...form,
        release_year: form.release_year ? parseInt(form.release_year) : null,
        genre_ids: form.genre_ids.map(Number),
      });
      setForm({ title: '', director: '', release_year: '', description: '', genre_ids: [] });
      setShowForm(false);
      fetchMovies();
    } catch (err) {
      setFormError(err.response?.data?.detail || '영화 등록 실패');
    }
  };

  const toggleGenre = (id) => {
    setForm(prev => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(id)
        ? prev.genre_ids.filter(g => g !== id)
        : [...prev.genre_ids, id]
    }));
  };

  return (
    <div className="container" style={{ padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 28 }}>🎬 영화 목록</h2>
        {token && (
          <button onClick={() => setShowForm(!showForm)}
            style={{ background: showForm ? '#333' : '#e50914', color: '#fff', padding: '10px 20px' }}>
            {showForm ? '✕ 닫기' : '+ 영화 등록'}
          </button>
        )}
      </div>

      {/* 영화 등록 폼 */}
      {showForm && (
        <div style={{
          background: '#1a1a1a', borderRadius: 12, padding: 24, marginBottom: 32,
          border: '1px solid #333'
        }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>새 영화 등록</h3>
          <form onSubmit={submitMovie}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <input placeholder="영화 제목 *" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
              <input placeholder="감독" value={form.director}
                onChange={e => setForm({ ...form, director: e.target.value })} />
              <input placeholder="개봉 연도 (예: 2024)" type="number"
                value={form.release_year}
                onChange={e => setForm({ ...form, release_year: e.target.value })} />
            </div>
            <textarea placeholder="영화 소개" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ marginBottom: 12 }} />
            <div style={{ marginBottom: 16 }}>
              <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>장르 선택:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {genres.map(g => (
                  <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                    style={{
                      background: form.genre_ids.includes(g.id) ? '#e50914' : '#2a2a2a',
                      color: '#fff', padding: '6px 14px', fontSize: 13
                    }}>
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
            {formError && <p style={{ color: '#e50914', fontSize: 13, marginBottom: 8 }}>{formError}</p>}
            <button type="submit"
              style={{ background: '#e50914', color: '#fff', padding: '10px 28px' }}>
              등록하기
            </button>
          </form>
        </div>
      )}

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
                <p style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>
                  {movie.director} · {movie.release_year}
                </p>
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

      {movies.length === 0 && (
        <p style={{ color: '#555', textAlign: 'center', marginTop: 60 }}>
          등록된 영화가 없습니다.
        </p>
      )}
    </div>
  );
}
