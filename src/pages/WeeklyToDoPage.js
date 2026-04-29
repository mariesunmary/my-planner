import React, { useState, useEffect } from "react";
import styles from "./WeeklyToDoPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { loadFromStorage, saveToStorage } from "../utils/localstorage";
import { getWeekDates } from "../utils/date";

/**
 * Сторінка Weekly To-Do.
 * - Відображає дні поточного тижня
 * - Дозволяє додавати, редагувати, видаляти та виконувати завдання
 * - Використовує localStorage для збереження завдань користувача
 */
function WeeklyToDoPage() {

  // Стани
  const [week] = useState(getWeekDates());
  const currentUser = loadFromStorage("currentUser", null);
  const userKey = currentUser ? currentUser.email : "guest";
  const [tasks, setTasks] = useState(() => loadFromStorage(`weeklyTasks_${userKey}`, {}));
  const [inputVisible, setInputVisible] = useState({});
  const [newTaskText, setNewTaskText] = useState({});
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState({});

  // Збереження завдань користувача при зміні tasks
  useEffect(() => {
    saveToStorage(`weeklyTasks_${userKey}`, tasks);
  }, [tasks, userKey]);

  // Обробники
  /**
   * Поле для додавання нового завдання по дню
   * @param {string} date — дата завдання
   */
  const handleAddTask = (date) => {
    const text = newTaskText[date]?.trim();
    if (!text) {
      setTaskError((prev) => ({ ...prev, [date]: true }));
      return;
    }

    setTasks((prev) => ({
      ...prev,
      [date]: [...(prev[date] || []), { text, done: false }],
    }));

    setNewTaskText((prev) => ({ ...prev, [date]: "" }));
    setInputVisible((prev) => ({ ...prev, [date]: false }));
    setTaskError((prev) => ({ ...prev, [date]: false }));
  };

  /**
   * Перемикання стану виконання завдання 
   * @param {string} date — дата дня
   * @param {number} index — індекс завдання
   */
  const toggleTask = (date, index) => {
    setTasks((prev) => {
      const newTasks = [...prev[date]];
      newTasks[index].done = !newTasks[index].done;
      return { ...prev, [date]: newTasks };
    });
  };

  /**
   * Видаляє завдання по дню та індексу
   * @param {string} date — дата дня
   * @param {number} index — індекс завдання
   */
  const deleteTask = (date, index) => {
    setTasks((prev) => {
      const newTasks = [...prev[date]];
      newTasks.splice(index, 1);
      return { ...prev, [date]: newTasks };
    });
  };

  /**
   * Збереження редагованого завдання
   */
  const saveEditedTask = () => {
    if (!editingTask || !editingTask.text.trim()) return;

    const { date, index, text } = editingTask;
    setTasks((prev) => {
      const updated = [...prev[date]];
      updated[index].text = text;
      return { ...prev, [date]: updated };
    });

    setEditingTask(null);
  };

  // Візуальні компоненти сторінки
  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      {/* Інтро-текст */}
      <p className={common.intro}>
        Plan your weekly tasks day by day. Add, edit, and mark them as done.
      </p>

      {/* Сітка по днях тижня */}
      <div className={styles.grid}>
        {week.map(({ label, date, fullDate }) => (
          <div key={fullDate} className={styles.dayColumn}>
            {/* Заголовок дня */}
            <div className={styles.dayHeader}>
              <div>{label}</div>
              <div className={styles.date}>{date}</div>
            </div>

            {/* Список задач */}
            <ul className={styles.taskList}>
              {(tasks[fullDate] || []).map((task, index) => {
                const isEditing =
                  editingTask?.date === fullDate &&
                  editingTask?.index === index;

                return (
                  <li
                    key={index}
                    className={`${styles.task} ${task.done ? styles.done : ""}`}
                    onClick={() => {
                      if (!isEditing) toggleTask(fullDate, index);
                    }}
                    title={isEditing ? "" : "Click to toggle"}
                  >

                    {/* Інпут редагування завдання */}
                    {isEditing ? (
                      <div className={styles.inputWrapper}>
                        <input
                          className={styles.input}
                          value={editingTask.text}
                          onChange={(e) =>
                            setEditingTask({
                              ...editingTask,
                              text: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditedTask();
                            if (e.key === "Escape") setEditingTask(null);
                          }}
                          autoFocus
                        />
                        <div className={styles.inputButtons}>
                          <button
                            className={styles.addConfirm}
                            onClick={saveEditedTask}
                          >
                            Save
                          </button>
                          <button
                            className={styles.addCancel}
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                      {/* Текст завдання та кнопки редагування/видалення */}
                        <span>{task.text}</span>
                        <EditableRowActions
                          isEditing={false}
                          onEdit={(e) => {
                            e.stopPropagation();
                            setEditingTask({
                              date: fullDate,
                              index,
                              text: task.text,
                            });
                          }}
                          onDelete={(e) => {
                            e.stopPropagation();
                            deleteTask(fullDate, index);
                          }}
                          editTitle="Edit task"
                          deleteTitle="Delete task"
                        />
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Поле вводу для нової задачі */}
            {inputVisible[fullDate] ? (
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  className={`${common.input} ${
                    taskError[fullDate] ? common.inputError : ""
                  }`}
                  value={newTaskText[fullDate] || ""}
                  onChange={(e) => {
                    setNewTaskText((prev) => ({
                      ...prev,
                      [fullDate]: e.target.value,
                    }));
                    if (taskError[fullDate]) {
                      setTaskError((prev) => ({ ...prev, [fullDate]: false }));
                    }
                  }}
                  onFocus={() => {
                    if (taskError[fullDate]) {
                      setTaskError((prev) => ({ ...prev, [fullDate]: false }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask(fullDate);
                    if (e.key === "Escape")
                      setInputVisible((prev) => ({ ...prev, [fullDate]: false }));
                  }}
                  placeholder="New task"
                  autoFocus
                />
                <div className={styles.inputButtons}>
                  <button
                    className={styles.addConfirm}
                    onClick={() => handleAddTask(fullDate)}
                  >
                    Add
                  </button>
                  <button
                    className={styles.addCancel}
                    onClick={() =>
                      setInputVisible((prev) => ({ ...prev, [fullDate]: false }))
                    }
                  >
                    Cancel
                  </button>
                </div>

                {/* Повідомлення про помилку */}
                {taskError[fullDate] && (
                  <div className={common.errorMessage}>
                    Obligatory field is not filled
                  </div>
                )}
              </div>
            ) : (
              <button
                className={common.addButton}
                onClick={() =>
                  setInputVisible((prev) => ({ ...prev, [fullDate]: true }))
                }
              >
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