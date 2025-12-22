const express = require("express");
const router = express.Router();

const {
  applyForJob,
  getApplicationsByJob,
  updateApplicationStatus,
  getApplicationById,
  getApplicationsByCandidate
} = require("../controllers/application.controller");

router.post("/apply", applyForJob);
router.get("/job/:jobId", getApplicationsByJob);
router.get("/:applicationId", getApplicationById);
router.get("/candidate/:candidateId", getApplicationsByCandidate);
router.put("/:applicationId/status", updateApplicationStatus);

module.exports = router;