const fs = require('fs');

function fixFile(file) {
  if(!fs.existsSync(file)) return;
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/<div className="fixed inset-0 z-50 flex items-center justify-center p-4"> e\.stopPropagation\(\)}/g, '<div onClick={(e) => e.stopPropagation()}');
  fs.writeFileSync(file, text);
}

fixFile('src/components/InternalProtocolsPage.tsx');
