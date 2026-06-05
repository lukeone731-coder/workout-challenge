import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ADMIN_PASSWORD = "champ2024";
const SUPABASE_URL = "https://hlomyzksltizesvlrdfp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsb215emtzbHRpemVzdmxyZGZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTkwODcsImV4cCI6MjA5NjE5NTA4N30.XnEAEzKbq2kk9l97id4gJHk3aZBJW0CMrYAIACUsU-w";

const BASE_WORKOUTS = [
  { id: "burpees",    name: "Burpees",     type: "reps", threshold: 10, unit: "reps", icon: "⚡", base: true },
  { id: "pushups",    name: "Pushups",     type: "reps", threshold: 25, unit: "reps", icon: "💪", base: true },
  { id: "situps",     name: "Sit-ups",     type: "reps", threshold: 40, unit: "reps", icon: "🔥", base: true },
  { id: "running",    name: "Running",     type: "time", threshold: 5,  unit: "min",  icon: "🏃", base: true },
  { id: "biking",     name: "Biking",      type: "time", threshold: 8,  unit: "min",  icon: "🚴", base: true },
  { id: "pickleball", name: "Pickleball",  type: "time", threshold: 8,  unit: "min",  icon: "🏓", base: true },
  { id: "walking",    name: "Walking",     type: "time", threshold: 15, unit: "min",  icon: "🚶", base: true },
  { id: "golf",       name: "Golf (cart)", type: "time", threshold: 30, unit: "min",  icon: "⛳", base: true },
];

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

