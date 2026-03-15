import { useState } from "react";

/**
 * Хук для навігації між місяцями
 * @param {number} initialYear - поточний рік
 * @param {number} initialMonth - поточний місяць (0-11)
 * @returns {object} { currentYear, currentMonth, goToPreviousMonth, goToNextMonth, setCurrentYear, setCurrentMonth }
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
