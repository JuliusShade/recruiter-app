import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/auth.css';
import { Toast } from '../common/Toast'; // Adjust the path as needed

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({ message: 'Login successful! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1200); // Short delay for user to see the toast
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard', // or your preferred redirect
      },
    });
    if (error) {
      setToast({ message: error.message, type: 'error' });
    }
  };

  return (
    <div className="auth-bg">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <form className="auth-card" onSubmit={handleLogin} autoComplete="off">
        <h2>LOGIN</h2>
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="off"
        />
        <div className="auth-checkbox-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={e => setRemember(e.target.checked)}
            id="remember"
          />
          <label htmlFor="remember" className="auth-checkbox-label">
            Remember me
          </label>
        </div>
        <button className="auth-btn" type="submit">LOGIN</button>
        <div className="auth-divider">Or login with</div>
        <div className="auth-social-btns">
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogleLogin}
          >
            <span>
              <svg width="18" height="18" viewBox="0 0 48 48" style={{ verticalAlign: 'middle', marginRight: 8 }}>
                <g>
                  <path fill="#4285F4" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.3-5.7 7-11.3 7-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/>
                  <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.3 16.1 18.7 13 24 13c2.7 0 5.2.9 7.2 2.4l6-6C34.5 5.1 29.5 3 24 3c-7.7 0-14.3 4.3-17.7 10.7z"/>
                  <path fill="#FBBC05" d="M24 43c5.3 0 10.3-1.8 14.1-4.9l-6.5-5.3C29.2 34.7 26.7 35.5 24 35.5c-5.6 0-10.3-3.7-12-8.7l-6.6 5.1C9.7 39.7 16.3 43 24 43z"/>
                  <path fill="#EA4335" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.1 3-3.5 5.2-6.3 6.5l6.5 5.3C40.3 39.7 44 32.7 44 24c0-1.3-.1-2.7-.4-4z"/>
                </g>
              </svg>
            </span>
            Google
          </button>
        </div>
        <div className="auth-footer">
          Not a member?
          <Link to="/register">Sign up now</Link>
        </div>
      </form>
    </div>
  );
};
