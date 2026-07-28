const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function run() {
  const protocolNum = "PRT-API-" + Math.floor(Math.random() * 10000);
  console.log("1. Creating new protocol:", protocolNum);

  // POST
  const postRes = await fetch("http://localhost:3000/api/sheets/internal-protocols", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      protocolo: protocolNum,
      dataAbertura: "2026-07-28",
      setor: "MARKTING",
      motivo: "Validação da Base de Dados",
      vendedor: "BRUNO QUEIROZ",
      observacoes: "Iniciado pelo backend",
      status: "Pendente"
    })
  });

  const postData = await postRes.json();
  console.log("POST Response:", postData);

  if (!postData.success || !postData.item.id) {
    console.error("Failed to create protocol!");
    return;
  }

  const id = postData.item.id;

  // PUT - Concluir
  console.log("2. Updating protocol to Concluído ID:", id);
  const putRes = await fetch(`http://localhost:3000/api/sheets/internal-protocols/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "Concluido",
      observacoes: "Finalizado e validado via Backend com sucesso!"
    })
  });

  const putData = await putRes.json();
  console.log("PUT Response:", putData);

  // GET
  console.log("3. Fetching all protocols");
  const getRes = await fetch("http://localhost:3000/api/sheets/internal-protocols");
  const getData = await getRes.json();
  const created = getData.find(p => p.id === id);
  console.log("Created protocol in GET list:", created);
}

run();
