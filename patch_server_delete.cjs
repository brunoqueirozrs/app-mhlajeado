const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const deleteRoute = `
app.delete("/api/absences/:id", (req, res) => {
  const { id } = req.params;
  const initialLength = absences.length;
  absences = absences.filter((a: any) => a.id !== id);
  if (absences.length !== initialLength) {
    writeJSONDb("absences.json", absences);
    res.json({ status: "success", message: "Absence deleted" });
  } else {
    res.status(404).json({ status: "error", message: "Absence not found" });
  }
});
`;

code = code.replace(
  'app.patch("/api/absences/:id", (req, res) => {',
  deleteRoute + '\napp.patch("/api/absences/:id", (req, res) => {'
);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts with DELETE route");
