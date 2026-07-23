const fs = require('fs');
const app = fs.readFileSync('src/App.tsx', 'utf8');

const typeMatch = app.match(/activeTab, setActiveTab\] = useState<\s*([\s\S]+?)\s*>\("dashboard"\);/);
const types = typeMatch[1].split('|').map(t => t.trim().replace(/"/g, ''));

const switchMatch = app.match(/switch\s*\(activeTab\)\s*{([\s\S]+?)\s*default:/);
const switchCases = switchMatch[1].match(/case\s+"([^"]+)":/g).map(c => c.replace(/case\s+"/g, '').replace(/":/g, ''));

const missing = types.filter(t => !switchCases.includes(t));
console.log("Missing cases:", missing);
