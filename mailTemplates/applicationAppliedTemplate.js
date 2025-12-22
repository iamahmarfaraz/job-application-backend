module.exports = (firstName, jobTitle) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Application Submitted</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#020617;border-radius:12px;padding:32px;color:#e5e7eb;">
          <tr>
            <td style="font-size:22px;font-weight:bold;color:#38bdf8;padding-bottom:12px;">
              Application Submitted Successfully
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.6;padding-bottom:20px;">
              Hi ${firstName},<br/><br/>
              Your application for the position <b>${jobTitle}</b> has been successfully submitted.<br/>
              Our recruitment team will review your profile and get back to you if your application moves forward.
            </td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#94a3b8;">
              Thank you for applying.<br/>
              Job Application Team
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
};