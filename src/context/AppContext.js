import { createContext, useContext, useState, useEffect } from "react";

const ADMIN_PASSWORD = "AdMiN2026"; // Change this before deploying!

const BASE_WORKOUTS = [
  { id: "burpees",     name: "Burpees",       type: "reps", threshold: 10, unit: "reps", icon: "⚡", base: true },
  { id: "pushups",     name: "Pushups",        type: "reps", threshold: 25, unit: "reps", icon: "💪", base: true },
  { id: "situps",      name: "Sit-ups",        type: "reps", threshold: 40, unit: "reps", icon: "🔥", base: true },
  { id: "running",     name: "Running",        type: "time", threshold: 5,  unit: "min",  icon: "🏃", base: true },
  { id: "biking",      name: "Biking",         type: "time", threshold: 8,  unit: "min",  icon: "🚴", base: true },
  { id: "pickleball",  name: "Pickleball",     type: "time", threshold: 8,  unit: "min",  icon: "🏓", base: true },
  { id: "walking",     name: "Walking",        type: "time", threshold: 15, unit: "min",  icon: "🚶", base: true },
  { id: "golf",        name: "Golf (cart)",    type: "time", threshold: 30, unit: "min",  icon: "⛳", base: true },
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

  useEffect(() => { save("wc_session", currentUser); }, [currentUser]);
  useEffect(() => { save("wc_users", users); }, [users]);
  useEffect(() => { save("wc_logs", logs); }, [logs]);
  useEffect(() => { save("wc_custom_workouts", customWorkouts); }, [customWorkouts]);

  const allWorkouts = [...BASE_WORKOUTS, ...customWorkouts];

  // Auth
  const signUp = (username, password) => {
    const trimmed = username.trim();
    if (!trimmed || !password) return "Please fill in all fields.";
    if (users.find(u => u.username.toLowerCase() === trimmed.toLowerCase())) return "Username already taken.";
    const user = { id: Date.now().toString(), username: trimmed, password, isAdmin: false, joinedAt: new Date().toISOString() };
    setUsers(prev => [...prev, user]);
    setCurrentUser(user);
    return null;
  };

  const signIn = (username, password) => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) return "Incorrect username or password.";
    setCurrentUser(user);
    return null;
  };

  const adminSignIn = (password) => {
    if (password !== ADMIN_PASSWORD) return "Incorrect admin password.";
    setCurrentUser({ id: "admin", username: "Admin", isAdmin: true });
    return null;
  };

  const signOut = () => setCurrentUser(null);

  // Logs
  const addLog = (entry) => setLogs(prev => [entry, ...prev]);
  const deleteLog = (id) => {
    const log = logs.find(l => l.id === id);
    if (!log) return;
    if (currentUser.isAdmin || log.userId === currentUser.id) {
      setLogs(prev => prev.filter(l => l.id !== id));
    }
  };

  const getPointsForUser = (userId) =>
    logs.filter(l => l.userId === userId).reduce((s, l) => s + l.points, 0);

  // Admin actions
  const removeUser = (userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setLogs(prev => prev.filter(l => l.userId !== userId));
  };

  const addCustomWorkout = (workout) => setCustomWorkouts(prev => [...prev, workout]);
  const removeCustomWorkout = (id) => setCustomWorkouts(prev => prev.filter(w => w.id !== id));

  return (
    <AppContext.Provider value={{
      currentUser, users, logs, allWorkouts, customWorkouts,
      signUp, signIn, adminSignIn, signOut,
      addLog, deleteLog, getPointsForUser,
      removeUser, addCustomWorkout, removeCustomWorkout,
      ADMIN_PASSWORD,
    }}>
      {children}
    </AppContext.Provider>
  );
}
