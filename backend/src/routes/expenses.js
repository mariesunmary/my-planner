const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
    [req.user.id]
  );
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name, amount, category, date } = req.body;
  const result = await db.query(
    "INSERT INTO expenses (user_id, name, amount, category, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [req.user.id, name, amount, category, date]
  );
  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { name, amount, category, date } = req.body;
  const result = await db.query(
    "UPDATE expenses SET name = $1, amount = $2, category = $3, date = $4 WHERE id = $5 AND user_id = $6 RETURNING *",
    [name, amount, category, date, req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  res.json({ ok: true });
});

module.exports = router;
