const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(/setIsAiKeyLeaked\(true\);\n\s*setAiKeyErrorMessage\(d\.errorMessage \|\| "Your API key was reported as leaked\."\);\n\s*\)/, 'setIsAiKeyLeaked(true);\n          setAiKeyErrorMessage(d.errorMessage || "Your API key was reported as leaked.");\n        }\n      })');

text = text.replace(/if \(d && d\.status === "issues"\) \{\n\s*setConfigError\(true\);\n\s*\)/, 'if (d && d.status === "issues") {\n          setConfigError(true);\n        }\n      })');

fs.writeFileSync('src/App.tsx', text);
