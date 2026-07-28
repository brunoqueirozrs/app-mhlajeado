const { google } = require('googleapis');

async function testReadLeads() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Acompanhamento de Lead | Abordagens'!A1:U10"
  });
  console.log("Rows count:", res.data.values ? res.data.values.length : 0);
  console.log("Header:", res.data.values[0]);
  console.log("Row 2:", res.data.values[1]);
  console.log("Row 3:", res.data.values[2]);
}

testReadLeads();
