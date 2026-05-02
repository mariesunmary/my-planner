import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./MonthlyBudgetPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { validateRequired } from "../utils/validation";
import { monthNames } from "../utils/date";
import { useFormHandlers } from "../hooks/useFormHandlers";
import { useMonthNavigation } from "../hooks/useMonthNavigation";
import api from "../services/api";

const categories = ["Food", "Transport", "Entertainment", "Health", "Shopping", "Other"];

const formatDate = (dateStr) => {
  if (!dateStr) {return "-";}
  const [year, month, day] = dateStr.split("T")[0].split("-");
  return `${day}-${month}-${year}`;
};

/**
 *
 */
function MonthlyBudgetPage() {
  const today = new Date();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "", amount: "", category: "",
    date: today.toISOString().split("T")[0],
  });
  const [errors, setErrors] = useState({});
  const [editedExpense, setEditedExpense] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef(null);

  const { currentYear, currentMonth, goToPreviousMonth, goToNextMonth } =
    useMonthNavigation(today.getFullYear(), today.getMonth());

  useEffect(() => {
    api.get("/expenses").then((res) => setExpenses(res.data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {setShowDropdown(false);}
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { handleChange, handleFocus } = useFormHandlers(form, setForm, setErrors);

  const handleAddExpense = async () => {
    const newErrors = {};
    const nameError = validateRequired(form.name, "Expense name");
    const amountError = validateRequired(form.amount, "Amount");
    if (nameError) {newErrors.name = nameError;}
    if (amountError) {newErrors.amount = amountError;}
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const res = await api.post("/expenses", form);
    setExpenses((prev) => [res.data, ...prev]);
    setForm({ name: "", amount: "", category: "", date: today.toISOString().split("T")[0] });
    setErrors({});
  };

  const handleDelete = async (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await api.delete(`/expenses/${id}`);
  };

  const handleEdit = (id) => {
    const expense = expenses.find((e) => e.id === id);
    setEditedExpense({ ...expense });
  };

  const handleEditChange = (e) => setEditedExpense({ ...editedExpense, [e.target.name]: e.target.value });

  const handleSaveEdit = async () => {
    const res = await api.put(`/expenses/${editedExpense.id}`, editedExpense);
    setExpenses((prev) => prev.map((e) => e.id === editedExpense.id ? res.data : e));
    setEditedExpense(null);
  };

  const handleCancelEdit = () => setEditedExpense(null);

  const handleCategoryFocus = (e) => {
    const rect = e.target.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    setShowDropdown(true);
  };

  const handleCategorySelect = (value) => {
    if (editedExpense !== null) {setEditedExpense({ ...editedExpense, category: value });}
    else {setForm({ ...form, category: value });}
    setShowDropdown(false);
  };

  const filteredExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Track your monthly expenses to stay on top of your budget and make smarter spending decisions.
      </p>

      <div className={common.monthNav}>
        <button onClick={goToPreviousMonth} className={common.navButton}>←</button>
        <span className={common.monthLabel}>{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={goToNextMonth} className={common.navButton}>→</button>
      </div>

      <div className={common.form}>
        <div className={common.inputGroup} style={{ flex: 2 }}>
          <label htmlFor="expense-name" className={common.srOnly}>Expense name</label>
          <input id="expense-name" className={`${common.input} ${errors.name ? common.inputError : ""}`}
            type="text" name="name" value={form.name} onChange={handleChange} onFocus={handleFocus}
            placeholder={errors.name || "Expense name"} />
        </div>
        <div className={common.inputGroup} style={{ flex: 1 }}>
          <label htmlFor="expense-amount" className={common.srOnly}>Amount</label>
          <input id="expense-amount" className={`${common.input} ${errors.amount ? common.inputError : ""}`}
            type="number" name="amount" value={form.amount} onChange={handleChange} onFocus={handleFocus}
            placeholder={errors.amount || "Amount"} />
        </div>
        <div className={common.inputGroup} style={{ flex: 1.5 }}>
          <label htmlFor="expense-category" className={common.srOnly}>Category</label>
          <input id="expense-category" className={common.input} type="text" name="category"
            value={form.category} onChange={handleChange} placeholder="Category" onFocus={handleCategoryFocus} />
        </div>
        <div className={common.inputGroup} style={{ flex: 1.5 }}>
          <label htmlFor="expense-date" className={common.srOnly}>Date</label>
          <input id="expense-date" className={common.input} type="date" name="date"
            value={form.date} onChange={handleChange} />
        </div>
        <button onClick={handleAddExpense} className={common.addButton}>+ Add Expense</button>
      </div>

      {(errors.name || errors.amount) && <div className={common.errorMessage}>Obligatory field is not filled</div>}

      <div className={styles.total}>Total this month: ${total.toFixed(2)}</div>

      <table className={styles.table}>
        <thead>
          <tr><th>Expense</th><th>Amount</th><th>Category</th><th>Date</th><th /></tr>
        </thead>
        <tbody>
          {filteredExpenses.map((e) => (
            <tr key={e.id}>
              <td>{editedExpense?.id === e.id ? <input name="name" value={editedExpense.name} onChange={handleEditChange} className={styles.inputCell} /> : e.name}</td>
              <td>{editedExpense?.id === e.id ? <input type="number" name="amount" value={editedExpense.amount} onChange={handleEditChange} className={styles.inputCell} /> : `$${parseFloat(e.amount).toFixed(2)}`}</td>
              <td>{editedExpense?.id === e.id ? <input name="category" value={editedExpense.category} onChange={handleEditChange} className={styles.inputCell} onFocus={handleCategoryFocus} /> : (e.category || "-")}</td>
              <td>{editedExpense?.id === e.id ? <input type="date" name="date" value={editedExpense.date.split("T")[0]} onChange={handleEditChange} className={styles.inputCell} /> : formatDate(e.date)}</td>
              <td>
                <EditableRowActions isEditing={editedExpense?.id === e.id}
                  onSave={handleSaveEdit} onCancel={handleCancelEdit}
                  onEdit={() => handleEdit(e.id)} onDelete={() => handleDelete(e.id)}
                  saveTitle="Save" cancelTitle="Cancel" editTitle="Edit expense" deleteTitle="Delete expense" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDropdown && createPortal(
        <div ref={dropdownRef} className={styles.dropdown}
          style={{ top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width }}>
          {categories.map((cat) => (
            <div key={cat} className={styles.dropdownItem} onMouseDown={() => handleCategorySelect(cat)}>{cat}</div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

export default MonthlyBudgetPage;
