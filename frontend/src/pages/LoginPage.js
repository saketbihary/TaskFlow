/**
 * Login Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@taskflow.com', password: 'admin123' });
    else setForm({ email: 'member@taskflow.com', password: 'member123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand">Task<span>Flow</span></div>
          <p>Sign in to your workspace</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email" name="email"
              placeholder="you@example.com"
              value={form.email} onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password" name="password"
              placeholder="••••••••"
              value={form.password} onChange={handleChange}
            />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={loading}
            style={{ justifyContent: 'center', marginTop: 4 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">Quick Demo Access</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary w-full" onClick={() => fillDemo('admin')}
            style={{ justifyContent: 'center', fontSize: '0.8rem' }}>
            👑 Fill Admin
          </button>
          <button className="btn btn-secondary w-full" onClick={() => fillDemo('member')}
            style={{ justifyContent: 'center', fontSize: '0.8rem' }}>
            👤 Fill Member
          </button>
        </div>

        <div className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
