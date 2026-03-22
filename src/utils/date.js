/**
 * Утиліти для роботи з датами.
 */

// Масив назв днів тижня
export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Масив назв місяців
export const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

/**
 * Отримання дати поточного тижня (з понеділка по неділю).
 * @param {Date} [today] - Базова дата, від якої розраховується тиждень. За замовчуванням - поточна дата.
 * @returns {Array<{label: string, date: string, fullDate: string}>} Масив об'єктів з інформацією про кожен день тижня.
 */
export function getWeekDates(today = new Date()) {
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  return [...Array(7)].map((_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    return {
      label: weekDays[i], 
      date: date.toLocaleDateString("en-GB", { day: "numeric" }), 
      fullDate: date.toISOString().split("T")[0], 
    };
  });
}

/**
 * Генерація масиву днів для заданого місяця.
 * @param {number} year - Звичайний рік (наприклад, 2026).
 * @param {number} month - Індекс місяця (0 - січень, 11 - грудень).
 * @returns {number[]} Масив чисел, що представляють порядкові номери днів у заданому місяці.
 */
export function generateMonthDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [...Array(daysInMonth)].map((_, i) => i + 1);
}