import { useState } from "react";
import { useApp } from "../context/AppContext";

const MEDAL = ["🥇","🥈","🥉"];
const COLORS = ["#f97316","#3b82f6","#22c55e","#a855f7","#ec4899","#14b8a6","#eab308","#ef4444"];

export default function Leaderboard() {
  const { logs, groups, activeGroup, activeGroupId, setActiveGroupId, getPointsForUser, getUsersInGroup, currentUser } = useApp();
  const [profileUser, setProfileUser] = useState(null);

  const userGroups = currentUser.isAdmin ? groups : groups.filter(g => (currentUser.groupIds || []).includes(g.id));
  const groupUsers = activeGroup ? getUsersInGroup(activeGroup.id) : [];
  const ranked = [...groupUsers]
    .map((u, i) => ({ ...u, points: getPointsForUser(u.id, activeGroupId), color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...ranked.map(u => u.points), 1);

  if (profileUser) {
    const userLogs = logs.filter(l => l.user_id === profileUser.id && l.group_id === activeGroupId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return (
      <div style={{ padding: "0 16px" }}>
        <button onClick={() => setProfileUser(null)} style={{ background: "none", border: "none", color: "#f97316", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 14, marginBottom: 16, padding: 0 }}>← Back</button>
        <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, marginBottom: 2 }}>{profileUser.username}</div>
        <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>{userLogs.length} workouts · {activeGroup?.name}</div>
        {userLogs.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40 }}>No workouts logged yet</div>}
        {userLogs.map(log => (
          <div key={log.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 26 }}>{log.icon}</span>
              <div>
                <div style={{ fontSize: 17, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{log.workout_name}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{log.amount} {log.unit} · {new Date(log.created_at).toLocaleDateString()}</div>
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

      {!activeGroup && <div style={{ color: "#444", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60, fontSize: 14 }}>Join a group to see standings!</div>}

      {ranked.map((u, i) => {
        const pct = (u.points / maxPoints) * 100;
        const count = logs.filter(l => l.user_id === u.id && l.group_id === activeGroupId).length;
        const isTop = i === 0 && u.points > 0;
        return (
          <button key={u.id} onClick={() => setProfileUser(u)} style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            background: isTop ? "linear-gradient(135deg,#1a0e00,#111)" : "#111",
            border: `1px solid ${isTop ? "#f97316" : "#1e1e1e"}`,
            borderRadius: 12, padding: 16, marginBottom: 12,
            boxShadow: isTop ? "0 0 20px rgba(249,115,22,0.15)" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{i < 3 ? MEDAL[i] : `${i + 1}.`}</span>
                <div>
                  <div style={{ fontSize: 22, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{count} workout{count !== 1 ? "s" : ""} · tap to view</div>
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
