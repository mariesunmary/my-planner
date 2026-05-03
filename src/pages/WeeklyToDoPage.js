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

  const [view, setView] = useState("week");
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState(today);
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

  // Navigation
  const goToPrev = () => {
    if (view === "week") { const d = new Date(weekStart); d.setDate(d.getDate()-7); setWeekStart(d); }
    else if (view === "day") { const d = new Date(selectedDate); d.setDate(d.getDate()-1); setSelectedDate(d); }
    else { if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y-1); } else {setCalMonth((m) => m-1);} }
  };
  const goToNext = () => {
    if (view === "week") { const d = new Date(weekStart); d.setDate(d.getDate()+7); setWeekStart(d); }
    else if (view === "day") { const d = new Date(selectedDate); d.setDate(d.getDate()+1); setSelectedDate(d); }
    else { if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y+1); } else {setCalMonth((m) => m+1);} }
  };

  const switchView = (v) => {
    setView(v);
    if (v === "week") {setWeekStart(getWeekStart(selectedDate));}
    if (v === "day") {setCalYear(selectedDate.getFullYear()); setCalMonth(selectedDate.getMonth());}
  };

  // Navigation label
  const weekDays = getWeekDays(weekStart);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate()+6);
  const navLabel = view === "month"
    ? `${MONTHS[calMonth]} ${calYear}`
    : view === "week"
      ? weekStart.getMonth() === weekEnd.getMonth()
        ? `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekStart.getFullYear()}`
        : `${MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`
      : `${DAY_NAMES[(selectedDate.getDay()+6)%7]}, ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;

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

  // Reusable day section
  const renderDaySection = (date, compact = false) => {
    const key = toKey(date);
    const isTodayDay = key === todayKey;
    const isSelectedDay = toKey(date) === toKey(selectedDate);
    const dayTasks = tasks[key] || [];

    return (
      <div key={key}
        className={`${styles.daySection} ${isSelectedDay && view !== "week" ? styles.daySelected : ""} ${isTodayDay ? styles.dayToday : ""}`}
        onClick={() => { setSelectedDate(date); if (view === "month") {switchView("day");} }}
      >
        <div className={styles.dayHeading}>
          <span className={styles.dayName}>{DAY_NAMES[(date.getDay()+6)%7]}</span>
          <span className={`${styles.dayDate} ${isTodayDay ? styles.dayDateToday : ""}`}>
            {date.getDate()} {MONTHS[date.getMonth()].slice(0,3)}
          </span>
          {isTodayDay && <span className={styles.todayBadge}>Today</span>}
          <span className={styles.taskCount}>{dayTasks.length > 0 ? `${dayTasks.filter((t)=>t.done).length}/${dayTasks.length}` : ""}</span>
        </div>

        {!compact && (
          <>
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
          </>
        )}

        {compact && dayTasks.length > 0 && (
          <div className={styles.monthDots}>
            {dayTasks.slice(0,3).map((t) => (
              <span key={t.id} className={`${styles.dot} ${t.done ? styles.dotDone : ""}`} />
            ))}
            {dayTasks.length > 3 && <span className={styles.dotMore}>+{dayTasks.length-3}</span>}
          </div>
        )}
      </div>
    );
  };

  // Month grid
  const renderMonth = () => {
    const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
    let startDow = new Date(calYear, calMonth, 1).getDay() - 1;
    if (startDow < 0) {startDow = 6;}
    const cells = [...Array(startDow).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i+1)];

    return (
      <div className={styles.monthGrid}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => (
          <div key={d} className={styles.monthHeader}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) {return <div key={i} className={styles.monthEmpty} />;}
          const date = new Date(calYear, calMonth, day);
          const key = toKey(date);
          const isTodayDay = key === todayKey;
          const dayTasks = tasks[key] || [];
          return (
            <div key={i} className={`${styles.monthCell} ${isTodayDay ? styles.monthCellToday : ""}`}
              onClick={() => { setSelectedDate(date); switchView("day"); }}>
              <span className={`${styles.monthDay} ${isTodayDay ? styles.monthDayToday : ""}`}>{day}</span>
              {dayTasks.length > 0 && (
                <div className={styles.monthDots}>
                  {dayTasks.slice(0,3).map((t) => (
                    <span key={t.id} className={`${styles.dot} ${t.done ? styles.dotDone : ""}`} />
                  ))}
                  {dayTasks.length > 3 && <span className={styles.dotMore}>+{dayTasks.length-3}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Plan your tasks day by day. Switch between month, week and day views to stay organised.
      </p>

      <div className={styles.toolbar}>
        <div className={styles.viewToggle}>
          {["month","week","day"].map((v) => (
            <button key={v} className={`${styles.viewBtn} ${view===v ? styles.viewBtnActive : ""}`}
              onClick={() => switchView(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <div className={styles.navGroup}>
          <button className={common.navButton} onClick={goToPrev}>←</button>
          <span className={styles.navLabel}>{navLabel}</span>
          <button className={common.navButton} onClick={goToNext}>→</button>
        </div>
      </div>

      {view === "month" && renderMonth()}
      {view === "week" && <div className={styles.dayList}>{weekDays.map((d) => renderDaySection(d))}</div>}
      {view === "day" && <div className={styles.dayList}>{renderDaySection(selectedDate)}</div>}
    </div>
  );
}

export default WeeklyToDoPage;
