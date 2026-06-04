import { useState } from "react";
import { useApp } from "../context/AppContext";

const MEDAL = ["🥇", "🥈", "🥉"];
const COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#ec4899","#14b8a6","#eab308","#ef4444"];

export default function Leaderboard() {
  const { users, logs, groups, activeGroup, activeGroupId, setActiveGroupId, getPointsForUser, getUsersInGroup, currentUser } = useApp();
  const [profileUser, setProfileUser] = useState(null);

  if (!activeGroup && groups.length === 0) {
    return (
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>STANDINGS</div>
        <div style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60, fontSize: 14 }}>
          No groups yet. Join a group using a code to get started!
        </div>
      </div>
    );
  }

  const userGroups = currentUser.isAdmin
    ? groups
    : groups.filter(g => (currentUser.groupIds || []).includes(g.id));

  const groupUsers = activeGroup ? getUsersInGroup(activeGroup.id) : [];
  const ranked = [...groupUsers]
    .map((u, i) => ({ ...u, points: getPointsForUser(u.id, activeGroupId), color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...ranked.map(u => u.points), 1);

  // Profile modal
  if (profileUser) {
    const userLogs = logs.filter(l => l.userId === profileUser.id && l.groupId === activeGroupId)
      .sort((a, b) => b.ts - a.ts);
    return (
      <div style={{ padding: "0 16px" }}>
        <button onClick={() => setProfileUser(null)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 16, padding: 0 }}>
          ← Back to leaderboard
        </button>
        <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginBottom: 4 }}>{profileUser.username}</div>
        <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>{userLogs.length} workouts in {activeGroup?.name}</div>

        {userLogs.length === 0 && (
          <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40 }}>No workouts logged yet</div>
        )}
        {userLogs.map(log => (
          <div key={log.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 26 }}>{log.icon}</span>
              <div>
                <div style={{ fontSize: 17, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{log.workoutName}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{log.amount} {log.unit} · {log.date}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 22, color: "#f97316", fontFamily: "'Bebas Neue', sans-serif" }}>+{log.points}</div>
              <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>PTS</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px" }}>
      {/* Group switcher */}
      {userGroups.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
          {userGroups.map(g => (
            <button key={g.id} onClick={() => setActiveGroupId(g.id)} style={{
              padding: "6px 14px", borderRadius: 20, border: `1px solid ${activeGroupId === g.id ? "#f97316" : "#222"}`,
              background: activeGroupId === g.id ? "#f97316" : "#111", color: activeGroupId === g.id ? "#fff" : "#555",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, whiteSpace: "nowrap", flexShrink: 0,
            }}>{g.name}</button>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>STANDINGS</div>
      {activeGroup && <div style={{ fontSize: 12, color: "#f97316", fontFamily: "'DM Sans', sans-serif", marginBottom: 16 }}>{activeGroup.name}</div>}

      {ranked.length === 0 && (
        <div style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60, fontSize: 14 }}>
          No members in this group yet
        </div>
      )}

      {ranked.map((u, i) => {
        const pct = (u.points / maxPoints) * 100;
        const userLogCount = logs.filter(l => l.userId === u.id && l.groupId === activeGroupId).length;
        const isTop = i === 0 && u.points > 0;
        return (
          <button key={u.id} onClick={() => setProfileUser(u)} style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            background: isTop ? "linear-gradient(135deg,#1a0e00,#111)" : "#111",
            border: `1px solid ${isTop ? "#f97316" : "#1e1e1e"}`,
            borderRadius: 12, padding: 16, marginBottom: 12,
            boxShadow: isTop ? "0 0 20px rgba(249,115,22,0.15)" : "none",
            animation: "slideIn 0.3s ease",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{i < 3 ? MEDAL[i] : `${i + 1}.`}</span>
                <div>
                  <div style={{ fontSize: 22, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{userLogCount} workout{userLogCount !== 1 ? "s" : ""} · tap to view</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, color: u.color, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>{u.points}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>PTS</div>
              </div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${u.color}88,${u.color})`, borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
