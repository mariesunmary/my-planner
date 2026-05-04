require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/habits", require("./routes/habits"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/water", require("./routes/water"));

app.get("/", (req, res) => res.json({ status: "FocusFlow API is running" }));

async function runMigrations() {
  await db.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USD';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(10) DEFAULT 'light';
    ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline VARCHAR(50) DEFAULT '';
    ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT '';
    ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS deadline VARCHAR(50) DEFAULT '';
    ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'To Do';
  `);
}

const PORT = process.env.PORT || 5000;
runMigrations()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error("Migration error:", err); process.exit(1); });
