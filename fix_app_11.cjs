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
    // If we have `<div ... className="...` with missing `}` for something before it, it's hard to catch globally.
    // Instead, I'll search for typical broken patterns `) className="` or `) onClick={`
    content = content.replace(/\)\s+className=/g, ')} className=');
    content = content.replace(/\)\s+onClick=/g, ')} onClick=');
    content = content.replace(/'\s+className=/g, '\'} className=');
    content = content.replace(/"\s+className=/g, '"} className='); // Only if it was supposed to be closed, but usually it's just `<div className="foo">` so `"` is correct.
    // Ah, wait. `} className=` was removed.
    // So `{foo} className=` became `{foo className=`
    // Which means we have `{foo className=`.
    content = content.replace(/\{([a-zA-Z0-9_\.\(\)\[\]'" \+\-\*\/\?:]+)\s+className=/g, '{$1} className=');
    content = content.replace(/\{([a-zA-Z0-9_\.\(\)\[\]'" \+\-\*\/\?:]+)\s+onClick=/g, '{$1} onClick=');
    fs.writeFileSync(file, content, 'utf8');
  }
});
