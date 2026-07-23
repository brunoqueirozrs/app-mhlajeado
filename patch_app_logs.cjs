const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const logs = `
  useEffect(() => {
    console.log("[App.tsx] activeTab changed:", activeTab);
  }, [activeTab]);

  useEffect(() => {
    console.log("[App.tsx] userRole changed:", userRole);
  }, [userRole]);

  useEffect(() => {
    console.log("[App.tsx] loggedUser changed:", loggedUser);
  }, [loggedUser]);
`;

code = code.replace("  // Monitor online network connectivity", logs + "\n  // Monitor online network connectivity");

fs.writeFileSync('src/App.tsx', code);
