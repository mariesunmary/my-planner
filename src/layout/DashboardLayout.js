
import React from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import styles from "./DashboardLayout.module.css";
import common from "../styles/Common.module.css";

/**
 * Список пунктів навігації для Sidebar та заголовка шапки.
 * Кожен об'єкт містить:
 * - label: назва пункту меню
 * - path: шлях сторінки
 */
const navItems = [
  { label: "Home", path: "/home" },
  { label: "Weekly To-do List", path: "/weekly" },
  { label: "Habit Tracker", path: "/habits" },
  { label: "Monthly Budget", path: "/budget" },
  { label: "Project Planner", path: "/projects" },
  { label: "Statistics", path: "/statistics" },
];

const quote = "Small steps every day lead to big changes.";

/**
 * DashboardLayout — компонент обгортки для сторінок, які використовують
 * структуру з бічною панеллю, шапкою та контейнером для основного контенту.
 * @component
 * @param {object} props - Властивості компонента.
 * @param {React.ReactNode} props.children - Основний контент сторінки, який буде вставлений всередину контейнера.
 * @returns {JSX.Element} Обгортка зі структурою Dashboard.
 */
function DashboardLayout({ children }) {
  const location = useLocation();

  // Визначення активного пункту меню за шляхом
  const activeItem = navItems.find(item =>
    location.pathname.startsWith(item.path)
  );

  // Отримання поточного місяця у форматі "Month Year"
  const today = new Date();
  const currentMonth = today.toLocaleString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.layout}>
      {/* Sidebar з відображенням імені користувача */}
      <Sidebar showAppName={false} userName="User" />

      <div className={styles.main}>
        {/* Шапка сторінки */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{activeItem?.label}</h2>
            <p className={styles.month}>{currentMonth}</p>
          </div>
          <p className={styles.quote}>{quote}</p>
        </header>

        {/* Основний контент сторінки */}
        <div className={common.container}>{children}</div>
      </div>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
