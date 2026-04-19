'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ArrowUpRight } from 'lucide-react';

function WMonogram({ size = 28 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" fill="none">
        <path d="M5 8 L10 24" /><path d="M14 8 L11 24" />
        <path d="M14 8 L19 24" /><path d="M23 8 L20 24" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const res = await login(form.email, form.password);
    setSubmitting(false);
    if (!res.success) { setError(res.message || 'Invalid credentials'); return; }
    router.push('/');
  };

  return (
    <div className="login-shell">
      {/* Left — dark panel */}
      <div className="login-side">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}>
            <WMonogram size={22} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--fs-display)', fontWeight: 500, fontSize: 18 }}>Walia Batteries</div>
            <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Service · Admin</div>
          </div>
        </div>

        <div className="login-quote">
          "A warranty is a promise, quietly kept. We built this tool so keeping it feels effortless."
          <div style={{ fontFamily: 'var(--fs-sans)', fontSize: 12.5, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>
            — Service Team, Walia HQ
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)' }}>v1.0 · 2026</div>
      </div>

      {/* Right — form */}
      <div className="login-form">
        <div style={{ maxWidth: 360, width: '100%', margin: '0 auto' }}>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>
            Sign in
          </div>
          <h1 className="page-title" style={{ fontSize: 30, marginBottom: 8 }}>Welcome back.</h1>
          <p className="page-sub" style={{ marginBottom: 28 }}>Use your work email to continue.</p>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bad-soft)', color: 'var(--bad)', borderRadius: 8, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@walia.in"
                required
              />
            </div>
            <div className="field">
              <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                Password
                <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 11.5 }}>Forgot?</span>
              </label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn primary" disabled={submitting} style={{ justifyContent: 'center', marginTop: 8 }}>
              {submitting ? 'Signing in…' : <>Sign in <ArrowUpRight size={13} strokeWidth={1.75} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
