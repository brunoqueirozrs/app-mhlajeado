const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /"openrouter\/free",\s*"google\/gemma-4-31b-it:free",\s*"meta-llama\/llama-3.3-70b-instruct:free",\s*"google\/gemma-4-26b-a4b-it:free"/,
  '"openrouter/auto", "google/gemma-2-9b-it:free", "mistralai/mistral-7b-instruct:free", "meta-llama/llama-3-8b-instruct:free"'
);

fs.writeFileSync('server.ts', code);
