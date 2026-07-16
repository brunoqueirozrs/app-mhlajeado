const fs = require('fs');
const glob = require('glob'); // Not using glob, just hardcoded files

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
    
    // Fix messed up tags like `<div } } } className="..."`
    content = content.replace(/<(div|button|form|span|tr|td|table|tbody)([\s\n\}]*)(className|id|key|type|onSubmit|onClick)/g, '<$1 $3');
    
    // Sometimes they just close with `}>` -> `>`
    content = content.replace(/<(div|button|form|span|tr|td|table|tbody)([\s\n\}]*)>/g, '<$1>');
    
    // Fix `</button>` etc. If they got messed up (they shouldn't have)
    
    // Clean up standalone `}` inside tags if possible, or just fix all `<div ... } ... >` 
    // A better approach is to match from `<div` to `>` and remove any dangling `}` that don't belong to a `{...}` prop.
    
    // Actually, `sed` replaced `initial={[^}]*}` which leaves `}`.
    content = content.replace(/\}\s*className=/g, ' className=');
    content = content.replace(/\}\s*onClick=/g, ' onClick=');
    content = content.replace(/\}\s*key=/g, ' key=');
    content = content.replace(/\}\s*type=/g, ' type=');
    content = content.replace(/\}\s*onSubmit=/g, ' onSubmit=');
    content = content.replace(/\}\s*id=/g, ' id=');
    content = content.replace(/\}\s*>/g, '>');
    content = content.replace(/\}\s*\/>/g, '/>');

    // And consecutive dangling brackets
    content = content.replace(/\}[\s\n]*\}/g, '');
    
    // Specifically looking at App.tsx:1197:
    /*
      <div 
       }
       }
       }
       className="..."
      />
    */
    content = content.replace(/<div[\s\n\}]+className/g, '<div className');
    content = content.replace(/<button[\s\n\}]+className/g, '<button className');
    content = content.replace(/<button[\s\n\}]+type/g, '<button type');
    content = content.replace(/<form[\s\n\}]+onSubmit/g, '<form onSubmit');
    content = content.replace(/<form[\s\n\}]+className/g, '<form className');

    fs.writeFileSync(file, content, 'utf8');
  }
});
