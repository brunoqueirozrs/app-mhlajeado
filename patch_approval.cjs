const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookLogic = `
function triggerApprovalWebhook(absence) {
  if (process.env.PAUSE_ALL_N8N_WEBHOOKS === "true" || process.env.PAUSE_ABSENCE_APPROVAL_JOB === "true") return;
  const isTest = process.env.USE_N8N_TEST_ABSENCE_APPROVAL === "true";
  let webhookUrl = isTest 
     ? (process.env.N8N_TEST_ABSENCE_APPROVAL_WEBHOOK_URL || "https://n8n-url-placeholder/webhook-test/absence-approval") 
     : (process.env.N8N_ABSENCE_APPROVAL_WEBHOOK_URL || "https://n8n-url-placeholder/webhook/absence-approval");
  
  if (webhookUrl && webhookUrl !== "https://n8n-url-placeholder/webhook/absence-approval" && webhookUrl !== "") {
      const payload = {
          vendedor: absence.vendedor,
          telefone: "", // N8N will look this up, or add it later
          mensagem: "Seu atestado/comprovante referente sua ausencia/falta foi devidamente encaminhado ao RH",
          dataFalta: absence.dataFalta,
          motivo: absence.motivo,
          id: absence.id
      };
      fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      }).catch(e => console.error("[N8N] Webhook Absence Approval failed:", e));
  }
}
`;

code = code.replace("app.patch(\"/api/absences/:id\", (req, res) => {", webhookLogic + "\napp.patch(\"/api/absences/:id\", (req, res) => {");

code = code.replace(
  "    absences[idx].status = status;\n    writeJSONDb(\"absences.json\", absences);",
  "    absences[idx].status = status;\n    writeJSONDb(\"absences.json\", absences);\n    if (status === \"Aprovado\" || status.toLowerCase() === \"aprovado\") {\n      triggerApprovalWebhook(absences[idx]);\n    }"
);

code = code.replace(
  "    absences[idx].status = action === \"approve\" ? \"Aprovado\" : \"Rejeitado\";\n    writeJSONDb(\"absences.json\", absences);",
  "    absences[idx].status = action === \"approve\" ? \"Aprovado\" : \"Rejeitado\";\n    writeJSONDb(\"absences.json\", absences);\n    if (action === \"approve\") {\n      triggerApprovalWebhook(absences[idx]);\n    }"
);

fs.writeFileSync('server.ts', code);
