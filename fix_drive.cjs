const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The replacement was done on `  let emailStatus = "simulated";\n  let emailError = null;`
// And we have two copies of the logic. Let's find the first `  let uploadedDriveLink = abs.driveLink || "";` and remove up to the SECOND `  let uploadedDriveLink = abs.driveLink || "";`

const startIdx = code.indexOf('  let uploadedDriveLink = abs.driveLink || "";');
const endIdx = code.indexOf('  let uploadedDriveLink = abs.driveLink || "";', startIdx + 1);

if (startIdx !== -1 && endIdx !== -1 && startIdx !== endIdx) {
    code = code.substring(0, startIdx) + code.substring(endIdx);
    fs.writeFileSync('server.ts', code);
    console.log("Fixed duplicate code.");
} else {
    console.log("Duplicate not found or indices mismatch.", startIdx, endIdx);
}
