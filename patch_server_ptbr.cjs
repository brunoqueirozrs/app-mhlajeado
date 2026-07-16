const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const ptbrRule = " RESPONDA SEMPRE E EXCLUSIVAMENTE EM PORTUGUÊS DO BRASIL (pt-BR). NEVER USE ENGLISH.";

// Add to generateCobrancaMessage
code = code.replace(
  '-- Máximo de 7 linhas.`;',
  '-- Máximo de 7 linhas.\n\nIMPORTANTE:' + ptbrRule + '`;'
);

// Add to MHNET_CONTEXT for other prompts
if (code.includes('const MHNET_CONTEXT = `Você é um assistente especialista')) {
  code = code.replace(
    'const MHNET_CONTEXT = `Você é um assistente especialista',
    'const MHNET_CONTEXT = `IMPORTANTE: ' + ptbrRule + '\nVocê é um assistente especialista'
  );
} else {
  // Try to append it to safeGenerateContent wrapper if possible, or MHNET_CONTEXT if it exists differently
  code = code.replace(
    /const MHNET_CONTEXT = `[\s\S]*?`;/,
    (match) => {
      return match.slice(0, -2) + '\n\nIMPORTANTE:' + ptbrRule + '`;';
    }
  );
}

// Add to suggestBasePlanos
code = code.replace(
  '4. Mantenha no máximo 4 linhas, com emojis e bem amigável.`;',
  '4. Mantenha no máximo 4 linhas, com emojis e bem amigável.\nIMPORTANTE:' + ptbrRule + '`;'
);

// Add to PlanosPitch
code = code.replace(
  '5. Call to action para fechamento.`;',
  '5. Call to action para fechamento.\nIMPORTANTE:' + ptbrRule + '`;'
);

fs.writeFileSync('server.ts', code, 'utf8');
