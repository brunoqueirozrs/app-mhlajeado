const url = "https://script.google.com/macros/s/AKfycbyYIgJvqqrqB5E-lhDdhPh5-zad0oD1m2gInnlpVnDVVaIWBRzzRrnb0S7UrHdSUUoN/exec";
async function test() {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      route: "saveTask",
      payload: { sheetName: "Tarefas", item: { "Id": "1" } }
    })
  });
  console.log(await res.text());
}
test();
