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

// Отримання дати поточного тижня (з понеділка по неділю)
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

// Генерація масиву днів для заданого місяця
export function generateMonthDays(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [...Array(daysInMonth)].map((_, i) => i + 1);
}