const { google } = require('googleapis');

async function testLeadsSheets() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";

  try {
    // 1. Get Acompanhamento de Lead | Abordagens header & first 5 rows
    const res1 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Acompanhamento de Lead | Abordagens'!A1:U5",
    });
    console.log("Acompanhamento de Lead rows (1-5):", res1.data.values);

    // 2. Get BaseLeadsFrios_Unificada header & first 5 rows
    const res2 = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'BaseLeadsFrios_Unificada'!A1:R5",
    });
    console.log("BaseLeadsFrios_Unificada rows (1-5):", res2.data.values);

  } catch (e) {
    console.error("Sheets API Error:", e.message);
  }
}

testLeadsSheets();
