const db = require("../config/db");

async function createApplication({
  candidateId,
  jobId,
  applicationStatusId,
  applicationStageId
}) {
  const query = `
    INSERT INTO Applications
    (candidateId, jobId, applicationStatusId, applicationStageId)
    VALUES (?, ?, ?, ?)
  `;

  const [result] = await db.execute(query, [
    candidateId,
    jobId,
    applicationStatusId,
    applicationStageId
  ]);

  return result.insertId;
}

async function checkExistingApplication(candidateId, jobId) {
  const query = `
    SELECT id
    FROM Applications
    WHERE candidateId = ? AND jobId = ?
    LIMIT 1
  `;
  const [rows] = await db.execute(query, [candidateId, jobId]);
  return rows.length > 0;
}

async function getApplicationById(applicationId) {
  const query = `
    SELECT 
      a.id,
      a.createdAt,
      a.updatedAt,
      a.candidateId,
      c.firstName,
      c.lastName,
      c.email,
      a.jobId,
      j.jobTitle,
      s.code AS status,
      st.code AS stage
    FROM Applications a
    JOIN Candidates c ON c.id = a.candidateId
    JOIN Jobs j ON j.id = a.jobId
    JOIN ApplicationStatus s ON s.id = a.applicationStatusId
    JOIN ApplicationStage st ON st.id = a.applicationStageId
    WHERE a.id = ?
  `;
  const [rows] = await db.execute(query, [applicationId]);
  return rows[0] || null;
}

async function getApplicationsByJob(jobId) {
  const query = `
    SELECT 
      a.id AS applicationId,
      a.createdAt,

      c.id AS candidateId,
      c.firstName,
      c.lastName,
      c.email,
      c.totalExperience,
      c.resumeUrl,

      s.code AS statusCode,
      s.code AS statusLabel,

      st.code AS stageCode,
      st.code AS stageLabel,

      (
        SELECT JSON_ARRAYAGG(cs.skills)
        FROM CandidateSkills cs
        WHERE cs.candidateId = c.id
        ) AS skills,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'companyName', we.companyName,
            'roleTitle', we.roleTitle,
            'startDate', we.startDate,
            'endDate', we.endDate
          )
        )
        FROM CandidateWorkExperience we
        WHERE we.candidateId = c.id
      ) AS workExperience

    FROM Applications a
    JOIN Candidates c ON c.id = a.candidateId
    JOIN ApplicationStatus s ON s.id = a.applicationStatusId
    JOIN ApplicationStage st ON st.id = a.applicationStageId
    WHERE a.jobId = ?
    ORDER BY a.createdAt DESC
  `;

  const [rows] = await db.execute(query, [jobId]);

  return rows.map(row => ({
    ...row,
    workExperience: Array.isArray(row.workExperience)
        ? row.workExperience
        : row.workExperience
        ? JSON.parse(row.workExperience)
        : []
    }));
}

async function updateApplicationStatus(applicationId, statusId, stageId) {
  const query = `
    UPDATE Applications
    SET applicationStatusId = ?, applicationStageId = ?
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [
    statusId,
    stageId,
    applicationId
  ]);
  return result.affectedRows > 0;
}

async function getApplicationsByCandidate(candidateId) {
  const query = `
    SELECT
      a.id,
      a.createdAt,
      j.id AS jobId,
      j.jobTitle,
      s.code AS status,
      st.code AS stage
    FROM Applications a
    JOIN Jobs j ON j.id = a.jobId
    JOIN ApplicationStatus s ON s.id = a.applicationStatusId
    JOIN ApplicationStage st ON st.id = a.applicationStageId
    WHERE a.candidateId = ?
    ORDER BY a.createdAt DESC
  `;
  const [rows] = await db.execute(query, [candidateId]);
  return rows;
}

module.exports = {
  createApplication,
  checkExistingApplication,
  getApplicationById,
  getApplicationsByJob,
  updateApplicationStatus,
  getApplicationsByCandidate
};