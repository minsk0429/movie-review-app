import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40
    }}>
      <h1 style={{ fontSize: 52, fontWeight: 900, marginBottom: 16 }}>
        🎬 <span style={{ color: '#e50914' }}>MovieLog</span>
      </h1>
      <p style={{ color: '#aaa', fontSize: 18, marginBottom: 40, maxWidth: 500 }}>
        영화를 보고 리뷰를 남기세요.<br />당신의 영화 기록을 쌓아가는 공간입니다.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link to="/movies">
          <button style={{ background: '#e50914', color: '#fff', padding: '12px 32px', fontSize: 16 }}>
            영화 둘러보기
          </button>
        </Link>
        <Link to="/register">
          <button style={{ background: '#333', color: '#fff', padding: '12px 32px', fontSize: 16 }}>
            시작하기
          </button>
        </Link>
      </div>
    </div>
  );
}
