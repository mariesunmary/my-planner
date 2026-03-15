import React, { useState, useEffect } from "react";
import styles from "./HabitTrackerPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { loadFromStorage, saveToStorage } from "../utils/localstorage";
import { generateMonthDays, monthNames } from "../utils/date";
import { useMonthNavigation } from "../hooks/useMonthNavigation";

/**
 * Сторінка Habit Tracker.
 * Дозволяє користувачеві створювати, редагувати, видаляти звички
 * та відмічати їх виконання по днях поточного місяця.
 */

function HabitTrackerPage() {
  const today = new Date();

  /**
   * Хук для перемикання місяців.
   * @type {{ currentYear: number, currentMonth: number, goToPreviousMonth: Function, goToNextMonth: Function }}
   */
  const { currentYear, currentMonth, goToPreviousMonth, goToNextMonth } =
    useMonthNavigation(today.getFullYear(), today.getMonth());


  /**
   * Поточний користувач (з localStorage)
   * @type {{ email: string } | null}
   */
  const currentUser = loadFromStorage("currentUser", null);

  // Ключ користувача для збереження даних
  const userKey = currentUser ? currentUser.email : "guest";

  // Список звичок за місяцями
  const [habitsByMonth, setHabitsByMonth] = useState(() =>
    loadFromStorage(`habitsByMonth_${userKey}`, {})
  ); 

  // Трек виконання звичок
  const [track, setTrack] = useState(() =>
    loadFromStorage(`track_${userKey}`, {})
  );

  // Текст нової звички
  const [newHabit, setNewHabit] = useState("");

  // Індекс звички, що редагується
  const [editingIndex, setEditingIndex] = useState(null);

  // Текст відредагованої звички
  const [editedHabit, setEditedHabit] = useState("");

  // Стан помилки введення
  const [error, setError] = useState(false);

  // Масив днів поточного місяця
  const days = generateMonthDays(currentYear, currentMonth);

  // Ключ поточного місяця
  const monthKey = `${currentYear}-${currentMonth}`;

  // Масив звичок для поточного місяця 
  const habits = habitsByMonth[monthKey] || [];


  /**
   * Зберігає звички у localStorage при зміні стану
   */
  useEffect(() => {
    saveToStorage(`habitsByMonth_${userKey}`, habitsByMonth);
  }, [habitsByMonth, userKey]);

  /**
   * Зберігає трек виконання у localStorage при зміні стану
   */
  useEffect(() => {
    saveToStorage(`track_${userKey}`, track);
  }, [track, userKey]);

  
  /**
   * Додавання нової звички.
   * - Перевіряє, щоб поле не було порожнім
   * - Додає звичку у поточний місяць
   * - Очищує інпут і помилку
   */
  const handleAddHabit = () => {
    if (!newHabit.trim()) {
      setError(true);
      return;
    }
    setHabitsByMonth((prev) => ({
      ...prev,
      [monthKey]: [...(prev[monthKey] || []), newHabit.trim()],
    }));
    setNewHabit("");
    setError(false);
  };

  /**
   * Видалення звички.
   * - Видаляє звичку з поточного місяця
   * - Очищує пов’язані записи трекінгу у track
   * @param {number} index — індекс звички у списку
   */
  const handleDeleteHabit = (index) => {
    const name = habits[index];
    setTrack((prev) => {
      const next = { ...prev };
      for (let d = 1; d <= days.length; d++) {
        const key = `${name}-${monthKey}-${d}`;
        if (key in next) {delete next[key];}
      }
      return next;
    });
    setHabitsByMonth((prev) => ({
      ...prev,
      [monthKey]: prev[monthKey].filter((_, i) => i !== index),
    }));

    if (editingIndex === index) {
      setEditingIndex(null);
      setEditedHabit("");
    }
  };

  /**
   * Початок редагування звички.
   * @param {number} index — індекс звички для редагування
   */
  const handleEditHabit = (index) => {
    setEditingIndex(index);
    setEditedHabit(habits[index]);
  };

  /**
   * Збереження відредагованої звички.
   * - Оновлює назву звички
   * - Переносить дані трекінгу на новий ключ
   * @param {number} index — індекс звички
   */
  const handleSaveHabit = (index) => {
    const newName = editedHabit.trim();
    if (!newName) {return;}

    const oldName = habits[index];

    setTrack((prev) => {
      const next = { ...prev };
      for (let d = 1; d <= days.length; d++) {
        const oldKey = `${oldName}-${monthKey}-${d}`;
        const newKey = `${newName}-${monthKey}-${d}`;
        if (oldKey in next) {
          next[newKey] = next[oldKey];
          delete next[oldKey];
        }
      }
      return next;
    });

    setHabitsByMonth((prev) => ({
      ...prev,
      [monthKey]: prev[monthKey].map((h, i) => (i === index ? newName : h)),
    }));

    setEditingIndex(null);
    setEditedHabit("");
  };

  /**
   * Скасування редагування звички.
   */
  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedHabit("");
  };

  /**
   * Перемикання стану виконання звички для певного дня.
   * @param {string} habit — назва звички
   * @param {number} day — день місяця
   */
  const toggleDay = (habit, day) => {
    const key = `${habit}-${monthKey}-${day}`;
    setTrack((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Візуальні компоненти сторінки
  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      {/* Опис */}
      <p className={common.intro}>
        Build better habits, one day at a time. 🌱
        Track your daily routines and stay consistent all month long.
        Every checkmark is a small victory!
      </p>

      {/* Панель навігації по місяцях */}
      <div className={common.monthNav}>
        <button onClick={goToPreviousMonth} className={common.navButton}>←</button>
        <span className={common.monthLabel}>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={goToNextMonth} className={common.navButton}>→</button>
      </div>

      {/* Форма для додавання звички */}
      <div className={common.formWrapper}>
        <div className={common.form}>
          <input
            type="text"
            value={newHabit}
            onChange={(e) => {
              setNewHabit(e.target.value);
              if (error) {setError(false);}
            }}
            onFocus={() => setError(false)}
            placeholder="Enter a new habit"
            className={`${common.input} ${error ? common.inputError : ""}`}
          />
          <button onClick={handleAddHabit} className={common.addButton}>
            + Add Habit
          </button>
        </div>

        {error && (
          <div className={common.errorMessage}>
            Obligatory field is not filled
          </div>
        )}
      </div>

      {/* Таблиця трекінгу */}
      <div className={styles.grid}>
        <div className={styles.headerRow}>
          <div className={styles.habitHeader}>Habit</div>
          {days.map((day) => (
            <div key={day} className={styles.dayHeader}>
              {day}
            </div>
          ))}
        </div>

        {/* Рядки зі звичками */}
        {habits.map((habit, hIndex) => (
          <div key={hIndex} className={styles.habitRow}>
            <div className={styles.habitName}>
              <div className={styles.habitTitle}>
                {editingIndex === hIndex ? (
                  <input
                    type="text"
                    value={editedHabit}
                    onChange={(e) => setEditedHabit(e.target.value)}
                    className={common.input}
                  />
                ) : (
                  <span>{habit}</span>
                )}
              </div>

              <div className={styles.habitActions}>
                <EditableRowActions
                  isEditing={editingIndex === hIndex}
                  onSave={() => handleSaveHabit(hIndex)}
                  onCancel={handleCancelEdit}
                  onEdit={() => handleEditHabit(hIndex)}
                  onDelete={() => handleDeleteHabit(hIndex)}
                  editTitle="Edit habit"
                  deleteTitle="Delete habit"
                  saveTitle="Save"
                  cancelTitle="Cancel"
                />
              </div>
            </div>

            {/* Клітинки днів місяця */}
            {days.map((day) => {
              const key = `${habit}-${currentYear}-${currentMonth}-${day}`;
              return (
                <div
                  key={day}
                  className={`${styles.dayCell} ${ track[key] ? styles.checked : ""}`}
                  onClick={() => toggleDay(habit, day)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HabitTrackerPage;
