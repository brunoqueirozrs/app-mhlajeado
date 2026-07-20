const fs = require('fs');
console.log(JSON.parse(fs.readFileSync('./db_data/leadsFrios.json')).length);
