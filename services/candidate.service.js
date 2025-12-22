const db = require("../config/db");

async function createCandidate({
  firstName,
  middleName,
  lastName,
  email,
  phone,
  totalExperience,
  resumeUrl,
  skills = [],
  workExperience = []
}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const candidateQuery = `
      INSERT INTO Candidates
      (firstName, middleName, lastName, email, phone, totalExperience, resumeUrl)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [candidateResult] = await connection.execute(candidateQuery, [
      firstName,
      middleName || null,
      lastName,
      email,
      phone || null,
      totalExperience || null,
      resumeUrl
    ]);

    const candidateId = candidateResult.insertId;

    if (skills.length > 0) {
      const skillsQuery = `
        INSERT INTO CandidateSkills (candidateId, skills)
        VALUES ?
      `;
      const skillValues = skills.map(s => [candidateId, s]);
      await connection.query(skillsQuery, [skillValues]);
    }

    if (workExperience.length > 0) {
      const expQuery = `
        INSERT INTO CandidateWorkExperience
        (candidateId, companyName, roleTitle, startDate, endDate)
        VALUES ?
      `;
      const expValues = workExperience.map(e => [
        candidateId,
        e.companyName || null,
        e.roleTitle || null,
        e.startDate || null,
        e.endDate || null
      ]);
      await connection.query(expQuery, [expValues]);
    }

    await connection.commit();
    return candidateId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getCandidateById(candidateId) {
  const candidateQuery = `
    SELECT *
    FROM Candidates
    WHERE id = ?
  `;
  const [rows] = await db.execute(candidateQuery, [candidateId]);
  if (!rows.length) return null;

  const [skills] = await db.execute(
    `SELECT skills FROM CandidateSkills WHERE candidateId = ?`,
    [candidateId]
  );

  const [experience] = await db.execute(
    `SELECT companyName, roleTitle, startDate, endDate
     FROM CandidateWorkExperience WHERE candidateId = ?`,
    [candidateId]
  );

  return {
    ...rows[0],
    skills: skills.map(s => s.skills),
    workExperience: experience
  };
}

async function getCandidateByEmail(email) {
  const query = `
    SELECT *
    FROM Candidates
    WHERE email = ?
  `;
  const [rows] = await db.execute(query, [email]);
  return rows[0] || null;
}

async function listCandidates({ limit = 20, offset = 0 }) {
  limit = Number.isInteger(limit) ? limit : 20;
  offset = Number.isInteger(offset) ? offset : 0;

  const query = `
    SELECT id, firstName, lastName, email, totalExperience, createdAt
    FROM Candidates
    ORDER BY createdAt DESC
    LIMIT ${offset}, ${limit}
  `;
  const [rows] = await db.query(query);
  return rows;
}


async function updateCandidate(candidateId, updates) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const fields = [];
    const values = [];

    if (updates.firstName !== undefined) {
      fields.push("firstName = ?");
      values.push(updates.firstName);
    }

    if (updates.middleName !== undefined) {
      fields.push("middleName = ?");
      values.push(updates.middleName);
    }

    if (updates.lastName !== undefined) {
      fields.push("lastName = ?");
      values.push(updates.lastName);
    }

    if (updates.phone !== undefined) {
      fields.push("phone = ?");
      values.push(updates.phone);
    }

    if (updates.totalExperience !== undefined) {
      fields.push("totalExperience = ?");
      values.push(updates.totalExperience);
    }

    if (updates.resumeUrl !== undefined) {
      fields.push("resumeUrl = ?");
      values.push(updates.resumeUrl);
    }

    if (fields.length > 0) {
      const query = `
        UPDATE Candidates
        SET ${fields.join(", ")}
        WHERE id = ?
      `;

      values.push(candidateId);

      const [result] = await connection.execute(query, values);

      if (result.affectedRows === 0) {
        throw new Error("Candidate update failed");
      }
    }

    if (Array.isArray(updates.skills)) {
      await connection.execute(
        "DELETE FROM CandidateSkills WHERE candidateId = ?",
        [candidateId]
      );

      for (const skill of updates.skills) {
        await connection.execute(
          "INSERT INTO CandidateSkills (candidateId, skills) VALUES (?, ?)",
          [candidateId, skill]
        );
      }
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteCandidate(candidateId) {
  const query = `
    DELETE FROM Candidates
    WHERE id = ?
  `;
  const [result] = await db.execute(query, [candidateId]);
  return result.affectedRows > 0;
}

module.exports = {
  createCandidate,
  getCandidateById,
  getCandidateByEmail,
  listCandidates,
  updateCandidate,
  deleteCandidate
};