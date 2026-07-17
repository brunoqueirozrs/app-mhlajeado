const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const targetStr = `      if (existingIndex !== -1) {
        baseClients[existingIndex] = {
           ...baseClients[existingIndex],
           status: "Ativo", 
           plano: updates.plano, 
           velocidadeMb, 
           telefoneExterno: updates.telefone, 
           dataAtivacao: updates.dataInstalacao,
           endereco: updates.endereco
        };
      } else {
        const idContrato = \`MHN_POS_\${Math.floor(Math.random()*100000)}\`;
        baseClients.push({
          idContrato,
          nome: updates.nome,
          plano: updates.plano,
          status: "Ativo",
          valor: 0,
          velocidadeMb,
          telefoneExterno: updates.telefone,
          endereco: updates.endereco,
          dataAtivacao: updates.dataInstalacao,
          consultorOrigem: updates.vendedora || "Pós Vendas",
          cidade: "Indefinido"
        });
      }
      writeJSONDb("baseClients.json", baseClients);
      // We push the last element
      const appendedClient = baseClients[baseClients.length - 1];
      writeBaseClientToGoogleSheet(appendedClient).catch(e => console.error(e));`;

const replacementStr = `      let modifiedClient = null;
      if (existingIndex !== -1) {
        baseClients[existingIndex] = {
           ...baseClients[existingIndex],
           status: "Ativo", 
           plano: updates.plano, 
           velocidadeMb, 
           telefoneExterno: updates.telefone, 
           dataAtivacao: updates.dataInstalacao,
           endereco: updates.endereco
        };
        modifiedClient = baseClients[existingIndex];
      } else {
        const idContrato = \`MHN_POS_\${Math.floor(Math.random()*100000)}\`;
        const newClient = {
          idContrato,
          nome: updates.nome,
          plano: updates.plano,
          status: "Ativo",
          valor: 0,
          velocidadeMb,
          telefoneExterno: updates.telefone,
          endereco: updates.endereco,
          dataAtivacao: updates.dataInstalacao,
          consultorOrigem: updates.vendedora || "Pós Vendas",
          cidade: "Indefinido"
        };
        baseClients.push(newClient);
        modifiedClient = newClient;
      }
      writeJSONDb("baseClients.json", baseClients);
      // Only append new rows to sheet
      if (modifiedClient && existingIndex === -1) {
        writeBaseClientToGoogleSheet(modifiedClient).catch(e => console.error(e));
      }`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', content);
