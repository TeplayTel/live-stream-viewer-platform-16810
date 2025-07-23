import React, { useState, useEffect, useContext } from "react";
import YouTube from "react-youtube";
import "./App.css";
import { AuthProvider, AuthContext } from "./AuthContext";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { StatsPanel } from "./StatsPanel";

const BrandLogo = () => (
  <span
    className="brand-logo"
    style={{
      color: "var(--text-secondary)",
      fontWeight: 700,
      fontSize: "2rem",
      letterSpacing: "0.05em",
    }}
  >
    KAVIA Live
  </span>
);

// PUBLIC_INTERFACE
function MainApp() {
  // YouTube live stream ID (replace with real ID or source from config/api)
  const YOUTUBE_LIVE_VIDEO_ID = "5qap5aO4i9A"; // Example: LoFi Girl (always live)
  const STREAM_ID = YOUTUBE_LIVE_VIDEO_ID; // Could be further generalized

  const [theme, setTheme] = useState("dark");
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);

  // Live status comes from server metrics (could fetch actual live stream status in future)
  const [liveStatus, setLiveStatus] = useState("LIVE");
  const [activeViewers, setActiveViewers] = useState("--");

  // For tracking user's watch session
  const [watchSessionId, setWatchSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Auth Modal UI state
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // or 'signup'

  // Auth context
  const { isAuthenticated, user, logout, loading, token } = useContext(AuthContext);

  // Update theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Fetch viewer statistics & live status
  useEffect(() => {
    // Can be refetched more frequently after "watch_start"/"watch_stop" for more immediate feedback
    async function fetchMetrics() {
      try {
        const resp = await fetch("/api/metrics");
        if (resp.ok) {
          const data = await resp.json();
          if (typeof data?.total_active_viewers === "number" || typeof data?.total_active_viewers === "string") {
            setActiveViewers(data.total_active_viewers);
            setLiveStatus("LIVE"); // Always live for demo; can map to backend "health" if needed
          } else {
            setActiveViewers("--");
            setLiveStatus("OFFLINE");
          }
        } else {
          setActiveViewers("--");
          setLiveStatus("OFFLINE");
        }
      } catch (e) {
        setActiveViewers("--");
        setLiveStatus("OFFLINE");
      }
    }
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  // --- Player controls and viewer event tracking ---

  // Helper: POST with JWT to backend
  async function postWithJwt(url, body) {
    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  // Start watching event (notify backend & store session_id)
  async function startWatching() {
    if (!(isAuthenticated && user && token && !watchSessionId)) return;
    try {
      const resp = await postWithJwt(
        `/api/stats/watch_start?user_id=${user.id}`,
        { stream_id: STREAM_ID }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data.id != null && data.started_at) {
          setWatchSessionId(data.id);
          setSessionStartTime(Date.now());
        }
      }
    } catch (e) {
      // Optionally, show error to user
    }
  }

  // Stop watching event (notify backend using session_id)
  async function stopWatching() {
    if (!(isAuthenticated && user && token && watchSessionId)) return;
    try {
      await postWithJwt(
        `/api/stats/watch_stop?session_id=${watchSessionId}&user_id=${user.id}`,
        {}
      );
      setWatchSessionId(null);
      setSessionStartTime(null);
    } catch (e) {
      // Optionally, show error to user
    }
  }

  // Track YouTube player ready/playing/pausing to fire backend events
  const onPlayerReady = (event) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
    if (isPlaying) {
      event.target.playVideo();
    } else {
      event.target.pauseVideo();
    }
    // Automatically start watching if authenticated and not already tracked
    if (isAuthenticated && !watchSessionId) {
      startWatching();
    }
  };

  // onPlay event: start session if applicable
  const onPlay = () => {
    setIsPlaying(true);
    if (isAuthenticated && !watchSessionId) {
      startWatching();
    }
  };

  // onPause event: stop session but only if we were watching
  const onPause = () => {
    setIsPlaying(false);
    if (isAuthenticated && watchSessionId) {
      stopWatching();
    }
  };

  // Manual buttons for play/pause
  const handlePlay = () => {
    if (player) player.playVideo();
    setIsPlaying(true);
    if (isAuthenticated && !watchSessionId) {
      startWatching();
    }
  };
  const handlePause = () => {
    if (player) player.pauseVideo();
    setIsPlaying(false);
    if (isAuthenticated && watchSessionId) {
      stopWatching();
    }
  };
  const handleVolume = (v) => {
    setVolume(v);
    if (player) player.setVolume(v);
  };

  // Track logout (stop session on manual logout event)
  useEffect(() => {
    if (!isAuthenticated && watchSessionId) {
      // If user logs out, stop their session
      stopWatching();
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  // Responsive video sizing
  function getYouTubeOpts() {
    if (window.innerWidth < 600) {
      return { width: "100%", height: "220" };
    }
    return { width: "850", height: "478" };
  }

  // Modal auth UI handlers
  function openLogin() {
    setAuthMode("login");
    setShowAuth(true);
  }
  function openSignup() {
    setAuthMode("signup");
    setShowAuth(true);
  }
  function closeAuth() {
    setShowAuth(false);
  }

  if (loading) {
    return (
      <div className="App live-app" style={{ textAlign: "center" }}>
        <div style={{ marginTop: "24vh", fontSize: "1.15rem" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="App live-app">
      <header className="live-header">
        <div className="header-content">
          <BrandLogo />
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "🌙 Dark" : "☀️ Light"}
            </button>
            {isAuthenticated ? (
              <>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    marginRight: 11,
                  }}
                >
                  Hello, {user.username}
                </span>
                <button className="login-btn" title="Log out" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="login-btn" onClick={openLogin} title="Login">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="live-main">
        <section className="player-section">
          <div className="video-wrapper">
            <YouTube
              videoId={YOUTUBE_LIVE_VIDEO_ID}
              opts={getYouTubeOpts()}
              onReady={onPlayerReady}
              onPlay={onPlay}
              onPause={onPause}
              className="video-player"
              iframeClassName="yt-iframe"
            />
            <div className={`live-indicator ${liveStatus === "LIVE" ? "on" : "off"}`}>
              <span className="dot" /> {liveStatus}
              {/* Show user's own watch state if authenticated */}
              {isAuthenticated && (
                <span style={{ marginLeft: 8, fontSize: ".98em", color: "#fff" }}>
                  {watchSessionId
                    ? "You are watching"
                    : "Not watching"}
                </span>
              )}
            </div>
          </div>
          <div className="player-controls">
            <button
              className="player-btn"
              onClick={handlePlay}
              aria-label="Play"
              disabled={isPlaying}
            >
              ▶
            </button>
            <button
              className="player-btn"
              onClick={handlePause}
              aria-label="Pause"
              disabled={!isPlaying}
            >
              ❚❚
            </button>
            <label className="volume-label">
              <span role="img" aria-label="Volume">
                🔊
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                className="volume-slider"
                onChange={(e) => handleVolume(Number(e.target.value))}
              />
            </label>
            <span className="viewer-info">
              <span role="img" aria-label="Viewers">
                👁‍🗨
              </span>
              {activeViewers} watching
            </span>
          </div>
        </section>
        <aside className="sidebar">
          <div className="placeholder-card">
            <div className="sidebar-title">
              {isAuthenticated ? "Live Chat / Stats" : "Join to participate!"}
            </div>
            <div className="sidebar-content">
              {isAuthenticated ? (
                <>
                  {watchSessionId
                    ? <span style={{color:"var(--text-primary)"}}>Watching session #{watchSessionId}</span>
                    : "Press ▶ to start watching and logging stats!"}
                  <br />
                  <span style={{fontSize:"0.98em", color:"var(--text-secondary)"}}>
                    Your viewing events will appear in your stats history soon.
                  </span>
                </>
              ) : (
                <>
                  <button
                    className="auth-btn"
                    style={{ marginBottom: 8 }}
                    onClick={openSignup}
                  >
                    Sign Up
                  </button>
                  <br />
                  <span>Sign in to chat and track your viewing stats.</span>
                </>
              )}
            </div>
          </div>
          {/* --- Live Metrics Panel --- */}
          <StatsPanel />
        </aside>
      </main>
      <footer className="live-footer">
        <span>© {new Date().getFullYear()} KAVIA Live Platform</span>
      </footer>

      {showAuth && (
        <div className="auth-modal-backdrop" onClick={closeAuth}>
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            {authMode === "login" ? (
              <LoginForm
                onSuccess={closeAuth}
                switchToSignup={() => setAuthMode("signup")}
              />
            ) : (
              <SignupForm
                onSuccess={closeAuth}
                switchToLogin={() => setAuthMode("login")}
              />
            )}
            <button
              className="auth-close"
              title="Close"
              onClick={closeAuth}
              style={{
                position: "absolute",
                top: 11,
                right: 11,
                background: "transparent",
                border: "none",
                fontSize: 19,
                color: "var(--accent, #ff3131)",
                cursor: "pointer",
              }}
              aria-label="Close"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// App root: wrap with AuthProvider for context
function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
