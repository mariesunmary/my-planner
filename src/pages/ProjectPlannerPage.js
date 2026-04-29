import React, { useState, useEffect, useMemo } from "react";
import styles from "./ProjectPlannerPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import { loadFromStorage, saveToStorage, saveToStorageDebounced } from "../utils/localstorage";

/**
 * Сторінка Project Planner.
 * Дозволяє користувачеві створювати проєкти, додавати до них завдання,
 * редагувати, видаляти та відстежувати їх статус ("To Do", "In Progress", "Done").
 * Кожен користувач має власні збережені дані у localStorage.
 * @component
 * @returns {JSX.Element} Сторінка планування проєктів зі списком та завданнями.
 */
function ProjectPlannerPage() {
  
  /**
   * Поточний користувач, завантажений із localStorage.
   * @type {{ email: string } | null}
   */
  const currentUser = loadFromStorage("currentUser", null);

  /**
   * Унікальний ключ користувача для збереження проєктів.
   * @type {string}
   */
  const userKey = currentUser ? currentUser.email : "guest";

  /**
   * Масив проєктів користувача.
   * @type {Array<{id: number, title: string, description: string, deadline: string, tasks: Array}>}
   */
  const [projects, setProjects] = useState(() => 
    loadFromStorage(`projects_${userKey}`, [])
  );

  /**
   * Ідентифікатор вибраного проєкту.
   * @type {number | null}
   */
  const [selectedProjectId, setSelectedProjectId] = useState(() => 
    loadFromStorage(`selectedProjectId_${userKey}`, null)
  );

  /**
   * Об’єкт нового проєкту, який заповнює користувач у формі.
   * @type {{ title: string, description: string, deadline: string }}
   */
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  

  /**
   * Об’єкт форми додавання завдання.
   * @type {{ name: string, deadline: string }}
   */
  const [taskForm, setTaskForm] = useState({ name: "", deadline: "" });

  /**
   * Ідентифікатор редагованого завдання.
   * @type {number | null}
   */
  const [editTaskId, setEditTaskId] = useState(null);

  /**
   * Дані завдання, що редагується.
   * @type {{ id: number, name: string, deadline: string, status: string } | null}
   */
  const [editedTask, setEditedTask] = useState(null);

  /**
   * Ідентифікатор редагованого проєкту.
   * @type {number | null}
   */
  const [editProjectId, setEditProjectId] = useState(null);

  /**
   * Дані проєкту, що редагується.
   * @type {{ id: number, title: string, description: string, deadline: string, tasks: Array } | null}
   */
  const [editedProject, setEditedProject] = useState(null);

  /**
   * Стан помилки при створенні проєкту.
   * @type {boolean}
   */
  const [projectError, setProjectError] = useState(false);

  /**
   * Стан помилки при створенні завдання.
   * @type {boolean}
   */
  const [taskError, setTaskError] = useState(false);

  /**
   * Збереження списку проєктів у localStorage (Дебаунсінг для оптимізації продуктивності).
   */
  useEffect(() => {
    saveToStorageDebounced(`projects_${userKey}`, projects, 500);
  }, [projects, userKey]);

  /**
   * Збереження вибраного проєкту у localStorage (Дебаунсінг)
   */
  useEffect(() => {
    saveToStorageDebounced(`selectedProjectId_${userKey}`, selectedProjectId, 500);
  }, [selectedProjectId, userKey]);


  /**
   * Генератор великого об'єму даних для профілювання (Performance Testing)
   */
  /**
   * Додавання нового проєкту у список.
   * - Перевіряє, щоб поле назви не було порожнім.
   * - Створює об’єкт проєкту з унікальним ID.
   * - Зберігає його у стані та обирає активним.
   */
  const handleAddProject = () => {
    if (newProject.title.trim() === "") {
      setProjectError(true);
      return;
    }
    const project = {
      id: Date.now(),
      title: newProject.title,
      description: newProject.description,
      deadline: newProject.deadline,
      tasks: [],
    };
    setProjects([...projects, project]);
    setNewProject({ title: "", description: "", deadline: "" });
    setSelectedProjectId(project.id);
    setProjectError(false);
  };

  /**
   * Початок редагування проєкту.
   * @param {{ id: number, title: string, description: string, deadline: string, tasks: Array }} project — об’єкт проєкту для редагування
   */
  const handleEditProject = (project) => {
    setEditProjectId(project.id);
    setEditedProject({ ...project });
  };

  /**
   * Зберігання змін після редагування проєкту.
   * @param {number} id — ідентифікатор проєкту
   */
  const handleSaveProjectEdit = (id) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? editedProject : p))
    );
    setEditProjectId(null);
    setEditedProject(null);
  };

  /**
   * Скасування редагування проєкту без збереження змін.
   */
  const handleCancelProjectEdit = () => {
    setEditProjectId(null);
    setEditedProject(null);
  };

  /**
   * Видалення проєкту та його завданнь.
   * @param {number} id — ідентифікатор проєкту
   */
  const handleDeleteProject = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (selectedProjectId === id) {setSelectedProjectId(null);}
  };

  /**
   * Додає нове завдання у вибраний проєкт.
   * - Перевіряє, щоб поля "name" і "deadline" були заповнені.
   * - Додає завдання зі статусом "To Do".
   */
  const handleAddTask = () => {
    if (!taskForm.name.trim() || !taskForm.deadline) {
      setTaskError(true);
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              tasks: [
                ...project.tasks,
                {
                  id: Date.now(),
                  name: taskForm.name,
                  deadline: taskForm.deadline,
                  status: "To Do",
                },
              ],
            }
          : project
      )
    );

    setTaskForm({ name: "", deadline: "" });
    setTaskError(false);
  };

  /**
   * Видаляє завдання з поточного проєкту.
   * @param {number} taskId — ідентифікатор завдання
   */
  const handleDeleteTask = (taskId) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? { ...project, tasks: project.tasks.filter((t) => t.id !== taskId) }
          : project
      )
    );
    if (editTaskId === taskId) {
      setEditTaskId(null);
      setEditedTask(null);
    }
  };

  /**
   * Змінює статус завдання по циклу: "To Do" → "In Progress" → "Done" → "To Do".
   * @param {number} taskId — ідентифікатор завдання
   */
  const handleStatusChange = (taskId) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status:
                        task.status === "To Do"
                          ? "In Progress"
                          : task.status === "In Progress"
                          ? "Done"
                          : "To Do",
                    }
                  : task
              ),
            }
          : project
      )
    );
  };

  /**
   * Починає редагування завдання.
   * @param {{ id: number, name: string, deadline: string, status: string }} task — об’єкт завдання
   */
  const handleEditTask = (task) => {
    setEditTaskId(task.id);
    setEditedTask({ ...task });
  };

  /**
   * Оновлює значення полів під час редагування завдання.
   * @param {Event} e — подія зміни інпуту
   */
  const handleEditTaskChange = (e) => {
    setEditedTask({ ...editedTask, [e.target.name]: e.target.value });
  };

  /**
   * Зберігає зміни після редагування завдання.
   */
  const handleSaveTaskEdit = () => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === selectedProjectId
          ? {
              ...project,
              tasks: project.tasks.map((task) =>
                task.id === editTaskId ? editedTask : task
              ),
            }
          : project
      )
    );
    setEditTaskId(null);
    setEditedTask(null);
  };

  /**
   * Скасовує редагування завдання без збереження змін.
   */
  const handleCancelTaskEdit = () => {
    setEditTaskId(null);
    setEditedTask(null);
  };

  /**
   * Поточний вибраний проєкт (Мемоізовано для уникнення лінійного пошуку O(N) на кожному рендері)
   * @type {{ id: number, title: string, description: string, deadline: string, tasks: Array } | undefined}
   */
  const selectedProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  /**
   * Мемоізований список проектів (Sidebar) для оптимізації рендерів при введенні тексту
   */
  const renderedProjectNav = useMemo(() => (
    <ul className={styles.projectNavList}>
      {projects.map((project) => (
        <li key={project.id} className={styles.projectItem}>
          <div
            className={`${styles.projectDisplayWrapper} ${
              selectedProjectId === project.id ? styles.activeProject : ""
            }`}
            onClick={() => setSelectedProjectId(project.id)}
          >
            {editProjectId === project.id ? (
              <>
                <div className={styles.projectTitleWrapper}>
                  <input
                    className={common.input}
                    value={editedProject?.title || ""}
                    onChange={(e) =>
                      setEditedProject({
                        ...editedProject,
                        title: e.target.value,
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                  <EditableRowActions
                    isEditing={true}
                    onSave={() => handleSaveProjectEdit(project.id)}
                    onCancel={handleCancelProjectEdit}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles.projectTitleWrapper}>
                  {project.title}
                </div>
                <div className={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                  <EditableRowActions
                    isEditing={false}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteProject(project.id)}
                    editTitle="Edit project"
                    deleteTitle="Delete project"
                  />
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  ), [projects, selectedProjectId, editProjectId, editedProject]);

  /**
   * Мемоізований список завдань для оптимізації рендерингу великих списків
   */
  const renderedTasksList = useMemo(() => {
    if (!selectedProject || selectedProject.tasks.length === 0) {return null;}
    return (
      <table className={styles.taskTable}>
        <thead>
          <tr>
            <th>Task</th>
            <th>Deadline</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {selectedProject.tasks.map((task) => (
            <tr key={task.id}>
              {editTaskId === task.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editedTask?.name || ""}
                      onChange={handleEditTaskChange}
                      className={common.input}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="deadline"
                      value={editedTask?.deadline || ""}
                      onChange={handleEditTaskChange}
                      className={common.input}
                    />
                  </td>
                  <td>{task.status}</td>
                  <td className={styles.taskActions}>
                    <EditableRowActions
                      isEditing={true}
                      onSave={handleSaveTaskEdit}
                      onCancel={handleCancelTaskEdit}
                    />
                  </td>
                </>
              ) : (
                <>
                  <td>{task.name}</td>
                  <td>{task.deadline}</td>
                  <td
                    className={styles.statusCell}
                    onClick={() => handleStatusChange(task.id)}
                    title="Click to change status"
                  >
                    {task.status}
                  </td>
                  <td className={styles.taskActions}>
                    <EditableRowActions
                      isEditing={false}
                      onEdit={() => handleEditTask(task)}
                      onDelete={() => handleDeleteTask(task.id)}
                      editTitle="Edit task"
                      deleteTitle="Delete task"
                    />
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [selectedProject, editTaskId, editedTask]);

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      {/* Опис сторінки */}
      <p className={common.intro}>
        Break your goals into actionable steps. Create projects, add tasks, and
        move forward with clarity and purpose.
      </p>

      {/* Додавання нового проекту */}
      <div className={common.formWrapper}>
        <div className={common.form}>
          <input
            type="text"
            value={newProject.title}
            onChange={(e) =>
              setNewProject({ ...newProject, title: e.target.value })
            }
            onFocus={() => setProjectError(false)}
            placeholder="Project name"
            className={`${common.input} ${projectError ? common.inputError : ""}`}
            style={{ flex: 2 }}
          />
          <input
            type="text"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            placeholder="Project description"
            className={common.input}
            style={{ flex: 3 }}
          />
          <input
            type="date"
            value={newProject.deadline}
            onChange={(e) =>
              setNewProject({ ...newProject, deadline: e.target.value })
            }
            className={common.input}
            style={{ flex: 1.5 }}
          />
          <button onClick={handleAddProject} className={common.addButton}>
            + Add Project
          </button>
        </div>
        {projectError && (
          <div className={common.errorMessage}>
            Project name is required
          </div>
        )}
      </div>

      {/* Головний layout: Навігація по проектам + Завдання проекту */}
      <div className={styles.layout}>
        {/* Меню проетів */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Projects</h2>

          {projects.length === 0 ? (
            <p className={styles.noProjects}>No projects yet. Please add one above.</p>
          ) : renderedProjectNav}
        </aside>

        {/* Завдяння проету */}
        <main className={styles.mainContent}>
          {selectedProject ? (
            <>
              <h3 className={styles.projectTitle}>
                {selectedProject.title}
                {selectedProject.deadline && (
                  <span className={styles.projectDeadline}>
                    {" "}
                    (Deadline: {selectedProject.deadline})
                  </span>
                )}
              </h3>
              {selectedProject.description && (
                <p className={styles.projectDescription}>
                  {selectedProject.description}
                </p>
              )}

              {/* Форма додавання задач */}
              <div className={common.formWrapper}>
                <div className={common.form}>
                  <input
                    className={`${common.input} ${
                      taskError && !taskForm.name.trim() ? common.inputError : ""
                    }`}
                    type="text"
                    placeholder="Task name"
                    value={taskForm.name}
                    style={{ flex: 2 }}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, name: e.target.value })
                    }
                    onFocus={() => setTaskError(false)}
                  />
                  <input
                    className={`${common.input} ${
                      taskError && !taskForm.deadline ? common.inputError : ""
                    }`}
                    type="date"
                    value={taskForm.deadline}
                    style={{ flex: 1 }}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, deadline: e.target.value })
                    }
                    onFocus={() => setTaskError(false)}
                  />
                  <button onClick={handleAddTask} className={common.addButton}>
                    + Add Task
                  </button>
                </div>
                {taskError && (
                  <div className={common.errorMessage}>Obligatory field is not filled</div>
                )}
              </div>

              {/* Список задач */}
              {selectedProject.tasks.length === 0 ? (
                <p className={styles.noTasks}>No tasks yet. Add one above.</p>
              ) : renderedTasksList}
            </>
          ) : (
            <p className={styles.selectPrompt}>
              Select a project from the left to start planning.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProjectPlannerPage;
