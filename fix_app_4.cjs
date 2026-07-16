const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\(e\.target\.value\)\s+className=/g, '(e.target.value)} className=');
  content = content.replace(/setGlobalSearchTerm\(""\)\s+className=/g, 'setGlobalSearchTerm("")} className=');
  content = content.replace(/setActiveTab\("([^"]+)"\)\s+className=/g, 'setActiveTab("$1")} className=');
  content = content.replace(/setFilterType\("([^"]+)"\)\s+className=/g, 'setFilterType("$1")} className=');
  
  // just generic
  content = content.replace(/\)\s+className=/g, ')} className=');
  content = content.replace(/\)\s+onClick=/g, ')} onClick=');
  content = content.replace(/\)\s+key=/g, ')} key=');
  
  // What about `value={foo} className=` ?
  content = content.replace(/(\w+)\s+className=/g, '$1} className='); // No, this breaks <div className=
  fs.writeFileSync(file, content);
}

// Better approach for the generic issue:
// The regex `/\}\s*className=/g` was run previously. 
// It replaced `} className=` with ` className=`.
// So ANY variable `value={foo} className=` became `value={foo className=`.
// Let's look for `={[\w\.]+ className=` and change to `={[\w\.]+}`
