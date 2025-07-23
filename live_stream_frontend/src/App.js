import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import './App.css';

// Dummy logo for branding (can be replaced)
const BrandLogo = () => (
  <span className="brand-logo" style={{
    color: "var(--text-secondary)",
    fontWeight: 700,
    fontSize: "2rem",
    letterSpacing: "0.05em"
  }}>KAVIA Live</span>
);

// PUBLIC_INTERFACE
function App() {
  // YouTube live stream ID (replace with real ID or source from config/api)
  const YOUTUBE_LIVE_VIDEO_ID = '5qap5aO4i9A'; // Example: LoFi Girl (always live)

  const [theme, setTheme] = useState('dark');
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(80);

  // Placeholder for live status & view count (replace with backend/API)
  const [liveStatus] = useState("LIVE");
  const [activeViewers] = useState("--"); // Replace with backend poll

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(t => (t === 'light' ? 'dark' : 'light'));
  };

  // Player controls
  const onPlayerReady = (event) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
    if (isPlaying) event.target.playVideo();
    else event.target.pauseVideo();
  };

  const handlePlay = () => {
    if (player) player.playVideo();
    setIsPlaying(true);
  };
  const handlePause = () => {
    if (player) player.pauseVideo();
    setIsPlaying(false);
  };
  const handleVolume = (v) => {
    setVolume(v);
    if (player) player.setVolume(v);
  };

  // Responsive video sizing
  function getYouTubeOpts() {
    // Adjust height for mobile/desktop
    if (window.innerWidth < 600) {
      return { width: "100%", height: "220" };
    }
    return { width: "850", height: "478" }; // 16:9
  }

  return (
    <div className="App live-app">
      <header className="live-header">
        <div className="header-content">
          <BrandLogo />
          <div className="header-actions">
            {/* Placeholders for login, theme toggle */}
            <button className="theme-toggle" onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>
            <button className="login-btn" title="Log in (placeholder)">
              Login
            </button>
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
              className="video-player"
              iframeClassName="yt-iframe"
            />
            <div className={`live-indicator ${liveStatus === "LIVE" ? "on" : "off"}`}>
              <span className="dot" /> {liveStatus}
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
              <span role="img" aria-label="Volume">🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                className="volume-slider"
                onChange={e => handleVolume(Number(e.target.value))}
              />
            </label>
            <span className="viewer-info">
              <span role="img" aria-label="Viewers">👁‍🗨</span>
              {activeViewers} watching
            </span>
          </div>
        </section>
        <aside className="sidebar">
          {/* Future: live chat or stats */}
          <div className="placeholder-card">
            <div className="sidebar-title">Live Chat / Stats</div>
            <div className="sidebar-content">Coming soon!</div>
          </div>
        </aside>
      </main>
      <footer className="live-footer">
        <span>© {new Date().getFullYear()} KAVIA Live Platform</span>
      </footer>
    </div>
  );
}

export default App;
