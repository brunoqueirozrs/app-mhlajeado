const fs = require('fs');
const text = fs.readFileSync('htmlview.html', 'utf-8');
const regex = /items\.push\(\{(.*?)\}\)/g;
let match;
while ((match = regex.exec(text)) !== null) {
  const content = match[1];
  const nameMatch = content.match(/name:\s*"([^"]+)"/);
  const gidMatch = content.match(/gid:\s*"(\d+)"/);
  if (nameMatch && gidMatch) {
    console.log(`Name: ${nameMatch[1]} -> GID: ${gidMatch[1]}`);
  }
}
