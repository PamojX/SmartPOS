"use client";

import { useState } from "react";
import axios from "axios";
import "./login.css";

export default function LoginForm({ onLoginSuccess, setRole, onShowSignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      setRole(res.data.role);
      onLoginSuccess();
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="login-container">
      <div className="brand-header">
        <h1 className="brand-title">Navora Print House</h1>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-fields">
          <div className="field-group">
            <label htmlFor="username" className="field-label">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="field-input"
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password" className="field-label">Password</label>
            <div className="password-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="field-input password-input"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p className="error-text">{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="submit-button">
          {isLoading ? (
            <div className="loading-content">
              <svg className="loading-spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="spinner-fill" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="forgot-password">
          <a href="#" className="forgot-link">Forgot your password?</a>
        </div>
      </form>

      <div className="signup-option">
        <p className="signup-text">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="signup-link"
            onClick={onShowSignup}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit" }}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
