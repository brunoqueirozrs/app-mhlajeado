const { google } = require('googleapis');

async function testAppendAndUpdate() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
  const spreadsheetId = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";

  try {
    const testId = "TEST-" + Date.now();
    const testRow = [
      "PRT-TEST-001",
      "2026-07-28",
      "MARKTING",
      "Teste de envio direto via API",
      testId,
      "BRUNO QUEIROZ",
      "28/07/2026",
      "Obs inicial",
      "Pendente"
    ];

    // Append row
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Protocolos Internos'!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [testRow]
      }
    });
    console.log("Append Success!", appendRes.data.updates);

    // Read to verify and find row
    const getRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "'Protocolos Internos'!A:I",
    });
    const rows = getRes.data.values || [];
    console.log("Total rows now:", rows.length);
    
    let targetRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][4] === testId || rows[i][0] === "PRT-TEST-001") {
        targetRowIndex = i + 1; // 1-based index
        break;
      }
    }
    console.log("Target Row Index found:", targetRowIndex);

    if (targetRowIndex > 0) {
      // Update status to Concluido
      const updatedRow = [
        "PRT-TEST-001",
        "2026-07-28",
        "MARKTING",
        "Teste de envio direto via API",
        testId,
        "BRUNO QUEIROZ",
        "28/07/2026",
        "Obs atualizada - Concluído com sucesso",
        "Concluido"
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `'Protocolos Internos'!A${targetRowIndex}:I${targetRowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [updatedRow]
        }
      });
      console.log(`Row ${targetRowIndex} updated successfully!`);
    }

  } catch (e) {
    console.error("Direct Sheets API Error:", e.message);
  }
}

testAppendAndUpdate();
