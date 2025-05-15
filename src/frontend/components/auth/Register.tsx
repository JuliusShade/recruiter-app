import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { validatePassword } from "../../utils/passwordValidation";
import { Toast } from "../common/Toast";
import "../../styles/auth.css";

export const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const passwordValid = validatePassword(password);
  const allValid = Object.values(passwordValid).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!allValid) {
      setToast({ message: 'Password does not meet requirements.', type: 'error' });
      return;
    }
    if (password !== confirm) {
      setToast({ message: 'Passwords do not match.', type: 'error' });
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({ message: 'Registration successful! Please check your email to confirm your account.', type: 'success' });
      // Optionally clear form fields here
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
      <form className="auth-card" onSubmit={handleRegister} autoComplete="off">
        <h2>REGISTER</h2>
        {error && <div className="error">{error}</div>}
        <input
          className="auth-input"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="auth-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
          required
        />
        <PasswordChecklist password={password} touched={touched} />
        <input
          className="auth-input"
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <PasswordMatchIndicator password={password} confirm={confirm} />
        <button className="auth-btn" type="submit" disabled={!allValid || password !== confirm}>
          REGISTER
        </button>
        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Login here</Link>
        </div>
      </form>
    </div>
  );
};

// Helper component for password requirements
const PasswordChecklist: React.FC<{ password: string; touched: boolean }> = ({ password, touched }) => {
  const valid = validatePassword(password);
  const items = [
    { label: "At least 8 characters", valid: valid.length },
    { label: "One uppercase letter", valid: valid.uppercase },
    { label: "One number", valid: valid.number },
    { label: "One special character", valid: valid.special },
  ];
  return (
    <ul className="password-checklist">
      {items.map((item, i) => (
        <li key={i} className={item.valid ? "valid" : touched ? "invalid" : ""}>
          {item.valid ? "✅" : "❌"} {item.label}
        </li>
      ))}
    </ul>
  );
};

// Helper component for password match
const PasswordMatchIndicator: React.FC<{ password: string; confirm: string }> = ({ password, confirm }) => {
  if (!confirm) return null;
  if (password === confirm) {
    return <div className="password-match valid">✅ Passwords match</div>;
  }
  return <div className="password-match invalid">❌ Passwords do not match</div>;
};
