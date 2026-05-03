import { useState, useEffect } from "react";
import styles from "./WeeklyToDoPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import api from "../services/api";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

/**
 *
 * @param date
 */
function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

/**
 *
 * @param date
 */
function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

/**
 *
 * @param weekStart
 */
function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

/**
 *
 */
function WeeklyToDoPage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const todayKey = toKey(today);

  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [tasks, setTasks] = useState({});
  const [inputVisible, setInputVisible] = useState({});
  const [newTaskText, setNewTaskText] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/tasks").then((res) => {
      const grouped = {};
      res.data.forEach((task) => {
        if (!grouped[task.week_key]) {grouped[task.week_key] = [];}
        grouped[task.week_key].push({ id: task.id, text: task.text, done: task.done });
      });
      setTasks(grouped);
    }).finally(() => setLoading(false));
  }, []);

  const weekDays = getWeekDays(weekStart);

  const goToPrevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); };
  const goToNextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); };

  const goToToday = () => {
    setWeekStart(getWeekStart(today));
    setSelectedDate(todayKey);
    setCalYear(today.getFullYear());
    setCalMonth(today.getMonth());
  };

  const handleDayClick = (date) => {
    setSelectedDate(toKey(date));
    setWeekStart(getWeekStart(date));
    setCalYear(date.getFullYear());
    setCalMonth(date.getMonth());
  };

  const prevCalMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y-1); }
    else {setCalMonth((m) => m-1);}
  };
  const nextCalMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y+1); }
    else {setCalMonth((m) => m+1);}
  };

  // Mini calendar grid
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  let startDow = new Date(calYear, calMonth, 1).getDay() - 1;
  if (startDow < 0) {startDow = 6;}
  const calCells = [...Array(startDow).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)];

  const isInWeek = (day) => {
    if (!day) {return false;}
    const d = new Date(calYear, calMonth, day);
    const ws = new Date(weekStart);
    const we = new Date(weekStart);
    we.setDate(we.getDate()+6);
    return d >= ws && d <= we;
  };

  // Task handlers
  const handleAddTask = async (date) => {
    const text = newTaskText[date]?.trim();
    if (!text) { setTaskError((p) => ({ ...p, [date]: true })); return; }
    const res = await api.post("/tasks", { week_key: date, text });
    setTasks((p) => ({ ...p, [date]: [...(p[date]||[]), { id: res.data.id, text: res.data.text, done: res.data.done }] }));
    setNewTaskText((p) => ({ ...p, [date]: "" }));
    setInputVisible((p) => ({ ...p, [date]: false }));
    setTaskError((p) => ({ ...p, [date]: false }));
  };

  const toggleTask = async (date, taskId) => {
    const task = tasks[date].find((t) => t.id === taskId);
    const done = !task.done;
    setTasks((p) => ({ ...p, [date]: p[date].map((t) => t.id === taskId ? { ...t, done } : t) }));
    await api.put(`/tasks/${taskId}`, { done });
  };

  const deleteTask = async (date, taskId) => {
    setTasks((p) => ({ ...p, [date]: p[date].filter((t) => t.id !== taskId) }));
    await api.delete(`/tasks/${taskId}`);
  };

  const saveEditedTask = async () => {
    if (!editingTask?.text.trim()) {return;}
    const { id, date, text } = editingTask;
    setTasks((p) => ({ ...p, [date]: p[date].map((t) => t.id === id ? { ...t, text } : t) }));
    await api.put(`/tasks/${id}`, { text });
    setEditingTask(null);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate()+6);
  const weekLabel = weekStart.getMonth() === weekEnd.getMonth()
    ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekStart.getFullYear()}`
    : `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <div className={styles.layout}>

        {/* Mini Calendar */}
        <aside className={styles.miniCal}>
          <div className={styles.calNav}>
            <button className={styles.calNavBtn} onClick={prevCalMonth}>←</button>
            <span className={styles.calMonthLabel}>{MONTHS[calMonth]} {calYear}</span>
            <button className={styles.calNavBtn} onClick={nextCalMonth}>→</button>
          </div>
          <div className={styles.calGrid}>
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => (
              <div key={d} className={styles.calDayHeader}>{d}</div>
            ))}
            {calCells.map((day, i) => {
              const key = day ? `${calYear}-${String(calMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}` : null;
              const isToday = key === todayKey;
              const isSelected = key === selectedDate;
              const inWeek = isInWeek(day);
              return (
                <div key={i}
                  className={`${styles.calCell} ${!day ? styles.calEmpty : ""} ${inWeek ? styles.calInWeek : ""} ${isToday ? styles.calToday : ""} ${isSelected ? styles.calSelected : ""}`}
                  onClick={() => day && handleDayClick(new Date(calYear, calMonth, day))}
                >
                  {day}
                </div>
              );
            })}
          </div>
          <button className={styles.todayBtn} onClick={goToToday}>Today</button>
        </aside>

        {/* Week Panel */}
        <div className={styles.weekPanel}>
          <div className={styles.weekNav}>
            <button className={common.navButton} onClick={goToPrevWeek}>←</button>
            <span className={styles.weekLabel}>{weekLabel}</span>
            <button className={common.navButton} onClick={goToNextWeek}>→</button>
          </div>

          <div className={styles.dayList}>
            {weekDays.map((date, i) => {
              const key = toKey(date);
              const isSelectedDay = key === selectedDate;
              const isTodayDay = key === todayKey;
              const dayTasks = tasks[key] || [];

              return (
                <div key={key}
                  className={`${styles.daySection} ${isSelectedDay ? styles.daySelected : ""} ${isTodayDay ? styles.dayToday : ""}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <div className={styles.dayHeading}>
                    <span className={styles.dayName}>{DAY_NAMES[i]}</span>
                    <span className={`${styles.dayDate} ${isTodayDay ? styles.dayDateToday : ""}`}>
                      {date.getDate()} {MONTHS[date.getMonth()].slice(0,3)}
                    </span>
                    {isTodayDay && <span className={styles.todayBadge}>Today</span>}
                    <span className={styles.taskCount}>{dayTasks.length > 0 ? `${dayTasks.filter(t=>t.done).length}/${dayTasks.length}` : ""}</span>
                  </div>

                  <ul className={styles.taskList}>
                    {dayTasks.map((task) => {
                      const isEditing = editingTask?.id === task.id;
                      return (
                        <li key={task.id} className={`${styles.task} ${task.done ? styles.taskDone : ""}`}
                          onClick={(e) => { e.stopPropagation(); if (!isEditing) {toggleTask(key, task.id);} }}>
                          {isEditing ? (
                            <div className={styles.editWrapper} onClick={(e) => e.stopPropagation()}>
                              <input className={styles.editInput} value={editingTask.text}
                                onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                                onKeyDown={(e) => { if (e.key==="Enter") {saveEditedTask();} if (e.key==="Escape") {setEditingTask(null);} }}
                                autoFocus />
                              <button className={styles.confirmBtn} onClick={saveEditedTask}>Save</button>
                              <button className={styles.cancelBtn} onClick={() => setEditingTask(null)}>Cancel</button>
                            </div>
                          ) : (
                            <>
                              <span className={styles.taskCheck}>{task.done ? "✓" : "○"}</span>
                              <span className={styles.taskText}>{task.text}</span>
                              <EditableRowActions isEditing={false}
                                onEdit={(e) => { e.stopPropagation(); setEditingTask({ id: task.id, date: key, text: task.text }); }}
                                onDelete={(e) => { e.stopPropagation(); deleteTask(key, task.id); }}
                                editTitle="Edit task" deleteTitle="Delete task" />
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {inputVisible[key] ? (
                    <div className={styles.addWrapper} onClick={(e) => e.stopPropagation()}>
                      <input type="text"
                        className={`${styles.addInput} ${taskError[key] ? styles.addInputError : ""}`}
                        value={newTaskText[key] || ""}
                        onChange={(e) => { setNewTaskText((p) => ({ ...p, [key]: e.target.value })); if (taskError[key]) {setTaskError((p) => ({ ...p, [key]: false }));} }}
                        onKeyDown={(e) => { if (e.key==="Enter") {handleAddTask(key);} if (e.key==="Escape") {setInputVisible((p) => ({ ...p, [key]: false }));} }}
                        placeholder="New task…" autoFocus />
                      <button className={styles.confirmBtn} onClick={() => handleAddTask(key)}>Add</button>
                      <button className={styles.cancelBtn} onClick={() => setInputVisible((p) => ({ ...p, [key]: false }))}>Cancel</button>
                    </div>
                  ) : (
                    <button className={styles.addTaskBtn}
                      onClick={(e) => { e.stopPropagation(); setInputVisible((p) => ({ ...p, [key]: true })); }}>
                      + Add task
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyToDoPage;
