import { createContext, useContext, useState } from "react";

const AuthContext = createContext();
const DEFAULT_USER = { displayName: "Alex Green", email: "alex@ecotrack.demo", photoURL: null, location: "India", notifications: true };

function readUser() {
  try {
    const saved = localStorage.getItem("ecotrack-user");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const logout = () => {
    localStorage.removeItem("ecotrack-user");
    localStorage.removeItem("ecotrack-logs");
    setUser(null);
  };

  const updateUser = (details) => {
    const next = { ...(user || DEFAULT_USER), ...details };
    setUser(next);
    localStorage.setItem("ecotrack-user", JSON.stringify(next));
  };

  return <AuthContext.Provider value={{ user, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
