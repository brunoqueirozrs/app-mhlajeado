const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    USE_N8N_TEST_COMPETITORS: process.env.USE_N8N_TEST_COMPETITORS || "false",
    PAUSE_COMPETITORS_JOB: process.env.PAUSE_COMPETITORS_JOB || "false",
    PAUSE_ALL_N8N_WEBHOOKS: process.env.PAUSE_ALL_N8N_WEBHOOKS || "false"
  });`;

const replacement = `    USE_N8N_TEST_COMPETITORS: process.env.USE_N8N_TEST_COMPETITORS || "false",
    PAUSE_COMPETITORS_JOB: process.env.PAUSE_COMPETITORS_JOB || "false",
    N8N_WEBHOOK_URL_ABSENCES: process.env.N8N_WEBHOOK_URL_ABSENCES || "",
    N8N_TEST_WEBHOOK_URL_ABSENCES: process.env.N8N_TEST_WEBHOOK_URL_ABSENCES || "",
    USE_N8N_TEST_ABSENCES: process.env.USE_N8N_TEST_ABSENCES || "false",
    PAUSE_ABSENCES_JOB: process.env.PAUSE_ABSENCES_JOB || "false",
    N8N_WEBHOOK_URL_ABSENCE_APPROVAL: process.env.N8N_WEBHOOK_URL_ABSENCE_APPROVAL || "",
    N8N_TEST_WEBHOOK_URL_ABSENCE_APPROVAL: process.env.N8N_TEST_WEBHOOK_URL_ABSENCE_APPROVAL || "",
    USE_N8N_TEST_ABSENCE_APPROVAL: process.env.USE_N8N_TEST_ABSENCE_APPROVAL || "false",
    PAUSE_ABSENCE_APPROVAL_JOB: process.env.PAUSE_ABSENCE_APPROVAL_JOB || "false",
    PAUSE_ALL_N8N_WEBHOOKS: process.env.PAUSE_ALL_N8N_WEBHOOKS || "false"
  });`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
