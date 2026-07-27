const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const search = `    list.push({
      id,
      nomeCliente,
      telefone,
      endereco,
      cidade,
      vendedorResponsavel,
      gerenteResponsavel,
      planoEscolhido,
      dataAgendamento,
      horario,
      status: statusValue,
      observacao,
      equipeLoja,
      dataCriacao,
      slotIndex: slotValue
    });`;
const replace = `    list.push({
      id,
      nomeCliente,
      telefone,
      endereco,
      cidade,
      vendedorResponsavel,
      gerenteResponsavel,
      planoEscolhido,
      dataAgendamento,
      horario,
      status: statusValue,
      observacao,
      equipeLoja,
      dataCriacao,
      slotIndex: slotValue,
      _linha: i + 1
    });`;

code = code.replace(search, replace);
fs.writeFileSync('server.ts', code);
console.log("Patched parseInstallationRows to include _linha");
