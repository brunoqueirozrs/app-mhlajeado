require('dotenv').config();
const { google } = require('googleapis');

async function test() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: '1!A1:Z1', // Just get row 1
    });
    console.log(res.data.values[0]);
  } catch (e) {
    console.error(e);
  }
}
test();
