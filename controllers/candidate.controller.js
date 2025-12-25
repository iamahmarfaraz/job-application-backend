const candidateService = require("../services/candidate.service");
const uploadFileToS3 = require("../utils/s3Uploader");
const deleteFileFromS3 = require("../utils/s3Delete");

exports.createCandidate = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      email,
      phone,
      totalExperience,
      skills,
      workExperience
    } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const existing = await candidateService.getCandidateByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Candidate already exists"
      });
    }

    let resumeUrl = null;

    if (req.file) {
      resumeUrl = await uploadFileToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const candidateId = await candidateService.createCandidate({
      firstName,
      middleName,
      lastName,
      email,
      phone,
      totalExperience,
      resumeUrl,
      skills: skills ? JSON.parse(skills) : [],
      workExperience: workExperience ? JSON.parse(workExperience) : []
    });

    return res.status(201).json({
      success: true,
      message: "Candidate created successfully",
      candidateId
    });
  } catch (error) {
    console.error("Create Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getCandidateById = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId || isNaN(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate id"
      });
    }

    const candidate = await candidateService.getCandidateById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    return res.status(200).json({
      success: true,
      candidate
    });
  } catch (error) {
    console.error("Get Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.listCandidates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const candidates = await candidateService.listCandidates({
      limit,
      offset
    });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    console.error("List Candidates Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId || isNaN(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate id"
      });
    }

    const existing = await candidateService.getCandidateById(candidateId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    let resumeUrl = existing.resumeUrl;

    if (req.file) {
      if (existing.resumeUrl) {
        await deleteFileFromS3(existing.resumeUrl);
      }

      resumeUrl = await uploadFileToS3(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    let skills;
    if (req.body.skills) {
      skills = Array.isArray(req.body.skills)
        ? req.body.skills
        : JSON.parse(req.body.skills);
    }

    await candidateService.updateCandidate(candidateId, {
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      totalExperience: req.body.totalExperience,
      resumeUrl,
      skills
    });

    return res.status(200).json({
      success: true,
      message: "Candidate updated successfully"
    });
  } catch (error) {
    console.error("Update Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId || isNaN(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate id"
      });
    }

    const existing = await candidateService.getCandidateById(candidateId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    if (existing.resumeUrl) {
      await deleteFileFromS3(existing.resumeUrl);
    }

    await candidateService.deleteCandidate(candidateId);

    return res.status(200).json({
        success: true,
        message: "Candidate deleted successfully"
    });
  } catch (error) {
    console.error("Delete Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getCandidatesByCreatedAtRange = async (req, res) => {
  try {
    const { from, to, limit, offset } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "from and to dates are required"
      });
    }

    const candidates = await candidateService.getCandidatesByCreatedAtRange({
      fromDate: from,
      toDate: to,
      limit: parseInt(limit) || 50,
      offset: parseInt(offset) || 0
    });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    console.error("Get Candidates By Date Range Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
