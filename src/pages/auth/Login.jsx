import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { signIn, signUp, signInWithGoogle, signInWithMagicLink, resetPassword } = useAuth();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);

  const validateEmail = (e) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e);

  function switchMode(m) {
    setMode(m);
    setError('');
    setInfo('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!validateEmail(email)) { setError('Please enter a valid email address'); return; }

    if (mode === 'signup') {
      if (!fullName.trim()) { setError('Please enter your full name'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    } else {
      if (!password) { setError('Please enter your password'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await signUp(email, password, fullName.trim());
        if (!data?.session) {
          setInfo('Account created! Please check your email to confirm your account, then sign in.');
          switchMode('signin');
        }
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  }

  async function handleMagicLink(e) {
    e.preventDefault();
    setError('');
    if (!validateEmail(magicEmail)) { setError('Please enter a valid email address'); return; }
    setMagicLoading(true);
    try {
      await signInWithMagicLink(magicEmail);
      setMagicSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setMagicLoading(false);
    }
  }

  async function handleForgot(e) {
    e.preventDefault();
    setError('');
    if (!validateEmail(resetEmail)) { setError('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      await resetPassword(resetEmail);
      setInfo('Password reset link sent! Check your email.');
      setShowForgot(false);
    } catch (err) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.6rem' }}>OurPICU</h2>
          <p className="text-muted" style={{ fontSize: '.85rem' }}>
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {info && <div className="alert alert-success">{info}</div>}

        {/* Mode toggle */}
        <div className="tabs" style={{ justifyContent: 'center', marginBottom: 18 }}>
          <button type="button" className={`tbtn ${mode === 'signin' ? 'active' : ''}`} onClick={() => switchMode('signin')}>Sign In</button>
          <button type="button" className={`tbtn ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullname">Full Name</label>
              <input id="fullname" type="text" className="form-input" placeholder="Dr. Jane Smith"
                value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="password" type={showPassword ? 'text' : 'password'} className="form-input"
                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required
                style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input id="confirm" type="password" className="form-input" placeholder="Re-enter your password"
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password" required />
            </div>
          )}

          {mode === 'signin' && (
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <button type="button" onClick={() => { setShowForgot(true); setResetEmail(email); setError(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '.8rem' }}>
                Forgot password?
              </button>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button onClick={handleGoogle} className="btn btn-ghost btn-block" disabled={loading}
          style={{ borderColor: 'var(--border)' }}>
          <span style={{ fontWeight: 700, color: '#DB4437', marginRight: 6 }}>G</span> Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleMagicLink}>
          <div className="form-group">
            <label className="form-label" htmlFor="magic-email">Sign in with Magic Link</label>
            <input id="magic-email" type="email" className="form-input" placeholder="you@example.com"
              value={magicEmail} onChange={(e) => setMagicEmail(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-blue btn-block" disabled={magicLoading}>
            {magicLoading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        {magicSent && (
          <div className="alert alert-success mt-2">✅ Check your email for the magic link!</div>
        )}
      </div>

      {/* Forgot password modal */}
      {showForgot && (
        <div className="modal-overlay open" onClick={(e) => { if (e.target === e.currentTarget) setShowForgot(false); }}>
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-head">
              <h3 style={{ fontSize: '1rem', fontFamily: 'DM Sans' }}>Reset Password</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowForgot(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-3">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleForgot}>
                <div className="form-group">
                  <input type="email" className="form-input" placeholder="you@example.com"
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} autoFocus />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
