const { google } = require('googleapis');

async function testDirectSheetUpdate() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";

  console.log("Checking Google Sheets client authentication...");
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  console.log("Spreadsheet Title:", res.data.properties.title);
  console.log("Sheets found:", res.data.sheets.map(s => s.properties.title));
}

testDirectSheetUpdate();
