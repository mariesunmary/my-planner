const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const { validate, VALID_STATUSES } = require("../middleware/validate");

router.use(auth);

router.get("/", async (req, res) => {
  const projects = await db.query(
    "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at",
    [req.user.id]
  );
  const tasks = await db.query(
    `SELECT pt.* FROM project_tasks pt
     JOIN projects p ON p.id = pt.project_id
     WHERE p.user_id = $1 ORDER BY pt.created_at`,
    [req.user.id]
  );
  res.json({ projects: projects.rows, tasks: tasks.rows });
});

router.post("/", async (req, res) => {
  const { name, description, deadline } = req.body;
  if (!validate(res, [
    [!name || !name.trim(), "Project name is required"],
    [name.trim().length > 200, "Project name must be under 200 characters"],
    [description && description.length > 1000, "Description must be under 1000 characters"],
  ])) return;

  const result = await db.query(
    "INSERT INTO projects (user_id, name, description, deadline) VALUES ($1, $2, $3, $4) RETURNING *",
    [req.user.id, name.trim(), description?.trim() || "", deadline || ""]
  );
  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { name, description, deadline } = req.body;
  if (!validate(res, [
    [!name || !name.trim(), "Project name is required"],
    [name.trim().length > 200, "Project name must be under 200 characters"],
    [description && description.length > 1000, "Description must be under 1000 characters"],
  ])) return;

  const result = await db.query(
    "UPDATE projects SET name = $1, description = $2, deadline = $3 WHERE id = $4 AND user_id = $5 RETURNING *",
    [name.trim(), description?.trim() || "", deadline || "", req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM projects WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  res.json({ ok: true });
});

router.post("/:id/tasks", async (req, res) => {
  const { name, deadline, status } = req.body;
  if (!validate(res, [
    [!name || !name.trim(), "Task name is required"],
    [name.trim().length > 200, "Task name must be under 200 characters"],
    [status && !VALID_STATUSES.includes(status), `Status must be one of: ${VALID_STATUSES.join(", ")}`],
  ])) return;

  const result = await db.query(
    "INSERT INTO project_tasks (project_id, text, name, deadline, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [req.params.id, name.trim(), name.trim(), deadline || "", status || "To Do"]
  );
  res.json(result.rows[0]);
});

router.put("/tasks/:taskId", async (req, res) => {
  const { name, deadline, status } = req.body;
  if (!validate(res, [
    [name !== undefined && !name.trim(), "Task name cannot be empty"],
    [name && name.trim().length > 200, "Task name must be under 200 characters"],
    [status && !VALID_STATUSES.includes(status), `Status must be one of: ${VALID_STATUSES.join(", ")}`],
  ])) return;

  const result = await db.query(
    `UPDATE project_tasks
     SET name = COALESCE($1, name),
         text = COALESCE($1, text),
         deadline = COALESCE($2, deadline),
         status = COALESCE($3, status)
     WHERE id = $4 RETURNING *`,
    [name?.trim() ?? null, deadline ?? null, status ?? null, req.params.taskId]
  );
  res.json(result.rows[0]);
});

router.delete("/tasks/:taskId", async (req, res) => {
  await db.query("DELETE FROM project_tasks WHERE id = $1", [req.params.taskId]);
  res.json({ ok: true });
});

module.exports = router;
