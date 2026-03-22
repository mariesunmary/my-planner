import { getWeekDates, generateMonthDays } from './date';

/**
 * Цей файл слугує прикладом Test-Driven Documentation (TDD). 
 * Тести нижче демонструють, як правильно використовувати функції для роботи з датами
 * та які результати від них очікувати.
 */

describe('Date Utilities', () => {
  describe('getWeekDates', () => {
    it('повинен повертати масив з 7 днів', () => {
      const week = getWeekDates(new Date('2026-03-22'));
      expect(week).toHaveLength(7);
      
      // Перевіряємо, що перший день тижня - понеділок ('Mon')
      expect(week[0].label).toBe('Mon');
      
      // Перевіряємо, що останній день - неділя ('Sun')
      expect(week[6].label).toBe('Sun');
    });

    it('повинен правильно форматувати об`єкти днів', () => {
      const week = getWeekDates(new Date('2026-03-22')); // Це неділя
      
      // Понеділок того тижня був 2026-03-16
      expect(week[0].fullDate).toBe('2026-03-16');
      expect(week[0].date).toBe('16'); // число
    });
  });

  describe('generateMonthDays', () => {
    it('повинен генерувати правильну кількість днів для січня (31)', () => {
      const days = generateMonthDays(2026, 0); // 0 = січень
      expect(days).toHaveLength(31);
      expect(days[0]).toBe(1);
      expect(days[30]).toBe(31);
    });

    it('повинен враховувати високосні роки для лютого', () => {
      const days2024 = generateMonthDays(2024, 1); // 1 = лютий, 2024 - високосний
      expect(days2024).toHaveLength(29);

      const days2026 = generateMonthDays(2026, 1); // 1 = лютий, 2026 - не високосний
      expect(days2026).toHaveLength(28);
    });
  });
});
