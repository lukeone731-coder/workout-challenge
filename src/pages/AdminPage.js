import { useState } from "react";
import { useApp } from "../context/AppContext";

const BASE_WORKOUT_IDS = ["burpees","pushups","situps","running","biking","pickleball","walking","golf"];

export default function AdminPage() {
  const { users, removeUser, allWorkouts, customWorkouts, addCustomWorkout, removeCustomWorkout } = useApp();
  const [section, setSection] = useState("players");
  const [newName, setNewName] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [aiError, setAiError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);

  const askAI = async () => {
    if (!newName.trim()) return;
    setAiLoading(true); setSuggestion(null); setAiError("");
    const list = allWorkouts.map(w => `${w.name}: 1pt per ${w.threshold} ${w.unit} (${w.type})`).join("\n");
    const prompt = `You are helping design a workout challenge point system. Existing workouts:\n${list}\n\nPoint philosophy:\n- Running 5 min = 1 pt (gold standard cardio)\n- Burpees 10 reps = 1 pt (high intensity)\n- Pushups 25 reps = 1 pt\n- Points reflect real health benefit and effort\n\nNew workout to add: "${newName}"\n\nRespond ONLY with a raw JSON object (no markdown, no backticks):\n{"type":"reps","threshold":20,"unit":"reps","icon":"🏊","rationale":"One sentence reason"}\nor\n{"type":"time","threshold":10,"unit":"min","icon":"🏊","rationale":"One sentence reason"}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();
      setSuggestion(JSON.parse(text));
    } catch { setAiError("Couldn't get a suggestion. Try again."); }
    setAiLoading(false);
  };

  const confirmAdd = () => {
    if (!suggestion) return;
    addCustomWorkout({
      id: newName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now(),
      name: newName.trim(), type: suggestion.type,
      threshold: suggestion.threshold, unit: suggestion.unit, icon: suggestion.icon || "🏋️",
    });
    setNewName(""); setSuggestion(null);
  };

  const inp = {
    padding: "12px 14px", background: "#111", border: "1px solid #222", borderRadius: 10,
    color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>ADMIN PANEL</div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[["players","👥 Players"],["workouts","🏋️ Workouts"]].map(([k,l]) => (
          <button key={k} onClick={() => setSection(k)} style={{
            flex: 1, padding: 10, background: section === k ? "#f97316" : "#111",
            border: `1px solid ${section === k ? "#f97316" : "#222"}`, borderRadius: 8,
            color: section === k ? "#fff" : "#555", cursor: "pointer",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1,
          }}>{l}</button>
        ))}
      </div>

      {/* PLAYERS */}
      {section === "players" && (
        <div>
          <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>
            {users.length} player{users.length !== 1 ? "s" : ""} registered
          </div>
          {users.length === 0 && (
            <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40 }}>No players yet — they'll appear once they sign up</div>
          )}
          {users.map(u => (
            <div key={u.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{u.username}</div>
                <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>
                  Joined {new Date(u.joinedAt).toLocaleDateString()}
                </div>
              </div>
              {confirmRemove === u.id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => { removeUser(u.id); setConfirmRemove(null); }} style={{ background: "#ef4444", border: "none", borderRadius: 6, padding: "6px 12px", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Remove</button>
                  <button onClick={() => setConfirmRemove(null)} style={{ background: "#222", border: "none", borderRadius: 6, padding: "6px 12px", color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmRemove(u.id)} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "6px 10px", color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Remove</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WORKOUTS */}
      {section === "workouts" && (
        <div>
          <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Add a new workout — AI sets the fair point value:</div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Swimming, Jump rope..." style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && askAI()} />
            <button onClick={askAI} disabled={aiLoading || !newName.trim()} style={{
              background: "#f97316", border: "none", borderRadius: 10, padding: "0 16px",
              color: "#fff", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16,
              opacity: aiLoading || !newName.trim() ? 0.5 : 1,
            }}>{aiLoading ? "..." : "ASK AI"}</button>
          </div>

          {aiError && <div style={{ color: "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>{aiError}</div>}
          {aiLoading && <div style={{ color: "#f97316", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10, opacity: 0.7 }}>Calculating fair point value...</div>}

          {suggestion && (
            <div style={{ background: "linear-gradient(135deg,#1a0e00,#111)", border: "1px solid #f97316", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", color: "#fff", marginBottom: 2 }}>{suggestion.icon} {newName}</div>
              <div style={{ fontSize: 28, color: "#f97316", fontFamily: "'Bebas Neue', sans-serif", marginBottom: 6 }}>1 pt per {suggestion.threshold} {suggestion.unit}</div>
              <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>{suggestion.rationale}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={confirmAdd} style={{ flex: 1, background: "#f97316", border: "none", borderRadius: 8, padding: 10, color: "#fff", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>CONFIRM ADD</button>
                <button onClick={() => setSuggestion(null)} style={{ flex: 1, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: 10, color: "#888", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>CANCEL</button>
              </div>
            </div>
          )}

          {customWorkouts.length > 0 && (
            <>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>CUSTOM WORKOUTS</div>
              {customWorkouts.map(w => (
                <div key={w.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 18, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{w.icon} {w.name}</div>
                    <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>1 pt per {w.threshold} {w.unit}</div>
                  </div>
                  <button onClick={() => removeCustomWorkout(w.id)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
              ))}
            </>
          )}

          <div style={{ fontSize: 11, color: "#333", letterSpacing: 2, marginTop: 16, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>BASE WORKOUTS</div>
          {allWorkouts.filter(w => w.base).map(w => (
            <div key={w.id} style={{ background: "#0d0d0d", border: "1px solid #161616", borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 17, color: "#555", fontFamily: "'Bebas Neue', sans-serif" }}>{w.icon} {w.name}</div>
              <div style={{ fontSize: 12, color: "#2a2a2a", fontFamily: "'DM Sans', sans-serif" }}>1 pt per {w.threshold} {w.unit}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
