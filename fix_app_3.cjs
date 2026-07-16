const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');

text = text.replace(
  /setInvalidEnvKeys\(d\.invalidFormatKeys\);\n\s*\n\s*\}/g,
  'setInvalidEnvKeys(d.invalidFormatKeys);\n          }\n        }\n      }'
); // Might have failed

text = text.replace(
  /setInvalidEnvKeys\(d\.invalidFormatKeys\);\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n\s*\n/g, ''
);

// We need to fix the invalid syntax using a robust RegExp or substring search
// I'll just write a script to do exact string replacement based on what I see in `cat` output.
let lines = text.split('\n');
let fixed = [];
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('setInvalidEnvKeys(d.invalidFormatKeys);') && lines[i+1].trim() === '' && lines[i+2].trim() === '})') {
    fixed.push(lines[i]);
    fixed.push('          }');
    fixed.push('        }');
    continue;
  }
  if (lines[i].includes('setAvailableVendors(combined);') && lines[i+1] && lines[i+1].trim() === ')') {
    fixed.push(lines[i]);
    fixed.push('        }');
    fixed.push('      })');
    i++; // skip `)`
    continue;
  }
  fixed.push(lines[i]);
}
fs.writeFileSync('src/App.tsx', fixed.join('\n'));
