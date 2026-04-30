const router = require("express").Router();
const db = require("../db");
const auth = require("../middleware/auth");

router.use(auth);

router.get("/today", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const result = await db.query(
    "SELECT count FROM water_log WHERE user_id = $1 AND date = $2",
    [req.user.id, today]
  );
  res.json({ count: result.rows[0]?.count ?? 0 });
});

router.put("/today", async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const { count } = req.body;
  const result = await db.query(
    `INSERT INTO water_log (user_id, date, count) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, date) DO UPDATE SET count = $3 RETURNING *`,
    [req.user.id, today, count]
  );
  res.json(result.rows[0]);
});

module.exports = router;
