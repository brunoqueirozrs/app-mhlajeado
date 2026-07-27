const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `app.delete("/api/tasks", (req, res) => {
  const { id, action } = req.query;
  if (action === "clear_completed") {
    tasks = tasks.filter(t => t.status !== "CONCLUIDA");
  } else if (id) {
    tasks = tasks.filter(t => t.id !== String(id));
  }
  writeJSONDb("tasks.json", tasks);
  res.json({ status: "success" });
});`;
const replace = `app.delete("/api/tasks", async (req, res) => {
  const { id, action } = req.query;
  
  // Enviar webhook para n8n avisando sobre exclusão
  try {
    const n8nTasksUrl = resolveN8nWebhookUrl(
      process.env.N8N_NEW_TASK_WEBHOOK_URL,
      process.env.N8N_WEBHOOK_URL,
      "agenda-tarefas",
      process.env.N8N_TEST_NEW_TASK_WEBHOOK_URL,
      process.env.USE_N8N_TEST_NEW_TASK
    );
    if (n8nTasksUrl && !n8nTasksUrl.includes("sua-url-ngrok") && !n8nTasksUrl.includes("localhost:5678")) {
      if (id) {
        console.log(\`[n8n] Tarefa Excluída: \${id}. Enviando webhook para \${n8nTasksUrl}...\`);
        await fetch(n8nTasksUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            event: "exclusao_tarefa",
            task_id: id
          })
        }).catch(err => console.error("Falha ao notificar n8n de exclusão da tarefa:", err));
      } else if (action === "clear_completed") {
        console.log(\`[n8n] Tarefas Concluídas Limpas. Enviando webhook para \${n8nTasksUrl}...\`);
        await fetch(n8nTasksUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
          body: JSON.stringify({
            event: "exclusao_tarefas_concluidas"
          })
        }).catch(err => console.error("Falha ao notificar n8n de limpeza de tarefas:", err));
      }
    }
  } catch(e) {
    console.error("Erro ao enviar webhook de exclusão de tarefa", e);
  }

  if (action === "clear_completed") {
    tasks = tasks.filter(t => t.status !== "CONCLUIDA");
  } else if (id) {
    tasks = tasks.filter(t => t.id !== String(id));
  }
  writeJSONDb("tasks.json", tasks);
  res.json({ status: "success" });
});`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log("Patched tasks delete to send n8n webhook");
