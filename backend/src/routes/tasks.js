const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const { validate, isValidWeekKey } = require("../middleware/validate");

router.use(auth);

router.get("/", async (req, res) => {
  const { week } = req.query;
  const query = week
    ? "SELECT * FROM weekly_tasks WHERE user_id = $1 AND week_key = $2 ORDER BY created_at"
    : "SELECT * FROM weekly_tasks WHERE user_id = $1 ORDER BY created_at";
  const params = week ? [req.user.id, week] : [req.user.id];
  const result = await db.query(query, params);
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { week_key, text } = req.body;
  if (!validate(res, [
    [!week_key || !isValidWeekKey(week_key), "Valid week_key is required (format: YYYY-WWW)"],
    [!text || !text.trim(), "Task text is required"],
    [text.trim().length > 500, "Task text must be under 500 characters"],
  ])) return;

  const result = await db.query(
    "INSERT INTO weekly_tasks (user_id, week_key, text) VALUES ($1, $2, $3) RETURNING *",
    [req.user.id, week_key, text.trim()]
  );
  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { text, done } = req.body;
  if (!validate(res, [
    [text !== undefined && text.trim().length === 0, "Task text cannot be empty"],
    [text !== undefined && text.trim().length > 500, "Task text must be under 500 characters"],
  ])) return;

  const result = await db.query(
    "UPDATE weekly_tasks SET text = COALESCE($1, text), done = COALESCE($2, done) WHERE id = $3 AND user_id = $4 RETURNING *",
    [text?.trim() ?? null, done ?? null, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM weekly_tasks WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
