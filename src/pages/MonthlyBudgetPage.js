import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./MonthlyBudgetPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { validateRequired } from "../utils/validation";
import { loadFromStorage, saveToStorage } from "../utils/localstorage";
import { monthNames } from "../utils/date";
import { useFormHandlers } from "../hooks/useFormHandlers";
import { useMonthNavigation } from "../hooks/useMonthNavigation";

/**
 * Сторінка Monthly Budget.
 * Дозволяє користувачеві відслідковувати та редагувати щомісячні витрати.
 */

/** 
 * Список категорій витрат.
 * @type {string[]} 
 */
const categories = ["Food", "Transport", "Entertainment", "Health", "Shopping", "Other"];

function MonthlyBudgetPage() {
  const today = new Date();

  /**
   * Поточний користувач (з localStorage).
   * @type {{ email: string } | null}
   */
  const currentUser = loadFromStorage("currentUser", null);

  /** Ключ користувача для збереження витрат у localStorage */
  const userKey = currentUser ? currentUser.email : "guest";

  /** Масив усіх витрат користувача */
  const [expenses, setExpenses] = useState(() => loadFromStorage(`expenses_${userKey}`, []));

  /** Стан форми додавання нової витрати */
  const [form, setForm] = useState({
    name: "",
    amount: "",
    category: "",
    date: today.toISOString().split("T")[0],
  });
  /** Об'єкт помилок форми */
  const [errors, setErrors] = useState({});

  /** Індекс витрати, що редагується */
  const [editIndex, setEditIndex] = useState(null);

  /** Стан редагованої витрати */
  const [editedExpense, setEditedExpense] = useState(null);

  /** Стан відображення дропдауну з категоріями */
  const [showDropdown, setShowDropdown] = useState(false);

  /** Позиція дропдауну для категорій */
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  /** Ref для дропдауну */
  const dropdownRef = useRef(null);

  /**
   * Збереження витрати у localStorage при зміні стану
   */
  useEffect(() => {
    saveToStorage(`expenses_${userKey}`, expenses);
  }, [expenses, userKey]);

  /** Хендлери зміни та фокусу полів форми */
  const { handleChange, handleFocus } = useFormHandlers(form, setForm, setErrors);

  /**
   * Додавання нової витрати.
   * - Перевіряє обов'язкові поля.
   * - Додає витрату у список expenses.
   * - Очищує форму та помилки.
   */
  const handleAddExpense = () => {
    let newErrors = {};
    const nameError = validateRequired(form.name, "Expense name");
    const amountError = validateRequired(form.amount, "Amount");

    if (nameError) newErrors.name = nameError;
    if (amountError) newErrors.amount = amountError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setExpenses([...expenses, { ...form }]);
    setForm({
      name: "",
      amount: "",
      category: "",
      date: today.toISOString().split("T")[0],
    });
    setErrors({});
  };

  /**
   * Видалення витрати.
   * @param {number} index - Індекс видаляємого елемента.
   */
  const handleDelete = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
    if (editIndex === index) {
      setEditIndex(null);
      setEditedExpense(null);
    }
  };

  /**
   * Початок редагування витрати.
   * @param {number} index - Індекс елемента для редагування.
   */
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditedExpense({ ...expenses[index] });
  };

  /**
   * Зміна значень редагованої витрати.
   * @param {React.ChangeEvent<HTMLInputElement>} e - Подія зміни інпуту.
   */
  const handleEditChange = (e) => {
    setEditedExpense({ ...editedExpense, [e.target.name]: e.target.value });
  };

  /**
   * Збереження редагованої витрати.
   */
  const handleSaveEdit = () => {
    const updated = [...expenses];
    updated[editIndex] = editedExpense;
    setExpenses(updated);
    setEditIndex(null);
    setEditedExpense(null);
  };

  /**
   * Скасування редагування.
   */
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedExpense(null);
  };

  /**
   * Обробка фокусу на полі категорії для відкриття дропдауну.
   * @param {React.FocusEvent<HTMLInputElement>} e - Подія фокусу.
   */
  const handleCategoryFocus = (e) => {
    const rect = e.target.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setShowDropdown(true);
  };

  /**
   * Вибір категорії з дропдауну.
   * @param {string} value - Назва категорії.
   */
  const handleCategorySelect = (value) => {
    if (editIndex !== null) {
      setEditedExpense({ ...editedExpense, category: value });
    } else {
      setForm({ ...form, category: value });
    }
    setShowDropdown(false);
  };

  /** Закриття дропдауну при кліку поза ним */
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * Хук для перемикання місяців.
   * @type {{ currentYear: number, currentMonth: number, goToPreviousMonth: Function, goToNextMonth: Function }}
   */
  const { currentYear, currentMonth, goToPreviousMonth, goToNextMonth } =
    useMonthNavigation(today.getFullYear(), today.getMonth());

  /**
   * Масив витрат, відфільтрований для поточного року та місяця.
   * 
   * Відбирає лише ті записи, у яких:
   * - рік дати збігається з поточним роком (`currentYear`);
   * - місяць дати збігається з поточним місяцем (`currentMonth`).
   *
   * @constant
   * @type {Array<{ name: string, amount: string, category: string, date: string }>}
   */
  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  /** Загальна сума витрат за місяць */
  const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Track your monthly expenses to stay on top of your budget and make smarter spending decisions.
      </p>

      {/* Навігація по місяцях */}
      <div className={common.monthNav}>
        <button onClick={goToPreviousMonth} className={common.navButton}>←</button>
        <span className={common.monthLabel}>
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={goToNextMonth} className={common.navButton}>→</button>
      </div>

      {/* Форма додавання витрати */}
      <div className={common.form}>
        <div className={common.inputGroup}>
  <label htmlFor="expense-name" className={common.srOnly}>Expense name</label>
  <input
    id="expense-name"
    className={`${common.input} ${errors.name ? common.inputError : ""}`}
    type="text"
    name="name"
    value={form.name}
    onChange={handleChange}
    onFocus={handleFocus}
    placeholder={errors.name || "Expense name"}
    style={{ flex: 2 }}
  />