// Supabase REST helper
const db = async (table, options = {}) => {
  const { method = "GET", body, params = "", select = "*" } = options;
  let url = `${SUPABASE_URL}/rest/v1/${table}`;
  if (method === "GET") url += `?select=${select}${params ? "&" + params : ""}`;
  else if (params) url += `?${params}`;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (method === "GET" || options.returnData) return res.json();
  return res.ok;
};

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => load("wc_session", null));
  const [activeGroupId, setActiveGroupIdState] = useState(() => load("wc_active_group", null));
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [logs, setLogs] = useState([]);
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const setActiveGroupId = (id) => { setActiveGroupIdState(id); save("wc_active_group", id); };

  const allWorkouts = [...BASE_WORKOUTS, ...customWorkouts];

  // Load all data from Supabase
  const fetchAll = useCallback(async () => {
    try {
      const [u, g, gm, l, cw] = await Promise.all([
        db("users", { select: "id,username,created_at" }),
        db("groups"),
        db("group_members"),
        db("logs", { select: "*", params: "order=created_at.desc" }),
        db("custom_workouts"),
      ]);
      // attach groupIds to users
      const usersWithGroups = (u || []).map(user => ({
        ...user,
        groupIds: (gm || []).filter(m => m.user_id === user.id).map(m => m.group_id),
      }));
      setUsers(usersWithGroups);
      setGroups(g || []);
      setLogs(l || []);
      setCustomWorkouts(cw || []);
    } catch (e) { console.error("fetchAll error", e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { save("wc_session", currentUser); }, [currentUser]);

  // Auth
  const signUp = async (username, password) => {
    const trimmed = username.trim();
    if (!trimmed || !password) return "Please fill in all fields.";
    const existing = await db("users", { params: `username=ilike.${encodeURIComponent(trimmed)}&limit=1` });
    if (existing?.length > 0) return "Username already taken.";
    const result = await db("users", { method: "POST", body: { username: trimmed, password }, returnData: true });
    if (!result?.[0]) return "Sign up failed. Try again.";
    const user = { ...result[0], groupIds: [] };
    setCurrentUser(user);
    await fetchAll();
    return null;
  };

  const signIn = async (username, password) => {
    const results = await db("users", { params: `username=ilike.${encodeURIComponent(username.trim())}&limit=1` });
    const user = results?.[0];
    if (!user) return "Incorrect username or password.";
    if (user.password !== password) return "Incorrect username or password.";
    const members = await db("group_members", { params: `user_id=eq.${user.id}` });
    const fullUser = { ...user, groupIds: (members || []).map(m => m.group_id) };
    setCurrentUser(fullUser);
    if (!activeGroupId && fullUser.groupIds.length > 0) setActiveGroupId(fullUser.groupIds[0]);
    await fetchAll();
    return null;
  };

  const adminSignIn = (password) => {
    if (password !== ADMIN_PASSWORD) return "Incorrect admin password.";
    setCurrentUser({ id: "admin", username: "Admin", isAdmin: true, groupIds: [] });
    return null;
  };

  const signOut = () => { setCurrentUser(null); setActiveGroupId(null); };

  const refreshCurrentUser = async () => {
    if (!currentUser || currentUser.isAdmin) return;
    const members = await db("group_members", { params: `user_id=eq.${currentUser.id}` });
    const groupIds = (members || []).map(m => m.group_id);
    const updated = { ...currentUser, groupIds };
    setCurrentUser(updated);
    return updated;
  };

  // Groups
  const createGroup = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "Please enter a group name.";
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const result = await db("groups", { method: "POST", body: { name: trimmed, code }, returnData: true });
    if (!result?.[0]) return "Failed to create group.";
    await fetchAll();
    return null;
  };

  const joinGroup = async (code) => {
    const found = await db("groups", { params: `code=ilike.${code.trim()}&limit=1` });
    const group = found?.[0];
    if (!group) return "Invalid group code.";
    if (currentUser.groupIds?.includes(group.id)) return "You're already in this group.";
    await db("group_members", { method: "POST", body: { user_id: currentUser.id, group_id: group.id } });
    await refreshCurrentUser();
    setActiveGroupId(group.id);
    await fetchAll();
    return null;
  };

  const leaveGroup = async (groupId) => {
    await db("group_members", { method: "DELETE", params: `user_id=eq.${currentUser.id}&group_id=eq.${groupId}` });
    const updated = await refreshCurrentUser();
    if (activeGroupId === groupId) {
      const next = (updated?.groupIds || []).find(id => id !== groupId) || null;
      setActiveGroupId(next);
    }
    await fetchAll();
  };

  const deleteGroup = async (groupId) => {
    await db("groups", { method: "DELETE", params: `id=eq.${groupId}` });
    if (activeGroupId === groupId) setActiveGroupId(null);
    await fetchAll();
  };

  // Logs
  const calcPoints = (workout, amount) => Math.round((amount / workout.threshold) * 10) / 10;

  const addLog = async (workoutId, amount) => {
    const workout = allWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    const points = calcPoints(workout, parseFloat(amount));
    const userGroupIds = currentUser.groupIds || [];
    const entries = userGroupIds.length > 0
      ? userGroupIds.map(groupId => ({
          user_id: currentUser.id, group_id: groupId,
          workout_id: workoutId, workout_name: workout.name,
          icon: workout.icon, amount: parseFloat(amount),
          unit: workout.unit, points,
        }))
      : [{ user_id: currentUser.id, group_id: null, workout_id: workoutId, workout_name: workout.name, icon: workout.icon, amount: parseFloat(amount), unit: workout.unit, points }];

    for (const entry of entries) {
      await db("logs", { method: "POST", body: entry });
    }
    await fetchAll();
    return points;
  };

  const deleteLog = async (log) => {
    if (!currentUser.isAdmin && log.user_id !== currentUser.id) return;
    // delete all copies across groups (same user, same workout, same timestamp approx)
    await db("logs", { method: "DELETE", params: `id=eq.${log.id}` });
    await fetchAll();
  };

  const getPointsForUser = (userId, groupId) =>
    logs.filter(l => l.user_id === userId && l.group_id === groupId)
        .reduce((s, l) => s + l.points, 0);

  const getUsersInGroup = (groupId) =>
    users.filter(u => (u.groupIds || []).includes(groupId));

  // Admin
  const removeUser = async (userId) => {
    await db("users", { method: "DELETE", params: `id=eq.${userId}` });
    await fetchAll();
  };

  const addCustomWorkout = async (workout) => {
    await db("custom_workouts", { method: "POST", body: workout });
    await fetchAll();
  };

  const removeCustomWorkout = async (id) => {
    await db("custom_workouts", { method: "DELETE", params: `id=eq.${id}` });
    await fetchAll();
  };

  const activeGroup = groups.find(g => g.id === activeGroupId) || null;

  return (
    <AppContext.Provider value={{
      currentUser, users, logs, allWorkouts, customWorkouts,
      groups, activeGroup, activeGroupId, setActiveGroupId,
      loading, fetchAll,
      signUp, signIn, adminSignIn, signOut,
      createGroup, joinGroup, leaveGroup, deleteGroup,
      addLog, deleteLog, calcPoints, getPointsForUser, getUsersInGroup,
      removeUser, addCustomWorkout, removeCustomWorkout,
    }}>
      {children}
    </AppContext.Provider>
  );
}
