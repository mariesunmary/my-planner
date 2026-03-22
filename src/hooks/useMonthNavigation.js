import { useState } from "react";

/**
 * Хук для навігації між місяцями та роками.
 * Дозволяє зручно перемикатися на попередній та наступний місяць, автоматично враховуючи зміну року.
 * @param {number} initialYear - Початковий рік.
 * @param {number} initialMonth - Початковий місяць (0-11, де 0 - січень).
 * @returns {{
 *   currentYear: number,
 *   currentMonth: number,
 *   goToPreviousMonth: Function,
 *   goToNextMonth: Function,
 *   setCurrentYear: Function,
 *   setCurrentMonth: Function
 * }} Геттери та сеттери для управління місяцем.
 */
export function useMonthNavigation(initialYear, initialMonth) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  return { currentYear, currentMonth, goToPreviousMonth, goToNextMonth, setCurrentYear, setCurrentMonth };
}
