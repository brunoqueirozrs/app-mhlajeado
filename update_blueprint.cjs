const fs = require('fs');
let blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

if (!blueprint.collections.find(c => c.name === 'test_results')) {
  blueprint.collections.push({
    name: 'test_results',
    fields: [{ name: 'vendorId', type: 'string' }],
    rules: [{ allow: 'read, write', condition: 'true' }]
  });
}

fs.writeFileSync('firebase-blueprint.json', JSON.stringify(blueprint, null, 2));

let rules = 'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n';
blueprint.collections.forEach(c => {
  rules += `    match /${c.name}/{documentId} {\n`;
  c.rules.forEach(r => {
    rules += `      allow ${r.allow}: if ${r.condition};\n`;
  });
  rules += '    }\n';
});
rules += '  }\n}\n';
fs.writeFileSync('firestore.rules', rules);
