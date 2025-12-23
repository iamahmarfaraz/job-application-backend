const axios = require("axios");
require("dotenv").config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const NON_TRANSLATABLE_KEYS = [
  "id",
  "email",
  "resumeUrl",
  "jobId",
  "candidateId",
  "createdAt",
  "updatedAt"
];

function filterTranslatableFields(obj) {
  const result = {};
  for (const key in obj) {
    if (!NON_TRANSLATABLE_KEYS.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

async function translateApplications(applications, targetLang = "hi") {
  if (!Array.isArray(applications) || targetLang === "en") {
    return applications;
  }

  const payload = applications.map(app => ({
    id: app.id,
    data: filterTranslatableFields(app)
  }));

  const prompt = `
You are a backend translation engine.

Rules:
- Translate ALL user-facing values to ${targetLang}
- INCLUDING personal names (use phonetic transliteration if needed)
- DO NOT translate keys
- DO NOT translate emails, IDs, URLs, timestamps
- Preserve meaning, not spelling
- Return STRICT valid JSON only
- No markdown, no explanation

Input:
${JSON.stringify(payload, null, 2)}
`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
        max_tokens: 2048
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) return applications;

    let translated;
    try {
      translated = JSON.parse(content);
    } catch {
      return applications;
    }

    return applications.map(app => {
      const match = translated.find(t => t.id === app.id);
      return match ? { ...app, ...match.data } : app;
    });

  } catch (err) {
    console.error("GROQ TRANSLATION FAILED");

    if (err.response) {
      console.error(
        "STATUS:",
        err.response.status,
        "DATA:",
        JSON.stringify(err.response.data, null, 2)
      );
    } else {
      console.error("ERROR:", err.message);
    }

    return applications; // graceful fallback
  }
}

module.exports = { translateApplications };