const applicationService = require("../services/application.service");
const candidateService = require("../services/candidate.service");
const jobService = require("../services/job.service");
const mailSender = require("../utils/mailSender");
const applicationAppliedTemplate = require("../mailTemplates/applicationAppliedTemplate");
const applicationStatusUpdateTemplate = require("../mailTemplates/applicationStatusUpdateTemplate");
const { translateApplications } = require("../utils/aiTranslator");
const { translateStatusStage } = require("../utils/statusStageTranslator");

const DEFAULT_STATUS_ID = 1;
const DEFAULT_STAGE_ID = 1;

exports.applyForJob = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    if (!candidateId || isNaN(candidateId) || !jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate or job id",
      });
    }

    const candidate = await candidateService.getCandidateById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const job = await jobService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const alreadyApplied = await applicationService.checkExistingApplication(
      candidateId,
      jobId
    );

    if (alreadyApplied) {
      return res.status(409).json({
        success: false,
        message: "Already applied for this job",
      });
    }

    const applicationId = await applicationService.createApplication({
      candidateId,
      jobId,
      applicationStatusId: DEFAULT_STATUS_ID,
      applicationStageId: DEFAULT_STAGE_ID,
    });

    await mailSender(
      candidate.email,
      "Job Application Submitted",
      applicationAppliedTemplate(candidate.firstName, job.jobTitle)
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      applicationId,
    });
  } catch (error) {
    console.error("Apply Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const lang = req.query.lang || "en";

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id",
      });
    }

    const applications = await applicationService.getApplicationsByJob(jobId);

    let finalApplications = applications;

    // Step 1: Local enum translation
    if (lang !== "en") {
      finalApplications = finalApplications.map((app) =>
        translateStatusStage(app, lang)
      );
    }

    // Step 2: AI translation (names, skills, experience, etc)
    finalApplications =
      lang === "en"
        ? finalApplications
        : await translateApplications(finalApplications, lang);

    return res.status(200).json({
      success: true,
      count: finalApplications.length,
      applications: finalApplications,
    });
  } catch (error) {
    console.error("Get Applications By Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId || isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application id",
      });
    }

    const application = await applicationService.getApplicationById(
      applicationId
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("Get Application Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { applicationStatusId, applicationStageId } = req.body;

    if (!applicationId || isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application id",
      });
    }

    if (!applicationStatusId || !applicationStageId) {
      return res.status(400).json({
        success: false,
        message: "Status and stage are required",
      });
    }

    const application = await applicationService.getApplicationById(
      applicationId
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    await applicationService.updateApplicationStatus(
      applicationId,
      applicationStatusId,
      applicationStageId
    );

    const candidate = await candidateService.getCandidateById(
      application.candidateId
    );

    await mailSender(
      candidate.email,
      "Application Status Update",
      applicationStatusUpdateTemplate(candidate.firstName)
    );

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
    });
  } catch (error) {
    console.error("Update Application Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!candidateId || isNaN(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate id",
      });
    }

    const applications = await applicationService.getApplicationsByCandidate(
      candidateId
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Get Applications By Candidate Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

