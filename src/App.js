import { useState } from "react";
import { useApp } from "./context/AppContext";
import AuthPage from "./pages/AuthPage";
import Leaderboard from "./pages/Leaderboard";
import LogWorkout from "./pages/LogWorkout";
import History from "./pages/History";
import GroupsPage from "./pages/GroupsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { currentUser, signOut } = useApp();
  const [tab, setTab] = useState("leaderboard");

  if (!currentUser) return <AuthPage />;

  const tabs = currentUser.isAdmin
    ? [
        { key: "leaderboard", icon: "🏆", label: "Board" },
        { key: "history",     icon: "📋", label: "History" },
        { key: "admin",       icon: "⚙️",  label: "Admin" },
      ]
    : [
        { key: "leaderboard", icon: "🏆", label: "Board" },
        { key: "log",         icon: "➕", label: "Log" },
        { key: "history",     icon: "📋", label: "History" },
        { key: "groups",      icon: "👥", label: "Groups" },
      ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        input:focus, select:focus { border-color: #f97316 !important; outline: none; }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        select { appearance: none; }
        button { transition: opacity 0.15s; }
        button:active { opacity: 0.7; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#1a0a00 0%,#0a0a0f 60%)", borderBottom: "1px solid #1e1e1e", padding: "20px 16px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 4, color: "#f97316", marginBottom: 2, fontFamily: "'DM Sans', sans-serif" }}>30-DAY</div>
            <div style={{ fontSize: 30, letterSpacing: 2, lineHeight: 1, fontFamily: "'Bebas Neue', sans-serif" }}>WORKOUT CHALLENGE</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: "#f97316", fontFamily: "'DM Sans', sans-serif" }}>{currentUser.username}</div>
            <button onClick={signOut} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11, textDecoration: "underline", marginTop: 2 }}>sign out</button>
          </div>
        </div>
        <div style={{ width: 36, height: 3, background: "#f97316", marginTop: 8, borderRadius: 2 }} />
      </div>

      {/* Page */}
      <div style={{ padding: "16px 0 0" }}>
        {tab === "leaderboard" && <Leaderboard />}
        {tab === "log"         && <LogWorkout />}
        {tab === "history"     && <History />}
        {tab === "groups"      && <GroupsPage />}
        {tab === "admin"       && <AdminPage />}
      </div>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#0f0f0f", borderTop: "1px solid #1e1e1e", display: "flex", justifyContent: "space-around", padding: "8px 0 14px", zIndex: 100 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>
            <span style={{ fontSize: 10, letterSpacing: 1, color: tab === t.key ? "#f97316" : "#555", fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{t.label.toUpperCase()}</span>
            {tab === t.key && <div style={{ width: 16, height: 2, background: "#f97316", borderRadius: 1 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
