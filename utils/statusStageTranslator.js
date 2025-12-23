const STATUS_LABELS = {
  hi: {
    APPLIED: "आवेदन किया गया",
    SHORTLISTED: "शॉर्टलिस्ट किया गया",
    INTERVIEW: "इंटरव्यू",
    REJECTED: "अस्वीकृत",
    HIRED: "नियुक्त"
  },
  en: {}
};

const STAGE_LABELS = {
  hi: {
    SCREENING: "स्क्रीनिंग",
    INTERVIEW: "इंटरव्यू",
    HR_ROUND: "एचआर राउंड",
    OFFER: "ऑफ़र",
    CLOSED: "समाप्त"
  },
  en: {}
};

function translateStatusStage(app, lang = "en") {
  if (lang === "en") return app;

  return {
    ...app,
    statusLabel: STATUS_LABELS[lang]?.[app.statusCode] || app.statusCode,
    stageLabel: STAGE_LABELS[lang]?.[app.stageCode] || app.stageCode
  };
}

module.exports = { translateStatusStage };