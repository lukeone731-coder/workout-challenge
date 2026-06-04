import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function LogWorkout() {
  const { currentUser, allWorkouts, addLog } = useApp();
  const [workoutId, setWorkoutId] = useState(allWorkouts[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [flash, setFlash] = useState(null);

  const workout = allWorkouts.find(w => w.id === workoutId);
  const pts = workout && amount ? Math.floor(parseFloat(amount) / workout.threshold) : 0;

  const handle = () => {
    if (!workout || pts === 0) return;
    addLog({
      id: Date.now().toString(),
      userId: currentUser.id,
      username: currentUser.username,
      workoutId,
      workoutName: workout.name,
      icon: workout.icon,
      amount: parseFloat(amount),
      unit: workout.unit,
      points: pts,
      date: new Date().toLocaleDateString(),
      ts: Date.now(),
    });
    setFlash(pts);
    setAmount("");
    setTimeout(() => setFlash(null), 2500);
  };

  const sel = {
    width: "100%", padding: "12px 14px", background: "#111", border: "1px solid #222",
    borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    appearance: "none", outline: "none",
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>LOG WORKOUT</div>
      <div style={{ fontSize: 14, color: "#f97316", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
        Logging as <strong>{currentUser.username}</strong>
      </div>

      {flash !== null && (
        <div style={{ background: "linear-gradient(135deg,#0a2e0a,#111)", border: "1px solid #22c55e", borderRadius: 12, padding: 16, marginBottom: 16, textAlign: "center", animation: "slideIn 0.3s ease" }}>
          <div style={{ fontSize: 48, color: "#22c55e", fontFamily: "'Bebas Neue', sans-serif", lineHeight: 1 }}>+{flash}</div>
          <div style={{ color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>points earned!</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>WORKOUT</div>
          <select value={workoutId} onChange={e => setWorkoutId(e.target.value)} style={sel}>
            {allWorkouts.map(w => (
              <option key={w.id} value={w.id}>{w.icon} {w.name} — 1pt / {w.threshold} {w.unit}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
            {workout?.type === "reps" ? "REPS COMPLETED" : "MINUTES COMPLETED"}
          </div>
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder={workout?.type === "reps" ? "e.g. 50" : "e.g. 30"}
            style={{ ...sel, border: "1px solid #333" }}
            onKeyDown={e => e.key === "Enter" && handle()}
          />
        </div>

        {amount > 0 && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ color: "#555", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>Points to earn</div>
            <div style={{ fontSize: 32, color: pts > 0 ? "#f97316" : "#333", fontFamily: "'Bebas Neue', sans-serif" }}>{pts} pts</div>
          </div>
        )}

        <button onClick={handle} disabled={pts === 0} style={{
          width: "100%", padding: 14, background: pts > 0 ? "linear-gradient(135deg,#f97316,#ea580c)" : "#1a1a1a",
          border: "none", borderRadius: 10, color: pts > 0 ? "#fff" : "#333",
          fontSize: 20, letterSpacing: 2, cursor: pts > 0 ? "pointer" : "not-allowed",
          fontFamily: "'Bebas Neue', sans-serif", transition: "all 0.2s",
        }}>LOG WORKOUT</button>
      </div>
    </div>
  );
}
