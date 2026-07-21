const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const catchAllCode = `// Catch-all for undefined /api/* routes to avoid Vite SPA fallback returning index.html
app.use("/api/*", (req, res) => {
  res.status(404).json({ status: "error", message: "API endpoint not found", endpoint: req.originalUrl });
});`;

// Remove the catch-all code from its current position
code = code.replace(catchAllCode, '');

// Insert it right before "// Vite server integrations" assuming it comes before the startServer block, but wait...
// There are routes added after "Vite server integrations"?
// Let's just insert it right before "const startServer = async () => {"
code = code.replace(
  'const startServer = async () => {',
  `${catchAllCode}\n\nconst startServer = async () => {`
);

fs.writeFileSync('server.ts', code);
console.log("Fixed server.ts route order");
