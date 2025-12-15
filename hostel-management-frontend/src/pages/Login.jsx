import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, user } = useAuth();
  const history = useHistory();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      // Redirect based on role
      const u = user || JSON.parse(localStorage.getItem('user'))?.user;
      if (u?.role === 'admin') history.push('/admin');
      else history.push('/student');
    } catch (err) {
      console.error('Login failed:', err);
      // Try to display server-provided message when available
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>
          </div>
        </div>
        <div className="login-decoration">
          <div className="decoration-shape shape-1"></div>
          <div className="decoration-shape shape-2"></div>
          <div className="decoration-shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
