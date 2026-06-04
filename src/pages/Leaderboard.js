import { useApp } from "../context/AppContext";

const MEDAL = ["🥇", "🥈", "🥉"];
const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#ef4444"];

export default function Leaderboard() {
  const { users, logs, getPointsForUser } = useApp();

  const ranked = [...users]
    .map((u, i) => ({ ...u, points: getPointsForUser(u.id), color: COLORS[i % COLORS.length] }))
    .sort((a, b) => b.points - a.points);

  const maxPoints = Math.max(...ranked.map(u => u.points), 1);

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>STANDINGS</div>

      {ranked.length === 0 && (
        <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 60 }}>
          No players yet. Ask your admin to get started!
        </div>
      )}

      {ranked.map((u, i) => {
        const pct = (u.points / maxPoints) * 100;
        const userLogs = logs.filter(l => l.userId === u.id);
        const isTop = i === 0 && u.points > 0;
        return (
          <div key={u.id} style={{
            background: isTop ? "linear-gradient(135deg, #1a0e00, #111)" : "#111",
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
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{userLogs.length} workout{userLogs.length !== 1 ? "s" : ""} logged</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, color: u.color, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>{u.points}</div>
                <div style={{ fontSize: 10, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>PTS</div>
              </div>
            </div>
            <div style={{ background: "#1a1a1a", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${u.color}88, ${u.color})`, borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
