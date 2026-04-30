require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
