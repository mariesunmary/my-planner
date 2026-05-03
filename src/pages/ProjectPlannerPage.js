import { useState, useEffect, useMemo } from "react";
import styles from "./ProjectPlannerPage.module.css";
import common from "../styles/Common.module.css";
import EditableRowActions from "../components/EditableRowActions";
import api from "../services/api";
import AppDatePicker from "../components/AppDatePicker";
import { useToast } from "../context/ToastContext";

/**
 *
 */
function ProjectPlannerPage() {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newProject, setNewProject] = useState({ title: "", description: "", deadline: "" });
  const [taskForm, setTaskForm] = useState({ name: "", deadline: "" });
  const [editTaskId, setEditTaskId] = useState(null);
  const [editedTask, setEditedTask] = useState(null);
  const [editProjectId, setEditProjectId] = useState(null);
  const [editedProject, setEditedProject] = useState(null);
  const [projectError, setProjectError] = useState(false);
  const [taskError, setTaskError] = useState(false);

  useEffect(() => {
    api.get("/projects").then((res) => {
      setProjects(res.data.projects);
      setAllTasks(res.data.tasks);
      if (res.data.projects.length > 0) {setSelectedProjectId(res.data.projects[0].id);}
    }).finally(() => setLoading(false));
  }, []);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) {return null;}
    const project = projects.find((p) => p.id === selectedProjectId);
    if (!project) {return null;}
    return { ...project, tasks: allTasks.filter((t) => t.project_id === selectedProjectId) };
  }, [projects, allTasks, selectedProjectId]);

  const handleAddProject = async () => {
    if (!newProject.title.trim()) { setProjectError(true); return; }
    const res = await api.post("/projects", {
      name: newProject.title, description: newProject.description, deadline: newProject.deadline,
    });
    const project = { ...res.data, title: res.data.name };
    setProjects((prev) => [...prev, project]);
    setSelectedProjectId(project.id);
    setNewProject({ title: "", description: "", deadline: "" });
    setProjectError(false);
  };

  const handleEditProject = (project) => {
    setEditProjectId(project.id);
    setEditedProject({ ...project });
  };

  const handleSaveProjectEdit = async (id) => {
    const res = await api.put(`/projects/${id}`, {
      name: editedProject.title, description: editedProject.description, deadline: editedProject.deadline,
    });
    setProjects((prev) => prev.map((p) => p.id === id ? { ...res.data, title: res.data.name } : p));
    setEditProjectId(null);
    setEditedProject(null);
  };

  const handleCancelProjectEdit = () => { setEditProjectId(null); setEditedProject(null); };

  const handleDeleteProject = async (id) => {
    await api.delete(`/projects/${id}`);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setAllTasks((prev) => prev.filter((t) => t.project_id !== id));
    if (selectedProjectId === id) {setSelectedProjectId(null);}
  };

  const handleAddTask = async () => {
    if (!taskForm.name.trim() || !taskForm.deadline) { setTaskError(true); return; }
    const res = await api.post(`/projects/${selectedProjectId}/tasks`, {
      name: taskForm.name, deadline: taskForm.deadline, status: "To Do",
    });
    setAllTasks((prev) => [...prev, res.data]);
    setTaskForm({ name: "", deadline: "" });
    setTaskError(false);
  };

  const handleDeleteTask = async (taskId) => {
    setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
    await api.delete(`/projects/tasks/${taskId}`);
    if (editTaskId === taskId) { setEditTaskId(null); setEditedTask(null); }
  };

  const handleStatusChange = async (taskId) => {
    const task = allTasks.find((t) => t.id === taskId);
    const next = task.status === "To Do" ? "In Progress" : task.status === "In Progress" ? "Done" : "To Do";
    if (next === "Done") {
      const updated = allTasks.map((t) => t.id === taskId ? { ...t, status: "Done" } : t);
      const projectTasks = updated.filter((t) => t.project_id === selectedProjectId);
      if (projectTasks.length > 0 && projectTasks.every((t) => t.status === "Done")) {
        showToast("Project complete!", `All tasks finished — great work! 🏆`, "🏆");
      }
    }
    setAllTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: next } : t));
    await api.put(`/projects/tasks/${taskId}`, { status: next });
  };

  const handleEditTask = (task) => { setEditTaskId(task.id); setEditedTask({ ...task }); };
  const handleEditTaskChange = (e) => setEditedTask({ ...editedTask, [e.target.name]: e.target.value });

  const handleSaveTaskEdit = async () => {
    const res = await api.put(`/projects/tasks/${editTaskId}`, {
      name: editedTask.name, deadline: editedTask.deadline,
    });
    setAllTasks((prev) => prev.map((t) => t.id === editTaskId ? res.data : t));
    setEditTaskId(null);
    setEditedTask(null);
  };

  const handleCancelTaskEdit = () => { setEditTaskId(null); setEditedTask(null); };

  const renderedProjectNav = useMemo(() => (
    <ul className={styles.projectNavList}>
      {projects.map((project) => (
        <li key={project.id} className={styles.projectItem}>
          <div
            className={`${styles.projectDisplayWrapper} ${selectedProjectId === project.id ? styles.activeProject : ""}`}
            onClick={() => setSelectedProjectId(project.id)}
          >
            {editProjectId === project.id ? (
              <>
                <div className={styles.projectTitleWrapper}>
                  <input className={common.input} value={editedProject?.title || ""}
                    onChange={(e) => setEditedProject({ ...editedProject, title: e.target.value })}
                    onClick={(e) => e.stopPropagation()} />
                </div>
                <div className={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                  <EditableRowActions isEditing={true} onSave={() => handleSaveProjectEdit(project.id)} onCancel={handleCancelProjectEdit} />
                </div>
              </>
            ) : (
              <>
                <div className={styles.projectTitleWrapper}>{project.title || project.name}</div>
                <div className={styles.projectActions} onClick={(e) => e.stopPropagation()}>
                  <EditableRowActions isEditing={false} onEdit={() => handleEditProject(project)} onDelete={() => handleDeleteProject(project.id)} editTitle="Edit project" deleteTitle="Delete project" />
                </div>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  ), [projects, selectedProjectId, editProjectId, editedProject]);

  const renderedTasksList = useMemo(() => {
    if (!selectedProject || selectedProject.tasks.length === 0) {return null;}
    return (
      <table className={styles.taskTable}>
        <thead><tr><th>Task</th><th>Deadline</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {selectedProject.tasks.map((task) => (
            <tr key={task.id}>
              {editTaskId === task.id ? (
                <>
                  <td><input type="text" name="name" value={editedTask?.name || ""} onChange={handleEditTaskChange} className={common.input} /></td>
                  <td><AppDatePicker value={editedTask?.deadline ? editedTask.deadline.split("T")[0] : ""} onChange={(val) => setEditedTask({ ...editedTask, deadline: val })} className={common.input} /></td>
                  <td>{task.status}</td>
                  <td className={styles.taskActions}><EditableRowActions isEditing={true} onSave={handleSaveTaskEdit} onCancel={handleCancelTaskEdit} /></td>
                </>
              ) : (
                <>
                  <td>{task.name}</td>
                  <td>{task.deadline}</td>
                  <td className={styles.statusCell} onClick={() => handleStatusChange(task.id)} title="Click to change status">{task.status}</td>
                  <td className={styles.taskActions}><EditableRowActions isEditing={false} onEdit={() => handleEditTask(task)} onDelete={() => handleDeleteTask(task.id)} editTitle="Edit task" deleteTitle="Delete task" /></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }, [selectedProject, editTaskId, editedTask]);

  if (loading) {return <div className={common.container}><p>Loading...</p></div>;}

  return (
    <div className={`${common.container} ${common.pageEnter}`}>
      <p className={common.intro}>
        Break your goals into actionable steps. Create projects, add tasks, and
        move forward with clarity and purpose.
      </p>

      <div className={common.formWrapper}>
        <div className={common.form}>
          <input type="text" value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            onFocus={() => setProjectError(false)} placeholder="Project name"
            className={`${common.input} ${projectError ? common.inputError : ""}`} style={{ flex: 2 }} />
          <input type="text" value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Project description" className={common.input} style={{ flex: 3 }} />
          <div style={{ flex: 1.5 }}>
            <AppDatePicker value={newProject.deadline} onChange={(val) => setNewProject({ ...newProject, deadline: val })} className={common.input} placeholder="Deadline" />
          </div>
          <button onClick={handleAddProject} className={common.addButton}>+ Add Project</button>
        </div>
        {projectError && <div className={common.errorMessage}>Project name is required</div>}
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>Projects</h2>
          {projects.length === 0
            ? <p className={styles.noProjects}>No projects yet. Please add one above.</p>
            : renderedProjectNav}
        </aside>

        <main className={styles.mainContent}>
          {selectedProject ? (
            <>
              <h3 className={styles.projectTitle}>
                {selectedProject.title || selectedProject.name}
                {selectedProject.deadline && (
                  <span className={styles.projectDeadline}> (Deadline: {selectedProject.deadline})</span>
                )}
              </h3>
              {selectedProject.description && <p className={styles.projectDescription}>{selectedProject.description}</p>}

              <div className={common.formWrapper}>
                <div className={common.form}>
                  <input className={`${common.input} ${taskError && !taskForm.name.trim() ? common.inputError : ""}`}
                    type="text" placeholder="Task name" value={taskForm.name} style={{ flex: 2 }}
                    onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                    onFocus={() => setTaskError(false)} />
                  <div style={{ flex: 1 }}>
                    <AppDatePicker value={taskForm.deadline} onChange={(val) => { setTaskForm({ ...taskForm, deadline: val }); setTaskError(false); }} className={`${common.input} ${taskError && !taskForm.deadline ? common.inputError : ""}`} placeholder="Deadline" />
                  </div>
                  <button onClick={handleAddTask} className={common.addButton}>+ Add Task</button>
                </div>
                {taskError && <div className={common.errorMessage}>Obligatory field is not filled</div>}
              </div>

              {selectedProject.tasks.length === 0
                ? <p className={styles.noTasks}>No tasks yet. Add one above.</p>
                : renderedTasksList}
            </>
          ) : (
            <p className={styles.noTasks}>Select a project from the list or create a new one.</p>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProjectPlannerPage;
