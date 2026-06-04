import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AuthPage() {
  const { signIn, signUp, adminSignIn } = useApp();
  const [mode, setMode] = useState("signin"); // signin | signup | admin
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handle = () => {
    setError("");
    let err = null;
    if (mode === "signin") err = signIn(username, password);
    else if (mode === "signup") err = signUp(username, password);
    else err = adminSignIn(password);
    if (err) setError(err);
  };

  const inputStyle = {
    width: "100%", padding: "13px 14px", background: "#111",
    border: "1px solid #2a2a2a", borderRadius: 10, color: "#fff",
    fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none",
    marginBottom: 10,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", justifyContent: "center", padding: 24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } input:focus { border-color: #f97316 !important; outline: none; }`}</style>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "#f97316", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>30-DAY</div>
        <div style={{ fontSize: 52, letterSpacing: 2, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>WORKOUT<br />CHALLENGE</div>
        <div style={{ width: 50, height: 3, background: "#f97316", marginTop: 10, borderRadius: 2 }} />
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[["signin", "Sign In"], ["signup", "Sign Up"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
            flex: 1, padding: "10px", background: mode === m ? "#f97316" : "#111",
            border: `1px solid ${mode === m ? "#f97316" : "#222"}`, borderRadius: 8,
            color: mode === m ? "#fff" : "#555", cursor: "pointer",
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, letterSpacing: 1,
          }}>{label}</button>
        ))}
      </div>

      {mode !== "admin" && (
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" style={inputStyle} />
      )}
      <input
        type="password" value={password} onChange={e => setPassword(e.target.value)}
        placeholder={mode === "admin" ? "Admin password" : "Password"}
        style={inputStyle}
        onKeyDown={e => e.key === "Enter" && handle()}
      />

      {error && <div style={{ color: "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: 13, marginBottom: 10 }}>{error}</div>}

      <button onClick={handle} style={{
        width: "100%", padding: 14, background: "linear-gradient(135deg, #f97316, #ea580c)",
        border: "none", borderRadius: 10, color: "#fff", fontSize: 20, letterSpacing: 2,
        cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", marginBottom: 16,
      }}>
        {mode === "signin" ? "SIGN IN" : mode === "signup" ? "CREATE ACCOUNT" : "ADMIN LOGIN"}
      </button>

      <button onClick={() => { setMode(mode === "admin" ? "signin" : "admin"); setError(""); setPassword(""); }} style={{
        background: "none", border: "none", color: "#444", cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, textDecoration: "underline",
      }}>
        {mode === "admin" ? "← Back to sign in" : "Admin login"}
      </button>
    </div>
  );
}
