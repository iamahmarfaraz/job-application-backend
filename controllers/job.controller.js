const jobService = require("../services/job.service");

exports.createJob = async (req, res) => {
  try {
    const { jobCode, jobTitle, jobDescription } = req.body;

    if (!jobCode || !jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const jobId = await jobService.createJob({
      jobCode: jobCode.trim(),
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim()
    });

    const job = await jobService.getJobById(jobId);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job
    });
  } catch (error) {
    console.error("Create Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id"
      });
    }

    const job = await jobService.getJobById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    return res.status(200).json({
      success: true,
      job
    });
  } catch (error) {
    console.error("Get Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.listJobs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const jobs = await jobService.listJobs({ limit, offset });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    console.error("List Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.getJobsGroupedByCode = async (req, res) => {
  try {
    const rows = await jobService.listJobsGroupedByCode();

    const grouped = {};

    for (const job of rows) {
      if (!grouped[job.jobCode]) {
        grouped[job.jobCode] = [];
      }
      grouped[job.jobCode].push(job);
    }

    return res.status(200).json({
      success: true,
      groups: grouped
    });
  } catch (error) {
    console.error("Grouped Jobs Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { jobTitle, jobDescription } = req.body;

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id"
      });
    }

    const existing = await jobService.getJobById(jobId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    const updated = await jobService.updateJob(jobId, {
      jobTitle,
      jobDescription
    });

    if (!updated) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully"
    });

  } catch (error) {
    console.error("Update Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId || isNaN(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job id"
      });
    }

    const existing = await jobService.getJobById(jobId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Job not found"
      });
    }

    await jobService.deleteJob(jobId);

    return res.status(204).send();
  } catch (error) {
    console.error("Delete Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};