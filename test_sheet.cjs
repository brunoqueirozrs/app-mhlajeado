fetch("https://docs.google.com/spreadsheets/d/19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w/gviz/tq?tqx=out:csv&headers=1&sheet=Vendedores")
  .then(r => r.text())
  .then(console.log);
