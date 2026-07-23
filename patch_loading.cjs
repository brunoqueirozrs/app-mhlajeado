const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add isInitialLoad state
code = code.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [isInitialLoad, setIsInitialLoad] = useState(true);"
);

// Update condition
code = code.replace(
  "{loading && leads.length === 0 ?",
  "{isInitialLoad ?"
);

// Set isInitialLoad to false when fetchAllData finishes
code = code.replace(
  "setLoading(false);\n      setIsSyncing(false);",
  "setLoading(false);\n      setIsSyncing(false);\n      setIsInitialLoad(false);"
);

fs.writeFileSync('src/App.tsx', code);
