const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { validate, EMAIL_RE, VALID_THEMES, VALID_CURRENCIES } = require("../middleware/validate");

function isStrongPassword(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);
}

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!validate(res, [
    [!email || !password, "Email and password are required"],
    [!EMAIL_RE.test(email), "Invalid email format"],
    [!isStrongPassword(password), "Password must be at least 8 characters and contain uppercase, lowercase, and a number"],
    [name && name.length > 100, "Name must be under 100 characters"],
  ])) return;

  try {
    const exists = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length > 0) return res.status(409).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hash, name?.trim() || ""]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!validate(res, [
    [!email || !password, "Email and password are required"],
    [!EMAIL_RE.test(email), "Invalid email format"],
  ])) return;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", require("../middleware/auth"), async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, email, name, currency, theme, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/me", require("../middleware/auth"), async (req, res) => {
  const { name, email, currency, theme } = req.body;
  if (!validate(res, [
    [email && !EMAIL_RE.test(email), "Invalid email format"],
    [name && name.length > 100, "Name must be under 100 characters"],
    [currency && !VALID_CURRENCIES.includes(currency), "Invalid currency"],
    [theme && !VALID_THEMES.includes(theme), "Invalid theme"],
  ])) return;

  try {
    if (email) {
      const exists = await db.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, req.user.id]);
      if (exists.rows.length > 0) return res.status(409).json({ error: "Email already in use" });
    }
    const result = await db.query(
      "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), currency = COALESCE($3, currency), theme = COALESCE($4, theme) WHERE id = $5 RETURNING id, email, name, currency, theme, created_at",
      [name?.trim() || null, email || null, currency || null, theme || null, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/me/password", require("../middleware/auth"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!validate(res, [
    [!currentPassword || !newPassword, "Both current and new password are required"],
    [!isStrongPassword(newPassword), "New password must be at least 8 characters and contain uppercase, lowercase, and a number"],
  ])) return;

  try {
    const result = await db.query("SELECT password_hash FROM users WHERE id = $1", [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/me", require("../middleware/auth"), async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
