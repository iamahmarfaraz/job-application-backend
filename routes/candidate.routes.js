const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload");

const {
  createCandidate,
  getCandidateById,
  listCandidates,
  updateCandidate,
  deleteCandidate,
  getCandidatesByCreatedAtRange
} = require("../controllers/candidate.controller");

router.post("/createCandidate", upload.single("resume"), createCandidate);
router.get("/filter/by-date", getCandidatesByCreatedAtRange);
router.get("/", listCandidates);
router.get("/:candidateId", getCandidateById);
router.put("/:candidateId", upload.single("resume"), updateCandidate);
router.delete("/:candidateId", deleteCandidate);

module.exports = router;