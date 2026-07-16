const names = [
  "(AD) - Internet Fibra 500 Mb WIFI + Skeelo",
  "Internet 1 Gbps Fibra",
  "MHNET Fibra 300Mbps",
  "Unknown plan"
];

names.forEach(name => {
  const match = name.match(/(\d+\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
  if (match) {
    console.log(name, "->", match[1]);
  } else {
    console.log(name, "-> unchanged");
  }
});
