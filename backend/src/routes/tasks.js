const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

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
  const result = await db.query(
    "INSERT INTO weekly_tasks (user_id, week_key, text) VALUES ($1, $2, $3) RETURNING *",
    [req.user.id, week_key, text]
  );
  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { text, done } = req.body;
  const result = await db.query(
    "UPDATE weekly_tasks SET text = COALESCE($1, text), done = COALESCE($2, done) WHERE id = $3 AND user_id = $4 RETURNING *",
    [text ?? null, done ?? null, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM weekly_tasks WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
