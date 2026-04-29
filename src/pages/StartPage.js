/**
 * Стартова сторінка застосунку.
 * Відповідає за привітання користувача та надання вибору між входом і реєстрацією.
 * Містить логотип, короткий опис і кнопки переходу до сторінок Login та Register.
 */
import React from "react";
import { Link } from "react-router-dom";
import styles from "./StartPage.module.css";

function StartPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>FocusFlow ⏰</h1>
      <p className={styles.subtitle}>Plan your week. Track your goals. Own your time.</p>
      <div className={styles.buttonContainer}>
        <Link to="/login" className={styles.loginButton}>
          Log In
        </Link>
        <Link to="/register" className={styles.registerButton}>
          Register
        </Link>
      </div>
    </div>
  );
}

export default StartPage;
