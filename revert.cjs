const fs = require('fs');
const files = [
  'src/App.tsx',
  'src/components/CobrancasDashboard.tsx',
  'src/components/CobrancasPage.tsx',
  'src/components/InternalProtocolsPage.tsx',
  'src/components/LeadsPage.tsx',
  'src/components/ExternalStorePortal.tsx',
  'src/components/InstallationsPage.tsx',
  'src/components/InstallationsQueuePage.tsx'
];
files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+className=/g, '<$1 className=');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+onClick=/g, '<$1 onClick=');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+key=/g, '<$1 key=');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+type=/g, '<$1 type=');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+onChange=/g, '<$1 onChange=');
    content = content.replace(/<([a-zA-Z0-9_]+)\}\s+onSubmit=/g, '<$1 onSubmit=');
    fs.writeFileSync(file, content, 'utf8');
  }
});
