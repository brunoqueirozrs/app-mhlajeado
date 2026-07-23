const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("ErrorBoundary")) {
  code = code.replace(
    "import React, { useState, useEffect } from \"react\";",
    "import React, { useState, useEffect } from \"react\";\nimport { ErrorBoundary } from \"./components/ErrorBoundary\";"
  );

  code = code.replace(
    "renderActivePage()",
    "<ErrorBoundary>\n              {renderActivePage()}\n            </ErrorBoundary>"
  );
}

fs.writeFileSync('src/App.tsx', code);
