import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function GroupsPage() {
  const { currentUser, groups, joinGroup, leaveGroup } = useApp();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userGroups = groups.filter(g => (currentUser.groupIds || []).includes(g.id));

  const handleJoin = () => {
    setError(""); setSuccess("");
    const err = joinGroup(code);
    if (err) setError(err);
    else { setSuccess("Joined successfully!"); setCode(""); setTimeout(() => setSuccess(""), 2500); }
  };

  const inp = {
    flex: 1, padding: "12px 14px", background: "#111", border: "1px solid #222",
    borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none",
    letterSpacing: 2, textTransform: "uppercase",
  };

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>MY GROUPS</div>

      {/* Join */}
      <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>Join a group with a code:</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="ENTER CODE" style={inp} maxLength={8} onKeyDown={e => e.key === "Enter" && handleJoin()} />
          <button onClick={handleJoin} style={{ background: "#f97316", border: "none", borderRadius: 10, padding: "0 16px", color: "#fff", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>JOIN</button>
        </div>
        {error && <div style={{ color: "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: "#22c55e", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 8 }}>{success}</div>}
      </div>

      {/* My groups */}
      {userGroups.length === 0 && (
        <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40, fontSize: 14 }}>
          You haven't joined any groups yet
        </div>
      )}
      {userGroups.map(g => (
        <div key={g.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 1, color: "#fff" }}>{g.name}</div>
              <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
                Code: <span style={{ color: "#f97316", letterSpacing: 2 }}>{g.code}</span>
              </div>
            </div>
            <button onClick={() => leaveGroup(g.id)} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "5px 10px", color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Leave</button>
          </div>
        </div>
      ))}
    </div>
  );
}
