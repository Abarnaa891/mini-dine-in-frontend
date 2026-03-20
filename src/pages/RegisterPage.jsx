import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authApi } from '../api/auth.api';
import { setAuth } from '../store/authSlice';
import '../styles/auth.css';

export default function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [errors, setErrors]       = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                                 errs.name     = 'Name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))   errs.email    = 'Enter a valid email.';
    if (form.password.length < 8)                          errs.password = 'Min 8 characters.';
    if (form.password !== form.confirm)                    errs.confirm  = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name: form.name.trim(), email: form.email, password: form.password };
      if (form.phone.trim()) payload.phone = form.phone.trim();
      const res = await authApi.register(payload);
      dispatch(setAuth({ token: res.data.accessToken, user: res.data.user }));
      navigate('/menu', { replace: true });
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration failed.');
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
          <p className="auth-tagline">Your table is waiting.</p>
        </div>
        <div className="auth-deco" />
      </div>

      <div className="auth-right">
        <div className="auth-card auth-card--register">
          <div className="auth-card-header">
            <h2>Create account</h2>
            <p>Join us and start ordering</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" placeholder="Your name"
                value={form.name} onChange={handleChange} />
              {errors.name && <span className="auth-field-error">{errors.name}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
              {errors.email && <span className="auth-field-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <label htmlFor="phone">Phone <span className="auth-optional">(optional)</span></label>
              <input id="phone" name="phone" type="tel" placeholder="9876543210"
                value={form.phone} onChange={handleChange} />
            </div>

            <div className="auth-row">
              <div className="auth-field">
                <label htmlFor="password">Password</label>
                <input id="password" name="password" type="password" placeholder="Min 8 chars"
                  value={form.password} onChange={handleChange} />
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>
              <div className="auth-field">
                <label htmlFor="confirm">Confirm password</label>
                <input id="confirm" name="confirm" type="password" placeholder="Repeat password"
                  value={form.confirm} onChange={handleChange} />
                {errors.confirm && <span className="auth-field-error">{errors.confirm}</span>}
              </div>
            </div>

            {serverError && <p className="auth-error">{serverError}</p>}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}