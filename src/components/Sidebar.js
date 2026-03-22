/**
 * Бічна панель навігації.
 * Відповідає за привітання користувача та навігацію між сторінками.
 */

import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { loadFromStorage } from "../utils/localstorage";

// Масив пунктів навігації
const navItems = [
  { label: "Home", path: "/home" },
  { label: "Weekly To-do List", path: "/weekly" },
  { label: "Habit Tracker", path: "/habits" },
  { label: "Monthly Budget", path: "/budget" },
  { label: "Project Planner", path: "/projects" },
];

/**
 * Компонент бічної панелі навігації (Sidebar).
 * Відповідає за привітання користувача та рендеринг основних посилань для навігації між сторінками застосунку.
 * Використовує localStorage для отримання даних про поточного користувача.
 * @returns {JSX.Element} React-компонент, що містить блок привітання та меню навігації.
 */
function Sidebar() {
  const location = useLocation();

  // Завантаження даних користувача з localStorage
  const storedUser = loadFromStorage("currentUser", {});
  const userName = storedUser.name || "User";

  return (
    <aside className={styles.sidebar}>
      {/* Верхня частина з привітанням */}
      <div className={styles.top}>
          <p className={styles.username}>Hello, {userName}</p>
      </div>

      {/* Навігація по основних сторінках */}
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.link} ${
              location.pathname.startsWith(item.path) ? styles.active : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
