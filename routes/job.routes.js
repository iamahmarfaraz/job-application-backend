const express = require("express");
const router = express.Router();

const {
  createJob,
  getJobById,
  listJobs,
  updateJob,
  deleteJob,
  getJobsGroupedByCode
} = require("../controllers/job.controller");

router.post("/", createJob);
router.get("/", listJobs);
router.get("/grouped", getJobsGroupedByCode);
router.get("/:jobId", getJobById);
router.put("/:jobId", updateJob);
router.delete("/:jobId", deleteJob);


module.exports = router;