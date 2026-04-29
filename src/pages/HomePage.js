import React from "react";
import Sidebar from "../components/Sidebar";
import styles from "./HomePage.module.css";

/**
 * Головна сторінка застосунку.
 * - Відображає привітання користувача після входу
 * - Містить опис філософії та призначення FocusFlow
 * - Використовує компонент Sidebar для навігації між сторінками
 * - Є стартовою сторінкою після авторизації
 */
function HomePage() {
  return (
    <div className={styles.layout}>
      {/* Панель навігації */}
      <Sidebar showAppName={false} userName="User" />

      {/* Основний контент сторінки */}
      <main className={styles.main}>
        <h1 className={styles.heading}>Welcome to FocusFlow 👋</h1>
        <p className={styles.subheading}>
          Start organizing your time effectively today.
        </p>

        {/* Інформаційний розділ про додаток */}
        <section className={styles.textContainer}>
          <h2 className={styles.title}>🧭 FocusFlow – Your Personal System for Meaningful Progress</h2>
          <p>
            Welcome to <strong>FocusFlow</strong>, your digital space for clarity, intention, and balance.
          </p>
          <p>
            In a world that constantly pulls your attention in different directions, it's easy to feel scattered or overwhelmed.
            FocusFlow helps you return to what truly matters — your goals, your values, your time.
          </p>
          <p>
            This isn't just another planner. It’s a quiet assistant for your everyday life — designed to support mindful routines,
            focused work, financial awareness, and long-term growth.
          </p>
          <p>
            Whether you're tracking daily habits, managing personal projects, or simply trying to stay afloat, FocusFlow brings structure
            without the pressure.
          </p>
          <p><em>Here, progress isn’t about perfection. It’s about consistency. It’s about showing up. And it starts today.</em></p>
          <p><strong>Let’s build a life that flows — with purpose.</strong></p>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
