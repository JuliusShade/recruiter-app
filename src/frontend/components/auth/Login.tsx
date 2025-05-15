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
          <button type="button" className="auth-social-btn">
            <span>📘</span> Facebook
          </button>
          <button type="button" className="auth-social-btn">
            <span>🟦</span> Google
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
