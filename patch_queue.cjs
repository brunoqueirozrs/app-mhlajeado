const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Replace installationsQueue fallback ID
const oldQueuePush = `queue.push({
            dataAdicao: row[0] || "",
            status: row[1] || "Pendente",
            cliente: row[2] || "-",
            protocolo: row[3] || "-",
            vendedor: row[4] || "-",
            observacoes: row[5] || "-",
            id: row[6] || Date.now().toString() + Math.random().toString(36).substr(2, 5)
          });`;
const newQueuePush = `const id = row[6] || ('fallback-' + i + '-' + (row[3] || '').replace(/[^a-zA-Z0-9]/g, ''));
          const localItem = localInstallationQueue.find(p => p.id === id) || ({} as any);
          queue.push({
            dataAdicao: row[0] || localItem.dataAdicao || "",
            status: row[1] || localItem.status || "Pendente",
            cliente: row[2] || localItem.cliente || "-",
            protocolo: row[3] || localItem.protocolo || "-",
            vendedor: row[4] || localItem.vendedor || "-",
            observacoes: row[5] || localItem.observacoes || "-",
            id: id
          });`;
code = code.replace(oldQueuePush, newQueuePush);

// Also add Deduplicate logic
const oldMergeQueue = `localInstallationQueue = [...notInGas, ...queue.reverse()];`;
const newMergeQueue = `localInstallationQueue = [...notInGas, ...queue.reverse()];
      
      // Deduplicate by ID
      const seen = new Set();
      localInstallationQueue = localInstallationQueue.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });`;
code = code.replace(oldMergeQueue, newMergeQueue);

fs.writeFileSync('server.ts', code);
