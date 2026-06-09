import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
    window.location.reload();
  };

  return (
    <nav style={{
      background: '#141414', padding: '14px 0',
      borderBottom: '1px solid #222', position: 'sticky', top: 0, zIndex: 100
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: 800, color: '#e50914' }}>
          🎬 MovieLog
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/movies" style={{ color: '#ccc', fontSize: 14 }}>영화</Link>
          {token ? (
            <>
              <Link to="/watchlist" style={{ color: '#ccc', fontSize: 14 }}>내 찜목록</Link>
              <span style={{ color: '#888', fontSize: 14 }}>{username}님</span>
              <button onClick={logout} style={{ background: '#333', color: '#eee', padding: '6px 14px' }}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{ background: '#333', color: '#eee', padding: '6px 14px' }}>로그인</button>
              </Link>
              <Link to="/register">
                <button style={{ background: '#e50914', color: '#fff', padding: '6px 14px' }}>회원가입</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
