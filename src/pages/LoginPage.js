import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";
import common from "../styles/Common.module.css";
import { validateEmail, validatePassword } from "../utils/validation";
import { loadFromStorage, saveToStorage } from "../utils/localstorage";
import { useFormHandlers } from "../hooks/useFormHandlers";

/**
 * Сторінка входу користувача.
 * - Перевіряє валідність введених даних (email, пароль)
 * - Здійснює пошук користувача у localStorage
 * - Зберігає поточного користувача після успішного входу
 * - Переадресовує на головну сторінку (Home)
 */
function LoginPage() {
  const navigate = useNavigate();

  // Стан полів форми та можливих помилок
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  /**
   * Валідація даних форми входу.
   * @returns {Object} errors - об’єкт із помилками, якщо є
   */
  const validate = () => {
    const newErrors = {};
    const emailError = validateEmail(form.email);
    const passError = validatePassword(form.password);

    if (emailError) {newErrors.email = emailError;}
    if (passError) {newErrors.password = passError;}

    return newErrors;
  };

  // Обробники введення
  const { handleChange, handleFocus } = useFormHandlers(form, setForm, setErrors);

  /**
   * Обробник відправлення форми входу.
   * - Перевіряє валідацію
   * - Порівнює дані з користувачами в localStorage
   * - У разі успіху зберігає користувача та переходить на Home
   * @param {Event} e - подія submit
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Отримання користувачів з localStorage
    const users = loadFromStorage("users", []);

    // Перевірка на існування користувача
    const userExists = users.find(
      (u) => u.email === form.email && u.password === form.password
    );

    if (!userExists) {
      setErrors({ general: "Account not found or password incorrect" });
      return;
    }

    // Збереження активного користувача
    saveToStorage("currentUser", userExists);

    // Перенаправлення на головну сторінку
    navigate("/home");
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>Welcome back</h2>
      <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
        {/* Поле Email */}
        <div className={styles.authInputWrapper}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`${styles.authInput} ${errors.email ? common.inputError : ""}`}
            value={form.email}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errors.email && <p className={common.errorMessage}>{errors.email}</p>}
        </div>

        {/* Поле Пароля */}
        <div className={styles.authInputWrapper}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            className={`${styles.authInput} ${errors.password ? common.inputError : ""}`}
            value={form.password}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errors.password && <p className={common.errorMessage}>{errors.password}</p>}
        </div>

        {errors.general && <p className={common.errorMessage}>{errors.general}</p>}

        <button type="submit" className={styles.button}>
          Log In
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
