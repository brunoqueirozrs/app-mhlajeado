const fs = require('fs');
for (const file of ['src/lib/auth.ts', 'src/lib/db.ts', 'src/lib/firebase.ts']) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('getApps')) continue;
  code = code.replace(/import \{ initializeApp \} from 'firebase\/app';/, "import { initializeApp, getApps, getApp } from 'firebase/app';");
  code = code.replace(/const app = initializeApp\(.*?\);/, "const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);");
  // For firebase.ts which has firebaseConfig defined locally
  if (file === 'src/lib/firebase.ts') {
    code = code.replace(/const app = getApps\(\).length > 0 \? getApp\(\) : initializeApp\(firebaseConfig\);/, "const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);");
  }
  fs.writeFileSync(file, code);
}
