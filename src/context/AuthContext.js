import React, { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

/**
 *
 * @param root0
 * @param root0.children
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("currentUser", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const register = async (email, password, name) => {
    const res = await api.post("/auth/register", { email, password, name });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("currentUser", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem("currentUser", JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
