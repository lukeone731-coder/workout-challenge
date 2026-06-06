import { useState } from "react";
import { useApp } from "../context/AppContext";

const ICONS = ["💪","⚡","🔥","🏃","🚴","🏊","🧘","⛹️","🏋️","🤸","🚶","🏓","⛳","🧗","🚣","🤾","🏇","🎾","🥊","🤼"];

export default function AdminPage() {
  const { users, removeUser, allWorkouts, customWorkouts, addCustomWorkout, removeCustomWorkout, groups, createGroup, deleteGroup, logs, deleteLog } = useApp();
  const [section, setSection] = useState("groups");
  const [newGroupName, setNewGroupName] = useState("");
  const [groupMsg, setGroupMsg] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("time");
  const [newThreshold, setNewThreshold] = useState("");
  const [newIcon, setNewIcon] = useState("💪");
  const [addMsg, setAddMsg] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  const handleCreateGroup = async () => {
    setGroupMsg(""); setActionLoading("group");
    const err = await createGroup(newGroupName);
    if (err) setGroupMsg(err);
    else { setGroupMsg("Group created!"); setNewGroupName(""); setTimeout(() => setGroupMsg(""), 2500); }
    setActionLoading(null);
  };

  const handleAddWorkout = async () => {
    if (!newName.trim() || !newThreshold) { setAddMsg("Please fill in all fields."); return; }
    await addCustomWorkout({
      name: newName.trim(), type: newType,
      threshold: parseFloat(newThreshold),
      unit: newType === "reps" ? "reps" : "min",
      icon: newIcon,
    });
    setNewName(""); setNewThreshold(""); setAddMsg("Workout added!");
    setTimeout(() => setAddMsg(""), 2500);
  };

  const getGroupMembers = (groupId) => users.filter(u => (u.groupIds || []).includes(groupId));
  const getGroupLogs = (groupId) => logs.filter(l => l.group_id === groupId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const getUserLogsInGroup = (userId, groupId) => logs.filter(l => l.user_id === userId && l.group_id === groupId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const getUserPoints = (userId, groupId) => logs.filter(l => l.user_id === userId && l.group_id === groupId).reduce((s, l) => s + l.points, 0);

  const inp = { padding: "12px 14px", background: "#111", border: "1px solid #222", borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none" };
  const sectionBtn = (k, l) => (
    <button key={k} onClick={() => setSection(k)} style={{ flex: 1, padding: 9, background: section === k ? "#f97316" : "#111", border: `1px solid ${section === k ? "#f97316" : "#222"}`, borderRadius: 8, color: section === k ? "#fff" : "#555", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 1 }}>{l}</button>
  );

  return (
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>ADMIN PANEL</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {sectionBtn("groups","👥 Groups")}
        {sectionBtn("players","🙋 Players")}
        {sectionBtn("workouts","🏋️ Workouts")}
      </div>

      {/* ── GROUPS ── */}
      {section === "groups" && (
        <div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 10 }}>Create a new group:</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name..." style={{ ...inp, flex: 1 }} onKeyDown={e => e.key === "Enter" && handleCreateGroup()} />
              <button onClick={handleCreateGroup} disabled={actionLoading === "group"} style={{ background: "#f97316", border: "none", borderRadius: 10, padding: "0 14px", color: "#fff", cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif", fontSize: 16 }}>{actionLoading === "group" ? "..." : "CREATE"}</button>
            </div>
            {groupMsg && <div style={{ color: groupMsg.includes("!") ? "#22c55e" : "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 8 }}>{groupMsg}</div>}
          </div>

          {groups.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40 }}>No groups yet</div>}

          {groups.map(g => {
            const members = getGroupMembers(g.id);
            const groupLogs = getGroupLogs(g.id);
            const isExpanded = expandedGroup === g.id;
            return (
              <div key={g.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, marginBottom: 12, overflow: "hidden" }}>
                <div style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <button onClick={() => setExpandedGroup(isExpanded ? null : g.id)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
                      <div style={{ fontSize: 20, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{g.name} {isExpanded ? "▲" : "▼"}</div>
                      <div style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#555", marginTop: 2 }}>
                        Code: <span style={{ color: "#f97316", letterSpacing: 2 }}>{g.code}</span> · {members.length} member{members.length !== 1 ? "s" : ""} · {groupLogs.length} workouts
                      </div>
                    </button>
                    {confirmRemove === g.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={async () => { await deleteGroup(g.id); setConfirmRemove(null); setExpandedGroup(null); }} style={{ background: "#ef4444", border: "none", borderRadius: 6, padding: "5px 10px", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Delete</button>
                        <button onClick={() => setConfirmRemove(null)} style={{ background: "#222", border: "none", borderRadius: 6, padding: "5px 10px", color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmRemove(g.id)} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "5px 10px", color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Delete</button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1e1e1e", padding: "12px 16px" }}>
                    {members.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "8px 0" }}>No members yet</div>}
                    {members.map(u => {
                      const uLogs = getUserLogsInGroup(u.id, g.id);
                      const uPts = getUserPoints(u.id, g.id);
                      const isUserExpanded = expandedUser === `${g.id}_${u.id}`;
                      return (
                        <div key={u.id} style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
                          <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button onClick={() => setExpandedUser(isUserExpanded ? null : `${g.id}_${u.id}`)} style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0, flex: 1 }}>
                              <div style={{ fontSize: 16, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{u.username} {isUserExpanded ? "▲" : "▼"}</div>
                              <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{uLogs.length} workouts · {uPts} pts</div>
                            </button>
                            {confirmRemove === `user_${u.id}` ? (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={async () => { await removeUser(u.id); setConfirmRemove(null); }} style={{ background: "#ef4444", border: "none", borderRadius: 6, padding: "4px 8px", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Remove</button>
                                <button onClick={() => setConfirmRemove(null)} style={{ background: "#222", border: "none", borderRadius: 6, padding: "4px 8px", color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmRemove(`user_${u.id}`)} style={{ background: "none", border: "1px solid #2a2a2a", borderRadius: 6, padding: "4px 8px", color: "#444", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 11 }}>Remove</button>
                            )}
                          </div>
                          {isUserExpanded && (
                            <div style={{ borderTop: "1px solid #1a1a1a", padding: "8px 12px" }}>
                              {uLogs.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", fontSize: 12, padding: "4px 0" }}>No workouts logged</div>}
                              {uLogs.map(log => (
                                <div key={log.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #161616" }}>
                                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <span style={{ fontSize: 18 }}>{log.icon}</span>
                                    <div>
                                      <div style={{ fontSize: 14, fontFamily: "'Bebas Neue', sans-serif", color: "#ccc" }}>{log.workout_name}</div>
                                      <div style={{ fontSize: 10, color: "#444", fontFamily: "'DM Sans', sans-serif" }}>{log.amount} {log.unit} · {new Date(log.created_at).toLocaleDateString()}</div>
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ fontSize: 16, color: "#f97316", fontFamily: "'Bebas Neue', sans-serif" }}>+{log.points}</div>
                                    <button onClick={() => deleteLog(log)} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 14, padding: 2 }}
                                      onMouseEnter={e => e.target.style.color = "#ef4444"}
                                      onMouseLeave={e => e.target.style.color = "#333"}
                                    >✕</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PLAYERS ── */}
      {section === "players" && (
        <div>
          <div style={{ fontSize: 12, color: "#555", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>{users.length} player{users.length !== 1 ? "s" : ""} registered</div>
          {users.length === 0 && <div style={{ color: "#333", fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: 40 }}>No players yet</div>}
          {users.map(u => {
            const userGroupNames = groups.filter(g => (u.groupIds || []).includes(g.id)).map(g => g.name);
            const totalLogs = logs.filter(l => l.user_id === u.id).length;
            return (
              <div key={u.id} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: 14, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 18, letterSpacing: 1, fontFamily: "'Bebas Neue', sans-serif", color: "#fff" }}>{u.username}</div>
                  <div style={{ fontSize: 11, color: "#555", fontFamily: "'DM Sans', sans-serif" }}>{userGroupNames.length > 0 ? userGroupNames.join(", ") : "No groups"} · {totalLogs} total workouts</div>
                </div>
                {confirmRemove === u.id ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={async () => { await removeUser(u.id); setConfirmRemove(null); }} style={{ background: "#ef4444", border: "none", borderRadius: 6, padding: "6px 12px", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Remove</button>
                    <button onClick={() => setConfirmRemove(null)} style={{ background: "#222", border: "none", borderRadius: 6, padding: "6px 12px", color: "#888", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmRemove(u.id)} style={{ background: "none", border: "1px solid #333", borderRadius: 6, padding: "6px 10px", color: "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>Remove</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── WORKOUTS ── */}
      {section === "workouts" && (
        <div>
          <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: "#888", fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Add a new workout:</div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>NAME</div>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Swimming" style={{ ...inp, width: "100%" }} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>TYPE</div>
              <div style={{ display: "flex", gap: 8 }}>
                {[["time","⏱ Time (minutes)"],["reps","🔢 Reps"]].map(([val, label]) => (
                  <button key={val} onClick={() => setNewType(val)} style={{ flex: 1, padding: "10px", background: newType === val ? "#f97316" : "#0d0d0d", border: `1px solid ${newType === val ? "#f97316" : "#222"}`, borderRadius: 8, color: newType === val ? "#fff" : "#555", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {newType === "time" ? "MINUTES PER POINT" : "REPS PER POINT"}
              </div>
              <input type="number" value={newThreshold} onChange={e => setNewThreshold(e.target.value)} placeholder={newType === "time" ? "e.g. 8" : "e.g. 25"} style={{ ...inp, width: "100%" }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#555", letterSpacing: 2, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>ICON</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ICONS.map(icon => (
                  <button key={icon} onClick={() => setNewIcon(icon)} style={{ width: 38, height: 38, fontSize: 20, background: newIcon === icon ? "#f97316" : "#0d0d0d", border: `1px solid ${newIcon === icon ? "#f97316" : "#222"}`, borderRadius: 8, cursor: "pointer" }}>{icon}</button>
                ))}
              </div>
            </div>

            {newName && newThreshold && (
              <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10, marginBottom: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#888" }}>
                Preview: {newIcon} <strong style={{ color: "#fff" }}>{newName}</strong> — 1 pt per <strong style={{ color: "#f97316" }}>{newThreshold} {newType === "time" ? "min" : "reps"}</strong>
              </div>
            )}

            <button onClick={handleAddWorkout} style={{ width: "100%", padding: 12, background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", borderRadius: 10, color: "#fff", fontSize: 18, letterSpacing: 2, cursor: "pointer", fontFamily: "'Bebas Neue', sans-serif" }}>ADD WORKOUT</button>
            {addMsg && <div style={{ color: addMsg.includes("!") ? "#22c55e" : "#ef4444", fontFamily: "'DM Sans', sans-serif", fontSize: 12, marginTop: 8 }}>{addMsg}</div>}
          </div>

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
