const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("from 'googleapis'")) {
    code = code.replace(
        "import express from \"express\";",
        "import express from \"express\";\nimport { google } from 'googleapis';\nimport { Readable } from 'stream';"
    );
}

const driveUploadLogic = `
  let uploadedDriveLink = abs.driveLink || "";

  if (abs.fileData && abs.fileName) {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\\\n/g, '\\n'),
        },
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });
      const drive = google.drive({ version: 'v3', auth });

      const base64Data = abs.fileData.split(',')[1] || abs.fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);

      const ext = abs.fileName.includes('.') ? '.' + abs.fileName.split('.').pop() : '';
      const [ano, mes, dia] = (abs.dataFalta || "").split("-");
      const dataFaltaFormatada = (dia && mes && ano) ? \`\${dia}-\${mes}-\${ano}\` : abs.dataFalta;
      const newFileName = \`\${abs.vendedor || "Consultor"} - \${dataFaltaFormatada}\${ext}\`;

      const fileMetadata = {
        name: newFileName,
        parents: ['1EWJVGRmw-lzCoVqXfaAfYHkFYLhhhqCf']
      };
      const media = {
        mimeType: abs.mimeType || 'application/octet-stream',
        body: stream,
      };

      if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, webViewLink',
        });
        if (file.data.webViewLink) {
          uploadedDriveLink = file.data.webViewLink;
          abs.driveLink = uploadedDriveLink;
          newAbsence.link = uploadedDriveLink;
          
          const idx = absences.findIndex((a) => a.id === newAbsence.id);
          if (idx !== -1) {
            absences[idx].link = uploadedDriveLink;
            writeJSONDb("absences.json", absences);
          }
          console.log("[DRIVE] File uploaded to drive:", uploadedDriveLink);
        }
      } else {
        console.warn("[DRIVE] GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY not set. Skipping Drive upload.");
      }
    } catch (e) {
      console.error("[DRIVE] Failed to upload to Google Drive:", e);
    }
  }
`;

code = code.replace(
    "  let emailStatus = \"simulated\";\n  let emailError = null;",
    driveUploadLogic + "\n  let emailStatus = \"simulated\";\n  let emailError = null;"
);

fs.writeFileSync('server.ts', code);
