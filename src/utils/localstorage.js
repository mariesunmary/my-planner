/**
 * Універсальні функції для роботи з localStorage
 */

import logger from './logger';

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
    logger.error('LocalStorage', `Error loading key: ${key}`, { error: e.message });
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
    logger.debug('LocalStorage', `Saved data for key: ${key}`);
  } catch (e) {
    logger.error('LocalStorage', `Error saving key: ${key}`, { error: e.message });
  }
}

const saveTimeouts = new Map();
/**
 * Відкладене збереження даних (Debounced) для оптимізації продуктивності
 * @param {string} key - Ключ
 * @param {any} value - Значення
 * @param {number} delay - Затримка у мс
 */
export function saveToStorageDebounced(key, value, delay = 500) {
  if (saveTimeouts.has(key)) {
    clearTimeout(saveTimeouts.get(key));
  }
  const timeoutId = setTimeout(() => {
    saveToStorage(key, value);
    saveTimeouts.delete(key);
  }, delay);
  saveTimeouts.set(key, timeoutId);
}

/**
 * Видалення даних
 * @param {string} key - Ключ елемента для видалення
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    logger.debug('LocalStorage', `Removed key: ${key}`);
  } catch (e) {
    logger.error('LocalStorage', `Error removing key: ${key}`, { error: e.message });
  }
}
