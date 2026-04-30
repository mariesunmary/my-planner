import { useNavigate, Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { useAuth } from "../context/AuthContext";
import WaterWidget from "./WaterWidget";

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Weekly To-do List", path: "/weekly" },
  { label: "Habit Tracker", path: "/habits" },
  { label: "Monthly Budget", path: "/budget" },
  { label: "Project Planner", path: "/projects" },
  { label: "Statistics", path: "/statistics" },
];

/**
 *
 */
function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <p className={styles.username}>Hello, {user?.name || "User"}</p>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.link} ${location.pathname.startsWith(item.path) ? styles.active : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <WaterWidget />

      <button onClick={handleLogout} className={styles.logoutButton}>
        Log out
      </button>
    </aside>
  );
}

export default Sidebar;
