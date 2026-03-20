import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authApi } from '../api/auth.api';
import { setAuth } from '../store/authSlice';
import '../styles/auth.css';

function redirectByRole(role) {
  switch (role) {
    case 'ADMIN':    return '/admin/dashboard';
    case 'KITCHEN':  return '/kitchen';
    case 'DELIVERY': return '/delivery';
    default:         return '/menu';
  }
}

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const user      = useSelector((s) => s.auth.user);

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect already-logged-in users inside useEffect
  useEffect(() => {
    if (user) {
      navigate(redirectByRole(user.role), { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      dispatch(setAuth({ token: res.data.accessToken, user: res.data.user }));
      navigate(redirectByRole(res.data.user.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo">☕</span>
          <h1 className="auth-title">Mini-Dine</h1>
          <p className="auth-tagline">Good food, warm hearts.</p>
        </div>
        <div className="auth-deco" />
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email"
                autoComplete="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input id="password" name="password" type="password"
                autoComplete="current-password" placeholder="••••••••"
                value={form.password} onChange={handleChange} />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
