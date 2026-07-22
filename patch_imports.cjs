const fs = require('fs');

const filesToUpdate = [
  'src/components/AdminTestResultsPage.tsx',
  'src/components/GestaoPessoasPage.tsx',
  'src/components/RolePlayIA.tsx',
  'src/components/AdminLogsPage.tsx',
  'src/components/AdminN8NPage.tsx'
];

for (const file of filesToUpdate) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import \{ db \} from "\.\.\/lib\/firebase";/g, 'import { db } from "../lib/db";');
  code = code.replace(/import \{ db \} from '\.\.\/lib\/firebase';/g, "import { db } from '../lib/db';");
  fs.writeFileSync(file, code);
}

if (fs.existsSync('src/lib/firebase.ts')) {
  fs.unlinkSync('src/lib/firebase.ts');
}
