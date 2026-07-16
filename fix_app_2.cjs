const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
  /setInvalidEnvKeys\(d\.invalidFormatKeys\);\n\s*\n\s*\}/g,
  'setInvalidEnvKeys(d.invalidFormatKeys);\n          }\n        }\n      }'
);

text = text.replace(
  /setAvailableVendors\(combined\);\n\s*\)/g,
  'setAvailableVendors(combined);\n        }\n      })'
);

fs.writeFileSync('src/App.tsx', text);
