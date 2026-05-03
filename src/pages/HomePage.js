import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import styles from "./HomePage.module.css";

const features = [
  {
    icon: "✅",
    title: "Weekly To-Do List",
    text: "Plan your week with clarity. Break big goals into daily actions and check them off as you go.",
  },
  {
    icon: "🌱",
    title: "Habit Tracker",
    text: "Build lasting routines. Track your habits daily and watch your consistency grow over time.",
  },
  {
    icon: "💸",
    title: "Monthly Budget",
    text: "Stay aware of your spending. Log expenses by category and see where your money goes.",
  },
  {
    icon: "🎯",
    title: "Project Planner",
    text: "Turn big ideas into actionable steps. Manage tasks, deadlines and progress in one place.",
  },
  {
    icon: "📊",
    title: "Statistics",
    text: "See your progress at a glance. Charts and summaries to celebrate what's working.",
  },
  {
    icon: "💧",
    title: "Water Tracker",
    text: "Stay hydrated every day. A simple reminder to take care of your body alongside your goals.",
  },
];

/**
 *
 */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) {return "Good morning";}
  if (h < 18) {return "Good afternoon";}
  return "Good evening";
}

/**
 *
 */
function HomePage() {
  const { user } = useAuth();

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroHeading}>
            {getGreeting()}, {user?.name || "User"} 👋
          </h1>
          <p className={styles.heroSub}>
            Welcome to <strong>FocusFlow</strong> — your personal system for meaningful progress.
            Here, consistency beats perfection. Let's build a life that flows.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((f) => (
            <div key={f.title} className={styles.card}>
              <span className={styles.cardIcon}>{f.icon}</span>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardText}>{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
