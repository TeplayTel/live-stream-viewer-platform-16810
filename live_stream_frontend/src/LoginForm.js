import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

// PUBLIC_INTERFACE
export function LoginForm({ onSuccess, switchToSignup }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login({ username, password });
    setLoading(false);
    if (res.success) {
      onSuccess && onSuccess();
    } else {
      setErr(res.error || "Login failed.");
    }
  }

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={submit} autoComplete="off">
        <h2>Sign In</h2>
        <label>
          Username or Email
          <input
            autoFocus
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {err ? <div className="auth-error">{err}</div> : null}
        <button disabled={loading} className="auth-btn" type="submit">
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="auth-switch">
          No account?{" "}
          <button
            type="button"
            className="auth-link"
            tabIndex={0}
            onClick={switchToSignup}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
