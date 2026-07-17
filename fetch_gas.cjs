async function test() {
    const url = "https://docs.google.com/spreadsheets/d/19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w/gviz/tq?tqx=out:csv&headers=1&sheet=" + encodeURIComponent("Agenda Instalação") + "&_rnd=" + Date.now();
    const res = await fetch(url);
    const text = await res.text();
    console.log(text.substring(0, 1000));
    console.log("----");
    // print last 10 lines
    const lines = text.split("\n");
    console.log(lines.slice(-10).join("\n"));
}
test();
