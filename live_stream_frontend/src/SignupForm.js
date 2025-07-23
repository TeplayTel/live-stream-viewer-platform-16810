import React, { useState, useContext } from "react";
import { AuthContext } from "./AuthContext";

// PUBLIC_INTERFACE
export function SignupForm({ onSuccess, switchToLogin }) {
  const { signup } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (form.password !== form.confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await signup({
      username: form.username,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (res.success) {
      onSuccess && onSuccess();
    } else {
      setErr(res.error || "Signup failed");
    }
  }

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={submit}>
        <h2>Create an Account</h2>
        <label>
          Username
          <input
            type="text"
            required
            name="username"
            autoFocus
            value={form.username}
            autoComplete="username"
            onChange={handleChange}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
        </label>
        <label>
          Confirm Password
          <input
            type="password"
            required
            name="confirm"
            autoComplete="new-password"
            value={form.confirm}
            onChange={handleChange}
          />
        </label>
        {err ? <div className="auth-error">{err}</div> : null}
        <button disabled={loading} className="auth-btn" type="submit">
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link"
            tabIndex={0}
            onClick={switchToLogin}
          >
            Login
          </button>
        </div>
      </form>
    </div>
  );
}
