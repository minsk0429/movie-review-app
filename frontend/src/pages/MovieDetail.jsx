import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({ rating: 5, content: '' });
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const token = localStorage.getItem('token');

  const fetchData = async () => {
    const [mRes, rRes] = await Promise.all([
      api.get(`/movies/${id}`),
      api.get(`/movies/${id}/reviews/`),
    ]);
    setMovie(mRes.data);
    setReviews(rRes.data);
  };

  const fetchWatchlist = async () => {
    if (!token) return;
    try {
      const res = await api.get('/watchlist/');
      setInWatchlist(res.data.some(m => m.id === parseInt(id)));
    } catch {}
  };

  useEffect(() => { fetchData(); fetchWatchlist(); }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/movies/${id}/reviews/`, form);
      setForm({ rating: 5, content: '' });
      fetchData(); // 평균 평점도 같이 갱신
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 작성 실패');
    }
  };

  const deleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제할까요?')) return;
    await api.delete(`/movies/${id}/reviews/${reviewId}`);
    fetchData();
  };

  const toggleLike = async (reviewId) => {
    await api.post(`/movies/${id}/reviews/${reviewId}/like`);
    fetchData();
  };

  const toggleWatchlist = async () => {
    await api.post(`/watchlist/${id}`);
    fetchWatchlist();
  };

  if (!movie) return <div style={{ padding: 40, textAlign: 'center' }}>로딩 중...</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      {/* 영화 정보 */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
        <div style={{
          width: 200, height: 280, background: '#2a2a2a', borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 64, flexShrink: 0
        }}>🎬</div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>{movie.title}</h1>
          <p style={{ color: '#888', marginBottom: 4 }}>{movie.director} · {movie.release_year}</p>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {movie.genres.map(g => (
              <span key={g.id} style={{
                background: '#2a2a2a', color: '#aaa',
                fontSize: 12, padding: '4px 10px', borderRadius: 20
              }}>{g.name}</span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28, color: '#f5c518', fontWeight: 700 }}>
              ⭐ {movie.avg_rating?.toFixed(1) || '0.0'}
            </span>
            <span style={{ color: '#666', fontSize: 14 }}>({reviews.length}개 리뷰)</span>
          </div>
          <p style={{ color: '#ccc', lineHeight: 1.7, marginBottom: 20 }}>{movie.description}</p>
          {token && (
            <button onClick={toggleWatchlist} style={{
              background: inWatchlist ? '#333' : '#e50914', color: '#fff', padding: '10px 20px'
            }}>
              {inWatchlist ? '❤️ 찜 취소' : '🤍 찜하기'}
            </button>
          )}
        </div>
      </div>

      {/* 리뷰 작성 */}
      {token && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 24, marginBottom: 32 }}>
          <h3 style={{ marginBottom: 16 }}>리뷰 작성</h3>
          <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ color: '#888', fontSize: 14, whiteSpace: 'nowrap' }}>평점</label>
              <input type="number" min="0.5" max="5" step="0.5"
                value={form.rating} onChange={e => setForm({ ...form, rating: parseFloat(e.target.value) })}
                style={{ width: 80 }} />
              <span style={{ color: '#f5c518' }}>⭐</span>
            </div>
            <textarea placeholder="리뷰를 작성해주세요..." rows={4}
              value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
            {error && <p style={{ color: '#e50914', fontSize: 13 }}>{error}</p>}
            <button type="submit" style={{ background: '#e50914', color: '#fff', alignSelf: 'flex-start', padding: '10px 24px' }}>
              리뷰 등록
            </button>
          </form>
        </div>
      )}

      {/* 리뷰 목록 */}
      <h3 style={{ fontSize: 20, marginBottom: 16 }}>리뷰 ({reviews.length})</h3>
      {reviews.length === 0
        ? <p style={{ color: '#555' }}>아직 리뷰가 없습니다. 첫 번째 리뷰를 남겨보세요!</p>
        : reviews.map(r => (
          <div key={r.id} style={{
            background: '#1a1a1a', borderRadius: 10, padding: 20, marginBottom: 12
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{r.username}</span>
                <span style={{ color: '#f5c518', fontSize: 13 }}>⭐ {r.rating}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {token && (
                  <button onClick={() => toggleLike(r.id)}
                    style={{ background: '#2a2a2a', color: '#eee', padding: '4px 10px', fontSize: 12 }}>
                    ❤️ {r.like_count}
                  </button>
                )}
                {localStorage.getItem('username') === r.username && (
                  <button onClick={() => deleteReview(r.id)}
                    style={{ background: '#2a2a2a', color: '#888', padding: '4px 10px', fontSize: 12 }}>
                    삭제
                  </button>
                )}
              </div>
            </div>
            <p style={{ color: '#ccc', lineHeight: 1.6 }}>{r.content}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 8 }}>
              {new Date(r.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
        ))
      }
    </div>
  );
}
