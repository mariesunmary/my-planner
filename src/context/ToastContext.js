import { createContext, useContext, useState, useCallback, useRef } from "react";
import AchievementToast from "../components/AchievementToast";

const ToastContext = createContext(null);

/**
 * @param root0
 * @param root0.children
 * @returns {JSX.Element}
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((title, subtitle, emoji) => {
    if (timerRef.current) {clearTimeout(timerRef.current);}
    setToast({ title, subtitle, emoji });
    timerRef.current = setTimeout(() => setToast(null), 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <AchievementToast title={toast.title} subtitle={toast.subtitle} emoji={toast.emoji} />}
    </ToastContext.Provider>
  );
}

/**
 *
 */
export function useToast() {
  return useContext(ToastContext);
}
