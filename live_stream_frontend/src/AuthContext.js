import React, { createContext, useState, useEffect } from "react";

// PUBLIC_INTERFACE
export const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAuthenticated: false,
  loading: true,
});

/**
 * AuthProvider wraps components in an authentication context,
 * handles login/signup via backend, manages JWT tokens in localStorage,
 * and exposes authentication state/handlers to children.
 */
// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("jwt_token");
    const storedUser = localStorage.getItem("jwt_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Persist token/user on change
  useEffect(() => {
    if (token && user) {
      localStorage.setItem("jwt_token", token);
      localStorage.setItem("jwt_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("jwt_user");
    }
  }, [token, user]);

  // PUBLIC_INTERFACE
  async function login({ username, password }) {
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.detail || "Login failed");
      }
      const data = await resp.json();
      setToken(data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // PUBLIC_INTERFACE
  async function signup({ username, email, password }) {
    try {
      const resp = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(
          data.detail ||
            (data?.message ? data.message : "Signup failed")
        );
      }
      const data = await resp.json();
      setToken(data.access_token);
      setUser(data.user);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // PUBLIC_INTERFACE
  function logout() {
    setToken(null);
    setUser(null);
    // Optional: You could also call a backend endpoint to revoke tokens
  }

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, isAuthenticated, loading, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}
