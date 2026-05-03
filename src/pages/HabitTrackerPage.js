import { useState, useEffect } from "react";
import styles from "./HabitTrackerPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { generateMonthDays, monthNames } from "../utils/date";
import { useMonthNavigation } from "../hooks/useMonthNavigation";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

/**
 *
 */
function HabitTrackerPage() {
  const { showToast } = useToast();
  const today = new Date();
  const { currentYear, currentMonth, goToPreviousMonth, goToNextMonth } =
    useMonthNavigation(today.getFullYear(), today.getMonth());

  const [habits, setHabits] = useState([]);
  const [track, setTrack] = useState({});
  const [newHabit, setNewHabit] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedHabit, setEditedHabit] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const days = generateMonthDays(currentYear, currentMonth);

  const toDate = (day) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  useEffect(() => {
    Promise.all([api.get("/habits"), api.get("/habits/tracking")])
      .then(([habitsRes, trackRes]) => {
        setHabits(habitsRes.data);
        const trackObj = {};
        trackRes.data.forEach((r) => {
          const dateStr = r.date.slice(0, 10);
          trackObj[`${r.habit_id}-${dateStr}`] = true;
        });
        setTrack(trackObj);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddHabit = async () => {
    if (!newHabit.trim()) { setError(true); return; }
    const res = await api.post("/habits", { name: newHabit.trim() });
    setHabits((prev) => [...prev, res.data]);
    setNewHabit("");
    setError(false);
  };

  const handleDeleteHabit = async (id) => {
    await api.delete(`/habits/${id}`);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setTrack((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (k.startsWith(`${id}-`)) {delete next[k];} });
      return next;
    });
    if (editingId === id) { setEditingId(null); setEditedHabit(""); }
  };

  const handleEditHabit = (habit) => {
    setEditingId(habit.id);
    setEditedHabit(habit.name);
  };

  const handleSaveHabit = async (id) => {
    const newName = editedHabit.trim();
    if (!newName) {return;}
    const habit = habits.find((h) => h.id === id);
    if (newName === habit.name) { setEditingId(null); setEditedHabit(""); return; }
    const res = await api.put(`/habits/${id}`, { name: newName });
    setHabits((prev) => prev.map((h) => (h.id === id ? res.data : h)));
    setEditingId(null);
    setEditedHabit("");
  };

  const handleCancelEdit = () => { setEditingId(null); setEditedHabit(""); };

  const toggleDay = async (habitId, day) => {
    const date = toDate(day);
    const key = `${habitId}-${date}`;
    const done = !track[key];
    const todayStr = toDate(today.getDate());
    if (done && date === todayStr && habits.length > 0) {
      const newTrack = { ...track, [key]: true };
      if (habits.every((h) => newTrack[`${h.id}-${todayStr}`])) {
        showToast("All habits done!", "Perfect day — every habit completed! 🌱", "🌟");
      }
    }
    setTrack((prev) => ({ ...prev, [key]: done }));
    await api.post("/habits/tracking", { habit_id: habitId, date, done });
  };

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Build better habits, one day at a time. 🌱
        Track your daily routines and stay consistent all month long.
        Every checkmark is a small victory!
      </p>

      <div className={common.monthNav}>
        <button onClick={goToPreviousMonth} className={common.navButton}>←</button>
        <span className={common.monthLabel}>{monthNames[currentMonth]} {currentYear}</span>
        <button onClick={goToNextMonth} className={common.navButton}>→</button>
      </div>

      <div className={common.formWrapper}>
        <div className={common.form}>
          <div className={common.inputGroup} style={{ flex: 1 }}>
            <input
              type="text"
              value={newHabit}
              onChange={(e) => { setNewHabit(e.target.value); if (error) {setError(false);} }}
              onFocus={() => setError(false)}
              placeholder="Enter a new habit"
              className={`${common.input} ${error ? common.inputError : ""}`}
            />
          </div>
          <button onClick={handleAddHabit} className={common.addButton}>+ Add Habit</button>
        </div>
        {error && <div className={common.errorMessage}>Obligatory field is not filled</div>}
      </div>

      <div className={styles.grid}>
        <div className={styles.headerRow}>
          <div className={styles.habitHeader}>Habit</div>
          {days.map((day) => {
            const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
            return (
              <div key={day} className={`${styles.dayHeader} ${isToday ? styles.todayHeader : ""}`}>{day}</div>
            );
          })}
          <div className={styles.pctHeader}>%</div>
        </div>

        {habits.map((habit) => {
          const completed = days.filter((day) => track[`${habit.id}-${toDate(day)}`]).length;
          const pct = days.length > 0 ? Math.round((completed / days.length) * 100) : 0;
          return (
            <div key={habit.id} className={styles.habitRow}>
              <div className={styles.habitName}>
                <div className={styles.habitTitle}>
                  {editingId === habit.id ? (
                    <input
                      type="text"
                      value={editedHabit}
                      onChange={(e) => setEditedHabit(e.target.value)}
                      className={common.input}
                    />
                  ) : (
                    <span>{habit.name}</span>
                  )}
                </div>
                <div className={styles.habitActions}>
                  <EditableRowActions
                    isEditing={editingId === habit.id}
                    onSave={() => handleSaveHabit(habit.id)}
                    onCancel={handleCancelEdit}
                    onEdit={() => handleEditHabit(habit)}
                    onDelete={() => handleDeleteHabit(habit.id)}
                    editTitle="Edit habit"
                    deleteTitle="Delete habit"
                    saveTitle="Save"
                    cancelTitle="Cancel"
                  />
                </div>
              </div>
              {days.map((day) => {
                const key = `${habit.id}-${toDate(day)}`;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                return (
                  <div
                    key={day}
                    className={`${styles.dayCell} ${track[key] ? styles.checked : ""} ${isToday ? styles.todayCell : ""}`}
                    onClick={() => toggleDay(habit.id, day)}
                  />
                );
              })}
              <div className={`${styles.pctCell} ${pct === 100 ? styles.pctDone : ""}`}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HabitTrackerPage;
