require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  const [rows] = await db.query("SELECT 1");
  res.json({ status: "OK", db: rows.length === 1 });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});