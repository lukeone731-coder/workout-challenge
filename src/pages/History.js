import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function History() {
  const { currentUser, logs, allWorkouts, deleteLog, activeGroupId, activeGroup } = useApp();
  const [deleting, setDeleting] = useState(null);

  const myLogs = logs
    .filter(l => l.group_id === activeGroupId && (currentUser.isAdmin || l.user_id === currentUser.id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const getWorkout = id => allWorkouts.find(w => w.id === id);

  const handleDelete = async (log) => {
    setDeleting(log.id);
    await deleteLog(log);
    setDeleting(null);
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>HISTORY</div>
      {activeGroup && <div style={{ fontSize: 12, color: "#f97316", fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>{activeGroup.name}{currentUser.isAdmin ? " · All players" : ""}</div>}
      {myLogs.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60 }}>No workouts logged yet</div>}
      {myLogs.map(log => {
        const w = getWorkout(log.workout_id);
        return (
          <div key={log.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 26 }}>{log.icon || w?.icon || "💪"}</span>
              <div>
                <div style={{ fontSize: 17, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{log.workout_name}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                  {currentUser.isAdmin && <span style={{ color: "#f97316" }}>{log.username} · </span>}
                  {log.amount} {log.unit} · {new Date(log.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, color: "#f97316", fontFamily: "'Bebas Neue', sans-serif" }}>+{log.points}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>PTS</div>
              </div>
              {(currentUser.isAdmin || log.user_id === currentUser.id) && (
                <button onClick={() => handleDelete(log)} disabled={deleting === log.id} style={{ background: "none", border: "none", color: deleting === log.id ? "#555" : "#333", cursor: "pointer", fontSize: 16, padding: 4 }}
                  onMouseEnter={e => e.target.style.color = "#ef4444"}
                  onMouseLeave={e => e.target.style.color = "#333"}
                >{deleting === log.id ? "..." : "✕"}</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
