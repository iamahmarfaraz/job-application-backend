const db = require("../config/db");

async function createJob({ jobCode, jobTitle, jobDescription }) {
  const query = `
    INSERT INTO Jobs (jobCode, jobTitle, jobDescription)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.execute(query, [
    jobCode,
    jobTitle,
    jobDescription
  ]);
  return result.insertId;
}

async function getJobById(jobId) {
  const query = `
    SELECT id, jobCode, jobTitle, jobDescription, createdAt, updatedAt
    FROM Jobs
    WHERE id = ?
  `;
  const [rows] = await db.execute(query, [jobId]);
  return rows[0] || null;
}

async function listJobs({ limit = 20, offset = 0 }) {
  limit = Number.isInteger(limit) ? limit : 20;
  offset = Number.isInteger(offset) ? offset : 0;

  const query = `
    SELECT id, jobCode, jobTitle, jobDescription, createdAt, updatedAt
    FROM Jobs
    ORDER BY createdAt DESC
    LIMIT ${offset}, ${limit}
  `;

  const [rows] = await db.query(query);
  return rows;
}

async function updateJob(jobId, updates) {
  const fields = [];
  const values = [];

  if (updates.jobTitle !== undefined) {
    fields.push("jobTitle = ?");
    values.push(updates.jobTitle);
  }

  if (updates.jobDescription !== undefined) {
    fields.push("jobDescription = ?");
    values.push(updates.jobDescription);
  }

  if (fields.length === 0) {
    return false;
  }

  const query = `
    UPDATE Jobs
    SET ${fields.join(", ")}
    WHERE id = ?
  `;

  values.push(jobId);

  const [result] = await db.execute(query, values);
  return result.affectedRows > 0;
}


async function deleteJob(jobId) {
  const query = `
    DELETE FROM Jobs
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [jobId]);
  return result.affectedRows > 0;
}

async function listJobsGroupedByCode() {
  const query = `
    SELECT id, jobCode, jobTitle, jobDescription, createdAt, updatedAt
    FROM Jobs
    ORDER BY jobCode, createdAt DESC
  `;
  const [rows] = await db.execute(query);
  return rows;
}

module.exports = {
  createJob,
  getJobById,
  listJobs,
  updateJob,
  deleteJob,
  listJobsGroupedByCode
};