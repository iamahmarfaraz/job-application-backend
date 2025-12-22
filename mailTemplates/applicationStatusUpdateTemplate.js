module.exports = (firstName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Application Status Update</title>
</head>
<body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#020617;border-radius:12px;padding:32px;color:#e5e7eb;">
          <tr>
            <td style="font-size:22px;font-weight:bold;color:#22c55e;padding-bottom:12px;">
              Application Status Updated
            </td>
          </tr>
          <tr>
            <td style="font-size:16px;line-height:1.6;padding-bottom:20px;">
              Hi ${firstName},<br/><br/>
              There has been an update to your job application.<br/>
              Please log in to the portal to view the latest status and next steps.
            </td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#94a3b8;">
              Best of luck.<br/>
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