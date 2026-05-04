import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const ThemeContext = createContext(null);

/**
 * @param root0
 * @param root0.children
 * @returns {JSX.Element}
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync theme from DB on app load if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me").then((res) => {
        if (res.data.theme) {setTheme(res.data.theme);}
      }).catch(() => {});
    }
  }, []);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      await api.put("/auth/me", { theme: next });
    } catch {
      // not critical — theme already applied locally
    }
  };

  const applyTheme = (t) => {
    if (t && t !== theme) {setTheme(t);}
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 *
 */
export function useTheme() {
  return useContext(ThemeContext);
}
