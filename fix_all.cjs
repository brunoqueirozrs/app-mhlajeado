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
    
    // Fix missing } before className
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+className=/g, '$1} className=');
    // Revert if it over-replaced like `"text-xs" className=` which wouldn't match \w but still.
    // Actually the regex `([a-zA-Z0-9_\.\(\)\[\]]+)` matches `_linha` -> `_linha}`
    // It also matches `value={foo` -> `value={foo}`
    
    // Fix missing } before onClick
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+onClick=/g, '$1} onClick=');

    // Fix missing } before key
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+key=/g, '$1} key=');
    
    // Fix missing } before type
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+type=/g, '$1} type=');
    
    // Fix missing } before onChange
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+onChange=/g, '$1} onChange=');

    // Fix missing } before onSubmit
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]]+)\s+onSubmit=/g, '$1} onSubmit=');
    
    // Specifically fix the onClick arrow functions
    content = content.replace(/;\s*\}>/g, '; }}>');
    
    // Generic fix for missing } at the end of tags
    // e.g. <button onClick={() => set()} className="btn">
    
    // Let's also fix broken `</motion.` strings which I already did
    // But what if it's missing `}` before `>`?
    content = content.replace(/([a-zA-Z0-9_\.\(\)\[\]'"]+)\s*>/g, (match, p1) => {
        // if it's a prop value without quotes and it's not a standard closing tag
        if (!p1.endsWith('"') && !p1.endsWith("'") && !p1.endsWith('}')) {
             // Maybe it's `value={foo>` -> `value={foo}>`
             // This is risky, but let's just do specific ones.
             return p1 + '>';
        }
        return match;
    });

    fs.writeFileSync(file, content, 'utf8');
  }
});
