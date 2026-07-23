const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace colors in email
code = code.replace(/#ea580c/g, '#0284c7');
code = code.replace(/#fff7ed/g, '#f0f9ff');
code = code.replace(/#ffedd5/g, '#e0f2fe');
code = code.replace(/#431407/g, '#0c4a6e');

// Add N8N webhook logic to app.post("/api/absences")
const n8nInjection = `
  // We will also use newAbsence for the email
  abs.id = newAbsence.id;

  if (process.env.PAUSE_ALL_N8N_WEBHOOKS !== "true" && process.env.PAUSE_ABSENCES_JOB !== "true") {
      const isTest = process.env.USE_N8N_TEST_ABSENCES === "true";
      let webhookUrl = isTest 
         ? (process.env.N8N_TEST_ABSENCES_WEBHOOK_URL || "https://n8n-url-placeholder/webhook-test/absences") 
         : (process.env.N8N_ABSENCES_WEBHOOK_URL || "https://n8n-url-placeholder/webhook/absences");
      
      if (webhookUrl && webhookUrl !== "https://n8n-url-placeholder/webhook/absences" && webhookUrl !== "") {
          fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newAbsence)
          }).catch(e => console.error("[N8N] Webhook Absences failed:", e));
      }
  }
`;
code = code.replace("  // We will also use newAbsence for the email\n  abs.id = newAbsence.id;", n8nInjection);

fs.writeFileSync('server.ts', code);
