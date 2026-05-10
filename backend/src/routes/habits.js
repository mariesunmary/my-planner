const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");
const { validate, isValidDate } = require("../middleware/validate");

router.use(auth);

router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM habits WHERE user_id = $1 ORDER BY created_at", [req.user.id]);
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!validate(res, [
    [!name || !name.trim(), "Habit name is required"],
    [name.trim().length > 200, "Habit name must be under 200 characters"],
  ])) return;

  const result = await db.query(
    "INSERT INTO habits (user_id, name) VALUES ($1, $2) RETURNING *",
    [req.user.id, name.trim()]
  );
  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const { name } = req.body;
  if (!validate(res, [
    [!name || !name.trim(), "Habit name is required"],
    [name.trim().length > 200, "Habit name must be under 200 characters"],
  ])) return;

  const result = await db.query(
    "UPDATE habits SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
    [name.trim(), req.params.id, req.user.id]
  );
  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM habits WHERE id = $1 AND user_id = $2", [req.params.id, req.user.id]);
  res.json({ ok: true });
});

router.get("/tracking", async (req, res) => {
  const result = await db.query(
    `SELECT ht.* FROM habit_tracking ht
     JOIN habits h ON h.id = ht.habit_id
     WHERE h.user_id = $1`,
    [req.user.id]
  );
  res.json(result.rows);
});

router.post("/tracking", async (req, res) => {
  const { habit_id, date, done } = req.body;
  if (!validate(res, [
    [!habit_id, "habit_id is required"],
    [!date || !isValidDate(date), "Valid date is required"],
    [done === undefined, "done field is required"],
  ])) return;

  if (done) {
    const result = await db.query(
      "INSERT INTO habit_tracking (habit_id, date) VALUES ($1, $2) ON CONFLICT (habit_id, date) DO NOTHING RETURNING *",
      [habit_id, date]
    );
    res.json(result.rows[0] || { habit_id, date });
  } else {
    await db.query("DELETE FROM habit_tracking WHERE habit_id = $1 AND date = $2", [habit_id, date]);
    res.json({ deleted: true });
  }
});

module.exports = router;
