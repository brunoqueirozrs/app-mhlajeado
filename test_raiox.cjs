const http = require('http');

const data = JSON.stringify({
  colaborador: { nome: "João", funcao: "Vendedor" },
  resultados: { disc: { D: 40, I: 20, S: 20, C: 20 }, perfilComercial: {}, avaliacoes: {} }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ai/raiox',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => {
    body += chunk;
  });
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Body:", body);
  });
});

req.write(data);
req.end();
