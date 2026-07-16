import fetch from 'node-fetch';
async function run() {
  const apiKey = "ebd22083715266fc0cf88a2053f31cb8";
  const city = "Lajeado,br";
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=pt_br&appid=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data.list.slice(0, 16).map(l => l.dt_txt));
}
run();
