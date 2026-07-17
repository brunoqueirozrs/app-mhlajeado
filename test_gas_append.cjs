async function test() {
    const url = "https://script.google.com/macros/s/AKfycbyYIgJvqqrqB5E-lhDdhPh5-zad0oD1m2gInnlpVnDVVaIWBRzzRrnb0S7UrHdSUUoN/exec";
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        route: "appendRow",
        payload: {
          sheetName: "Agenda Instalação",
          item: { 
            "id": "inst_123", 
            "Cliente": "Test", 
            "Telefone": "555-5555",
            "Endereço": "Rua 1",
            "Cidade": "Lajeado",
            "Vendedor": "Bruno",
            "Gerente": "Bruno",
            "Plano": "100MB",
            "Data": "2023-01-01",
            "Horário": "Manhã",
            "Status": "Agendado",
            "Observação": "teste",
            "Equipe": "",
            "Data Criação": "2023-01-01",
            "Slot": "1"
          }
        }
      })
    });
    console.log("Append result:", res.status);
    console.log(await res.text());
}
test();
