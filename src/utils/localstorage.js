/**
 * Універсальні функції для роботи з localStorage
 */

/**
 * Завантаження даних
 * @param {string} key - Ключ елемента у localStorage
 * @param {any} fallback - Значення за замовчуванням, якщо дані відсутні або виникла помилка
 * @returns {any} Розпарсені дані з localStorage або fallback
 */
export function loadFromStorage(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error loading from storage", e);
    return fallback;
  }
}

/**
 * Збереження даних
 * @param {string} key - Ключ для збереження
 * @param {any} value - Значення для збереження (автоматично перетворюється в JSON)
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error saving to storage", e);
  }
}

/**
 * Видалення даних
 * @param {string} key - Ключ елемента для видалення
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Error removing from storage", e);
  }
}
