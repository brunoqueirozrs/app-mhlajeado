async function test() {
    const url = "https://script.google.com/macros/s/AKfycbyYIgJvqqrqB5E-lhDdhPh5-zad0oD1m2gInnlpVnDVVaIWBRzzRrnb0S7UrHdSUUoN/exec";
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        route: "saveInstallation",
        payload: {
          sheetName: "Agenda Instalação",
          item: { id: "test", nomeCliente: "Test", _linha: "" }
        }
      })
    });
    console.log(res.status);
    console.log(await res.text());
}
test();
