import { useApp } from "../context/AppContext";

export default function History() {
  const { currentUser, logs, allWorkouts, deleteLog, activeGroupId, activeGroup } = useApp();

  const myLogs = currentUser.isAdmin
    ? [...logs].filter(l => l.groupId === activeGroupId).sort((a, b) => b.ts - a.ts)
    : [...logs].filter(l => l.userId === currentUser.id && l.groupId === activeGroupId).sort((a, b) => b.ts - a.ts);

  // dedupe for display (one entry per ts since multi-group creates duplicates)
  const seen = new Set();
  const dedupedLogs = currentUser.isAdmin ? myLogs : myLogs.filter(l => {
    const key = `${l.userId}_${l.ts}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const getWorkout = id => allWorkouts.find(w => w.id === id);

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>HISTORY</div>
      {activeGroup && <div style={{ fontSize: 12, color: "#f97316", fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>{activeGroup.name}{currentUser.isAdmin ? " · All players" : ""}</div>}

      {dedupedLogs.length === 0 && (
        <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60 }}>No workouts logged yet</div>
      )}

      {dedupedLogs.map(log => {
        const w = getWorkout(log.workoutId);
        return (
          <div key={log.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 26 }}>{w?.icon || "💪"}</span>
              <div>
                <div style={{ fontSize: 17, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{log.workoutName}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                  {currentUser.isAdmin && <span style={{ color: "#f97316" }}>{log.username} · </span>}
                  {log.amount} {log.unit} · {log.date}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 22, color: "#f97316", fontFamily: "'Bebas Neue', sans-serif" }}>+{log.points}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>PTS</div>
              </div>
              {(currentUser.isAdmin || log.userId === currentUser.id) && (
                <button onClick={() => deleteLog(log.id)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 16, padding: 4 }}
                  onMouseEnter={e => e.target.style.color = "#ef4444"}
                  onMouseLeave={e => e.target.style.color = "#333"}
                >✕</button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
