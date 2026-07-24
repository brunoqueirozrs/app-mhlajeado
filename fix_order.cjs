const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `  if (process.env.PAUSE_ALL_N8N_WEBHOOKS !== "true" && process.env.PAUSE_ABSENCES_JOB !== "true") {
      const isTest = process.env.USE_N8N_TEST_ABSENCES === "true";
      let webhookUrl = isTest 
         ? (process.env.N8N_TEST_ABSENCES_WEBHOOK_URL || "https://n8n-url-placeholder/webhook-test/absences") 
         : (process.env.N8N_ABSENCES_WEBHOOK_URL || "https://n8n-url-placeholder/webhook/absences");
      
      if (webhookUrl && webhookUrl !== "https://n8n-url-placeholder/webhook/absences" && webhookUrl !== "") {
          fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(abs)
          }).catch(e => console.error("[N8N] Webhook Absences failed:", e));
      }
  }`;

// Remove the webhook code from its current place
code = code.replace(webhookCode, "");

// Insert it AFTER the drive upload block
// The drive upload block ends with:
//     } catch (e) {
//       console.error("[DRIVE] Failed to upload to Google Drive:", e);
//     }
//   }

const insertPoint = code.indexOf('  let emailStatus = "simulated";');
if (insertPoint !== -1) {
    code = code.substring(0, insertPoint) + webhookCode + "\n\n" + code.substring(insertPoint);
    fs.writeFileSync('server.ts', code);
    console.log("Moved webhook code successfully.");
} else {
    console.log("Insert point not found.");
}
