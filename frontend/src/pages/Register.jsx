import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || '회원가입 실패');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: 28, fontSize: 26 }}>회원가입</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input placeholder="이메일" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="닉네임" value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })} required />
        <input placeholder="비밀번호" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        {error && <p style={{ color: '#e50914', fontSize: 13 }}>{error}</p>}
        <button type="submit" style={{ background: '#e50914', color: '#fff', padding: '12px' }}>
          가입하기
        </button>
      </form>
      <p style={{ marginTop: 20, color: '#888', fontSize: 13, textAlign: 'center' }}>
        이미 계정이 있으신가요? <Link to="/login" style={{ color: '#e50914' }}>로그인</Link>
      </p>
    </div>
  );
}
