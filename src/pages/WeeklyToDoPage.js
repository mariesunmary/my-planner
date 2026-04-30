import { useState, useEffect } from "react";
import styles from "./WeeklyToDoPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { getWeekDates } from "../utils/date";
import api from "../services/api";

/**
 *
 */
function WeeklyToDoPage() {
  const [week] = useState(getWeekDates());
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
        const date = task.week_key;
        if (!grouped[date]) {grouped[date] = [];}
        grouped[date].push({ id: task.id, text: task.text, done: task.done });
      });
      setTasks(grouped);
    }).finally(() => setLoading(false));
  }, []);

  const handleAddTask = async (date) => {
    const text = newTaskText[date]?.trim();
    if (!text) { setTaskError((prev) => ({ ...prev, [date]: true })); return; }
    const res = await api.post("/tasks", { week_key: date, text });
    const newTask = { id: res.data.id, text: res.data.text, done: res.data.done };
    setTasks((prev) => ({ ...prev, [date]: [...(prev[date] || []), newTask] }));
    setNewTaskText((prev) => ({ ...prev, [date]: "" }));
    setInputVisible((prev) => ({ ...prev, [date]: false }));
    setTaskError((prev) => ({ ...prev, [date]: false }));
  };

  const toggleTask = async (date, taskId) => {
    const task = tasks[date].find((t) => t.id === taskId);
    const done = !task.done;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) => t.id === taskId ? { ...t, done } : t),
    }));
    await api.put(`/tasks/${taskId}`, { done });
  };

  const deleteTask = async (date, taskId) => {
    setTasks((prev) => ({ ...prev, [date]: prev[date].filter((t) => t.id !== taskId) }));
    await api.delete(`/tasks/${taskId}`);
  };

  const saveEditedTask = async () => {
    if (!editingTask || !editingTask.text.trim()) {return;}
    const { id, date, text } = editingTask;
    setTasks((prev) => ({
      ...prev,
      [date]: prev[date].map((t) => t.id === id ? { ...t, text } : t),
    }));
    await api.put(`/tasks/${id}`, { text });
    setEditingTask(null);
  };

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Plan your weekly tasks day by day. Add, edit, and mark them as done.
      </p>

      <div className={styles.grid}>
        {week.map(({ label, date, fullDate }) => (
          <div key={fullDate} className={styles.dayColumn}>
            <div className={styles.dayHeader}>
              <div>{label}</div>
              <div className={styles.date}>{date}</div>
            </div>

            <ul className={styles.taskList}>
              {(tasks[fullDate] || []).map((task) => {
                const isEditing = editingTask?.id === task.id;
                return (
                  <li
                    key={task.id}
                    className={`${styles.task} ${task.done ? styles.done : ""}`}
                    onClick={() => { if (!isEditing) {toggleTask(fullDate, task.id);} }}
                    title={isEditing ? "" : "Click to toggle"}
                  >
                    {isEditing ? (
                      <div className={styles.inputWrapper}>
                        <input
                          className={styles.input}
                          value={editingTask.text}
                          onChange={(e) => setEditingTask({ ...editingTask, text: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {saveEditedTask();}
                            if (e.key === "Escape") {setEditingTask(null);}
                          }}
                          autoFocus
                        />
                        <div className={styles.inputButtons}>
                          <button className={styles.addConfirm} onClick={saveEditedTask}>Save</button>
                          <button className={styles.addCancel} onClick={() => setEditingTask(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span>{task.text}</span>
                        <EditableRowActions
                          isEditing={false}
                          onEdit={(e) => { e.stopPropagation(); setEditingTask({ id: task.id, date: fullDate, text: task.text }); }}
                          onDelete={(e) => { e.stopPropagation(); deleteTask(fullDate, task.id); }}
                          editTitle="Edit task"
                          deleteTitle="Delete task"
                        />
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {inputVisible[fullDate] ? (
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={`${common.input} ${taskError[fullDate] ? common.inputError : ""}`}
                  value={newTaskText[fullDate] || ""}
                  onChange={(e) => {
                    setNewTaskText((prev) => ({ ...prev, [fullDate]: e.target.value }));
                    if (taskError[fullDate]) {setTaskError((prev) => ({ ...prev, [fullDate]: false }));}
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {handleAddTask(fullDate);}
                    if (e.key === "Escape") {setInputVisible((prev) => ({ ...prev, [fullDate]: false }));}
                  }}
                  placeholder="New task"
                  autoFocus
                />
                <div className={styles.inputButtons}>
                  <button className={styles.addConfirm} onClick={() => handleAddTask(fullDate)}>Add</button>
                  <button className={styles.addCancel} onClick={() => setInputVisible((prev) => ({ ...prev, [fullDate]: false }))}>Cancel</button>
                </div>
                {taskError[fullDate] && <div className={common.errorMessage}>Obligatory field is not filled</div>}
              </div>
            ) : (
              <button className={common.addButton} onClick={() => setInputVisible((prev) => ({ ...prev, [fullDate]: true }))}>
                + Add Task
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeeklyToDoPage;
