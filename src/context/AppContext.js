import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_PASSWORD = "admin123";

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

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => load("wc_session", null));
  const [users, setUsers]             = useState(() => load("wc_users", []));
  const [logs, setLogs]               = useState(() => load("wc_logs", []));
  const [customWorkouts, setCustomWorkouts] = useState(() => load("wc_custom_workouts", []));
  const [groups, setGroups]           = useState(() => load("wc_groups", []));
  const [activeGroupId, setActiveGroupId] = useState(() => load("wc_active_group", null));

  useEffect(() => { save("wc_session", currentUser); }, [currentUser]);
  useEffect(() => { save("wc_users", users); }, [users]);
  useEffect(() => { save("wc_logs", logs); }, [logs]);
  useEffect(() => { save("wc_custom_workouts", customWorkouts); }, [customWorkouts]);
  useEffect(() => { save("wc_groups", groups); }, [groups]);
  useEffect(() => { save("wc_active_group", activeGroupId); }, [activeGroupId]);

  const allWorkouts = [...BASE_WORKOUTS, ...customWorkouts];

  // Auth
  const signUp = (username, password) => {
    const trimmed = username.trim();
    if (!trimmed || !password) return "Please fill in all fields.";
    if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) return "Username already taken.";
    const user = { id: Date.now().toString(), username: trimmed, password, isAdmin: false, groupIds: [], joinedAt: new Date().toISOString() };
    setUsers(prev => [...prev, user]);
    setCurrentUser(user);
    return null;
  };

  const signIn = (username, password) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return "Incorrect username or password.";
    setCurrentUser(user);
    // set active group to first group they're in
    const firstGroup = groups.find(g => user.groupIds?.includes(g.id));
    if (firstGroup && !activeGroupId) setActiveGroupId(firstGroup.id);
    return null;
  };

  const adminSignIn = (password) => {
    if (password !== ADMIN_PASSWORD) return "Incorrect admin password.";
    setCurrentUser({ id: "admin", username: "Admin", isAdmin: true, groupIds: [] });
    return null;
  };

  const signOut = () => { setCurrentUser(null); setActiveGroupId(null); };

  // Groups
  const createGroup = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return "Please enter a group name.";
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const group = { id: Date.now().toString(), name: trimmed, code, createdAt: new Date().toISOString() };
    setGroups(prev => [...prev, group]);
    return null;
  };

  const joinGroup = (code) => {
    const group = groups.find(g => g.code.toUpperCase() === code.trim().toUpperCase());
    if (!group) return "Invalid group code.";
    if (currentUser.groupIds?.includes(group.id)) return "You're already in this group.";
    const updated = { ...currentUser, groupIds: [...(currentUser.groupIds || []), group.id] };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setCurrentUser(updated);
    setActiveGroupId(group.id);
    return null;
  };

  const leaveGroup = (groupId) => {
    const updated = { ...currentUser, groupIds: currentUser.groupIds.filter(id => id !== groupId) };
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setCurrentUser(updated);
    if (activeGroupId === groupId) {
      const next = updated.groupIds[0] || null;
      setActiveGroupId(next);
    }
  };

  const deleteGroup = (groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setUsers(prev => prev.map(u => ({ ...u, groupIds: (u.groupIds || []).filter(id => id !== groupId) })));
    setLogs(prev => prev.filter(l => l.groupId !== groupId));
    if (activeGroupId === groupId) setActiveGroupId(null);
  };

  // Logs
  const calcPoints = (workout, amount) => {
    const raw = amount / workout.threshold;
    return Math.round(raw * 10) / 10;
  };

  const addLog = (workoutId, amount) => {
    const workout = allWorkouts.find(w => w.id === workoutId);
    if (!workout) return;
    const points = calcPoints(workout, parseFloat(amount));
    const userGroupIds = currentUser.groupIds || [];
    // log once per group the user belongs to
    const newLogs = userGroupIds.length > 0
      ? userGroupIds.map(groupId => ({
          id: Date.now().toString() + "_" + groupId,
          userId: currentUser.id,
          username: currentUser.username,
          workoutId,
          workoutName: workout.name,
          icon: workout.icon,
          amount: parseFloat(amount),
          unit: workout.unit,
          points,
          groupId,
          date: new Date().toLocaleDateString(),
          ts: Date.now(),
        }))
      : [{
          id: Date.now().toString(),
          userId: currentUser.id,
          username: currentUser.username,
          workoutId,
          workoutName: workout.name,
          icon: workout.icon,
          amount: parseFloat(amount),
          unit: workout.unit,
          points,
          groupId: null,
          date: new Date().toLocaleDateString(),
          ts: Date.now(),
        }];
    setLogs(prev => [...newLogs, ...prev]);
    return points;
  };

  const deleteLog = (id) => {
    const log = logs.find(l => l.id === id);
    if (!log) return;
    if (currentUser.isAdmin || log.userId === currentUser.id) {
      // delete all copies of this workout across groups (same ts + userId)
      const log2 = logs.find(l => l.id === id);
      setLogs(prev => prev.filter(l => !(l.userId === log2.userId && l.ts === log2.ts)));
    }
  };

  const getPointsForUser = (userId, groupId) =>
    logs.filter(l => l.userId === userId && l.groupId === groupId)
        .reduce((s, l) => s + l.points, 0);

  const getUsersInGroup = (groupId) =>
    users.filter(u => (u.groupIds || []).includes(groupId));

  // Admin
  const removeUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setLogs(prev => prev.filter(l => l.userId !== userId));
  };

  const addCustomWorkout = (workout) => setCustomWorkouts(prev => [...prev, workout]);
  const removeCustomWorkout = (id) => setCustomWorkouts(prev => prev.filter(w => w.id !== id));

  const activeGroup = groups.find(g => g.id === activeGroupId) || null;

  return (
    <AppContext.Provider value={{
      currentUser, users, logs, allWorkouts, customWorkouts,
      groups, activeGroup, activeGroupId, setActiveGroupId,
      signUp, signIn, adminSignIn, signOut,
      createGroup, joinGroup, leaveGroup, deleteGroup,
      addLog, deleteLog, calcPoints, getPointsForUser, getUsersInGroup,
      removeUser, addCustomWorkout, removeCustomWorkout,
      ADMIN_PASSWORD,
    }}>
      {children}
    </AppContext.Provider>
  );
}
