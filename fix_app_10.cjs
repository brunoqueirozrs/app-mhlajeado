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
    // For anything like `foo={bar/>` we make it `foo={bar} />`
    content = content.replace(/=([\{][a-zA-Z0-9_\.]+)[\s]*\/>/g, '=$1} />');
    fs.writeFileSync(file, content, 'utf8');
  }
});
