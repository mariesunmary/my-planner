import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Auth.module.css";
import common from "../styles/Common.module.css";
import {
  validateName,
  validateEmail,
  validatePassword,
} from "../utils/validation";
import { loadFromStorage, saveToStorage } from "../utils/localstorage";
import { useFormHandlers } from "../hooks/useFormHandlers";

/**
 * Сторінка реєстрації користувача.
 * - Виконує валідацію введених даних
 * - Зберігає користувачів у localStorage
 * - Перевіряє унікальність email та імені
 * - Переадресовує на Home після успіху
 * @component
 * @returns {JSX.Element} Сторінка реєстрації нового користувача.
 */
function RegisterPage() {
  // Стан форми та повідомлень 
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  /**
   * Валідація даних форми.
   * @returns {object} errors - об’єкт з помилками 
   */
  const validate = () => {
    const newErrors = {};
    const nameError = validateName(form.name);
    const emailError = validateEmail(form.email);
    const passError = validatePassword(form.password);

    if (nameError) {newErrors.name = nameError;}
    if (emailError) {newErrors.email = emailError;}
    if (passError) {newErrors.password = passError;}

    return newErrors;
  };

  // Обробники введення з кастомного hook
  const { handleChange, handleFocus } = useFormHandlers(
    form, 
    setForm, 
    setErrors, 
    setSuccess
  );

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

    // Отримання існуючих користувачів з localStorage
    const users = loadFromStorage("users", []);

    // Перевірка на унікальність
    const duplicate = users.find(
      (u) => u.email === form.email || u.name.toLowerCase() === form.name.toLowerCase()
    );

    if (duplicate) {
      setErrors({
        ...errors,
        email: duplicate.email === form.email ? "Email already in use" : "",
        name: duplicate.name?.toLowerCase() === form.name.toLowerCase() ? "Name already in use" : "",
      });
      return;
    }

    // Додавання нового користувача
    const updatedUsers = [...users, form];
    saveToStorage("users", updatedUsers);
    saveToStorage("currentUser", form);

    // Повідомлення про успіх
    setSuccess("Account created successfully!");
    setForm({ name: "", email: "", password: "" });

    // Переадресація на Home
    setTimeout(() => {
      navigate("/home");
    }, 800);
  };

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.authTitle}>Create your account</h2>

      <form
        key={success}
        className={styles.authForm}
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Ім'я */}
        <div className={styles.authInputWrapper}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={`${styles.authInput} ${
              errors.name ? common.inputError : ""
            }`}
            value={form.name}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errors.name && (
            <p className={common.errorMessage}>{errors.name}</p>
          )}
        </div>

        {/* Email */}
        <div className={styles.authInputWrapper}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className={`${styles.authInput} ${
              errors.email ? common.inputError : ""
            }`}
            value={form.email}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errors.email && (
            <p className={common.errorMessage}>{errors.email}</p>
          )}
        </div>

        {/* Пароль */}
        <div className={styles.authInputWrapper}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="new-password"
            className={`${styles.authInput} ${
              errors.password ? common.inputError : ""
            }`}
            value={form.password}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {errors.password && (
            <p className={common.errorMessage}>{errors.password}</p>
          )}
        </div>

        <button type="submit" className={styles.button}>
          Register
        </button>

        {/* Повідомлення про успіх */}
        {success && <p className={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;