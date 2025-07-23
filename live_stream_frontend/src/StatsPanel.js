import React, { useEffect, useState } from "react";

/**
 * StatsPanel component shows real-time backend metrics (active viewers, sessions, users etc).
 * Fetches /api/metrics every 10 seconds by default.
 *
 * Usage:
 *   <StatsPanel />
 */

// PUBLIC_INTERFACE
export function StatsPanel({ pollInterval = 10000 }) {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    let intervalId;

    async function fetchMetrics() {
      setLoading(true);
      setError("");
      try {
        const resp = await fetch("/api/metrics");
        if (!resp.ok) throw new Error("Failed to fetch metrics");
        const data = await resp.json();
        if (isMounted) {
          setMetrics(data);
          setLastUpdate(new Date());
        }
      } catch (e) {
        if (isMounted) {
          setError("Unable to load metrics");
          setMetrics(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMetrics();
    intervalId = setInterval(fetchMetrics, pollInterval);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollInterval]);

  return (
    <div className="placeholder-card" style={{ minHeight: 135 }}>
      <div className="sidebar-title" style={{ marginBottom: 3 }}>
        Live Platform Stats
      </div>
      <div className="sidebar-content" style={{ fontSize: "0.96em" }}>
        {loading && !metrics ? (
          <span>Loading metrics…</span>
        ) : error ? (
          <span style={{ color: "var(--accent, #ff3131)" }}>{error}</span>
        ) : metrics ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li>
              <span style={{ fontWeight: 600 }}>👁️ Viewers:</span>{" "}
              <span style={{ color: "var(--text-primary, #fff)", fontWeight: 500 }}>
                {metrics.total_active_viewers}
              </span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>🟢 Sessions:</span>{" "}
              <span>{metrics.total_sessions}</span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>🗂 Events:</span>{" "}
              <span>{metrics.total_stats}</span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>👤 Users:</span>{" "}
              <span>{metrics.total_users}</span>
            </li>
            <li>
              <span style={{ fontWeight: 600 }}>🔗 Backend:</span>{" "}
              <span style={{ color: metrics.db_ok ? 'var(--text-secondary)' : 'var(--accent, #ff3131)' }}>
                {metrics.db_ok ? "OK" : "Issue"}
              </span>
              {metrics.health ? (
                <span style={{ marginLeft: 6, color: "#888", fontSize: "0.90em" }}>
                  {metrics.health}
                </span>
              ) : null}
            </li>
            <li style={{ fontSize: ".86em", color: "#aaa", marginTop: 3 }}>
              <span>
                Last updated:{" "}
                {lastUpdate ? lastUpdate.toLocaleTimeString() : "--"}
              </span>
            </li>
          </ul>
        ) : (
          <span>No stats available.</span>
        )}
      </div>
    </div>
  );
}

export default StatsPanel;
