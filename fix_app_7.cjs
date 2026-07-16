const fs = require('fs');
let text = fs.readFileSync('src/App.tsx', 'utf8');
text = text.replace(/, \[\]\);/g, '}\n  }, []);');
fs.writeFileSync('src/App.tsx', text);
