const { google } = require('googleapis');

async function testWrite() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";

  try {
    // 1. Get header to make sure columns exist
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Protocolos Internos'!A1:Z1",
    });
    console.log("Current header:", getRes.data.values ? getRes.data.values[0] : []);

    // Standard headers we want:
    // Protocolo, Data de Abertura, Setor, Motivo, ID, Vendedor, Timestamp, Observações, Status
    const desiredHeader = ['Protocolo', 'Data de Abertura', 'Setor', 'Motivo', 'ID', 'Vendedor', 'Timestamp', 'Observações', 'Status'];
    
    // Update header row to ensure all columns exist
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "'Protocolos Internos'!A1:I1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [desiredHeader]
      }
    });
    console.log("Updated header successfully!");

  } catch (e) {
    console.error("Direct Sheets API Error:", e.message);
  }
}

testWrite();
