import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', form.email);
      params.append('password', form.password);
      const res = await api.post('/users/login', params);
      localStorage.setItem('token', res.data.access_token);
      const me = await api.get('/users/me');
      localStorage.setItem('username', me.data.username);
      navigate('/movies');
      window.location.reload();
    } catch {
      setError('이메일 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 28, fontSize: 26 }}>로그인</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input placeholder="이메일" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="비밀번호" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        {error && <p style={{ color: '#e50914', fontSize: 13 }}>{error}</p>}
        <button type="submit" style={{ background: '#e50914', color: '#fff', padding: '12px' }}>
          로그인
        </button>
      </form>
      <p style={{ marginTop: 20, color: '#888', fontSize: 13, textAlign: 'center' }}>
        계정이 없으신가요? <Link to="/register" style={{ color: '#e50914' }}>회원가입</Link>
      </p>
    </div>
  );
}
