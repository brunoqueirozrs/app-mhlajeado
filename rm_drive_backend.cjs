const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /  let uploadedDriveLink = abs\.driveLink \|\| "";[\s\S]*?console\.error\("\[DRIVE\] Failed to upload to Google Drive:", e\);\n    }\n  }/g;

code = code.replace(regex, "");

fs.writeFileSync('server.ts', code);
