require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const jobRoutes = require("./routes/job.routes");
const candidateRoutes = require("./routes/candidate.routes");
const applicationRoutes = require("./routes/application.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  const [rows] = await db.query("SELECT 1");
  res.json({ status: "OK", db: rows.length === 1 });
});

app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/applications", applicationRoutes);

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});