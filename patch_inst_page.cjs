const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

const target = `  const handleDisparoMassa = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(\`Você tem certeza que deseja realizar o disparo em massa para \${selectedIds.length} item(ns) selecionado(s)?\`)) {
      alert("✅ Disparo em massa iniciado com sucesso!");
      setSelectedIds([]);
    }
  };`;

const replacement = `  const handleDisparoMassa = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(\`Você tem certeza que deseja realizar o disparo em massa para \${selectedIds.length} item(ns) selecionado(s)?\`)) {
      try {
        const itemsToDispatch = queue.filter(q => selectedIds.includes(q.id));
        const res = await fetch("/api/installations-queue/disparar-n8n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: itemsToDispatch })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Falha ao enviar disparo em massa.");
        }
        
        alert("✅ Disparo em massa via N8n iniciado com sucesso!");
        setSelectedIds([]);
      } catch (err: any) {
        alert("Erro no disparo em massa: " + err.message);
      }
    }
  };`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