</div>

<div className={common.inputGroup}>
  <label htmlFor="expense-amount" className={common.srOnly}>Amount</label>
  <input
    id="expense-amount"
    className={`${common.input} ${errors.amount ? common.inputError : ""}`}
    type="number"
    name="amount"
    value={form.amount}
    onChange={handleChange}
    onFocus={handleFocus}
    placeholder={errors.amount || "Amount"}
    style={{ flex: 1 }}
  />
</div>

<div className={common.inputGroup}>
  <label htmlFor="expense-category" className={common.srOnly}>Category</label>
  <input
    id="expense-category"
    className={common.input}
    type="text"
    name="category"
    value={form.category}
    onChange={handleChange}
    placeholder="Category"
    style={{ flex: 1.5 }}
    onFocus={handleCategoryFocus}
  />
</div>

<div className={common.inputGroup}>
  <label htmlFor="expense-date" className={common.srOnly}>Date</label>
  <input
    id="expense-date"
    className={common.input}
    type="date"
    name="date"
    value={form.date}
    onChange={handleChange}
    style={{ flex: 1.5 }}
  />
</div>

        <button onClick={handleAddExpense} className={common.addButton}>
          + Add Expense
        </button>
      </div>

      {(errors.name || errors.amount) && (
        <div className={common.errorMessage}>Obligatory field is not filled</div>
      )}

      <div className={styles.total}>Total this month: ${total.toFixed(2)}</div>

      {/* Таблиця витрат */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Expense</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((e, i) => (
            <tr key={i}>
              <td>
                {editIndex === i ? (
                  <input
                    name="name"
                    value={editedExpense.name}
                    onChange={handleEditChange}
                    className={styles.inputCell}
                  />
                ) : (
                  e.name
                )}
              </td>

              <td>
                {editIndex === i ? (
                  <input
                    type="number"
                    name="amount"
                    value={editedExpense.amount}
                    onChange={handleEditChange}
                    className={styles.inputCell}
                  />
                ) : (
                  `$${parseFloat(e.amount).toFixed(2)}`
                )}
              </td>

              <td>
                {editIndex === i ? (
                  <input
                    name="category"
                    value={editedExpense.category}
                    onChange={handleEditChange}
                    className={styles.inputCell}
                    onFocus={handleCategoryFocus}
                  />
                ) : (
                  e.category || "-"
                )}
              </td>

              <td>
                {editIndex === i ? (
                  <input
                    type="date"
                    name="date"
                    value={editedExpense.date}
                    onChange={handleEditChange}
                    className={styles.inputCell}
                  />
                ) : (
                  e.date
                )}
              </td>

              <td>
                <EditableRowActions
                  isEditing={editIndex === i}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onEdit={() => handleEdit(i)}
                  onDelete={() => handleDelete(i)}
                  saveTitle="Save"
                  cancelTitle="Cancel"
                  editTitle="Edit expense"
                  deleteTitle="Delete expense"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Дропдаун з категоріями */}
      {showDropdown &&
        createPortal(
          <div
            ref={dropdownRef}
            className={styles.dropdown}
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
            }}
          >
            {categories.map((cat) => (
              <div
                key={cat}
                className={styles.dropdownItem}
                onMouseDown={() => handleCategorySelect(cat)}
              >
                {cat}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export default MonthlyBudgetPage;
