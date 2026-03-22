/**
 * Допоміжні функції для валідації даних у формових полях.
 * @module validation
 */

/**
 * Перевірка валідності імені
 * @param {string} name - Значення імені для перевірки
 * @returns {string} Повертає повідомлення про помилку або пустий рядок, якщо валідно
 */
export const validateName = (name) => {
  if (!name.trim()) {return "Name is required";}
  if (name.trim().length < 2) {return "Name must be at least 2 characters";}
  return "";
};

/**
 * Перевірка валідності email
 * @param {string} email - Значення email для перевірки
 * @returns {string} Повертає повідомлення про помилку або пустий рядок, якщо валідно
 */
export const validateEmail = (email) => {
  if (!email.trim()) {return "Email is required";}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {return "Email is invalid";}
  return "";
};

/**
 * Перевірка валідності паролю
 * @param {string} password - Значення паролю для перевірки
 * @returns {string} Повертає повідомлення про помилку або пустий рядок, якщо валідно
 */
export const validatePassword = (password) => {
  if (!password) {return "Password is required";}
  if (password.length < 6) {return "Password must be at least 6 characters";}
  return "";
};

/**
 * Універсальна перевірка обов’язкового поля
 * @param {any} value - Значення для перевірки
 * @param {string} fieldName - Назва поля (для повідомлення про помилку)
 * @returns {string} Повертає повідомлення про помилку або пустий рядок, якщо валідно
 */
export const validateRequired = (value, fieldName = "Field") => {
  if (!value || !value.toString().trim()) {
    return `${fieldName}`;
  }
  return "";
};
