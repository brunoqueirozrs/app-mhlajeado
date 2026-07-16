const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routeStr = `app.post("/api/ai/diagnostico-cobranca", async (req, res) => {
  const { stats } = req.body;
  if (!stats) return res.status(400).json({ error: "No stats provided." });

  try {
    const prompt = \`Atue como um Especialista de Recuperação de Crédito e Retenção de Telecom (ISP). Analise os seguintes dados do painel de cobranças:
- Total Devedores: \${stats.totalDevedores}
- Média Dias Atraso: \${stats.mediaDiasAtraso}
- % Baixaram App: \${stats.baixouAppPercent}%
- Taxa Contato Efetivo: \${stats.taxaContatoEfetivo}%
- Top Bairros: \${stats.bairrosCriticos.join(', ')}
- Top Planos: \${stats.planosCriticos.join(', ')}

Com base nisso, escreva um diagnóstico gerencial de no MÁXIMO 3 parágrafos contendo:
1. Um raio-x rápido da situação (pontos críticos).
2. O que o percentual de download do app ou o contato efetivo indica sobre o comportamento dos devedores.
3. 2 recomendações acionáveis e práticas para a equipe de cobrança atacar nas próximas 48 horas e reduzir o saldo devedor.

Seja direto, profissional e focado em resultados. Não use saudações, vá direto ao ponto.\`;

    const response = await safeGenerateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um gestor financeiro sênior especializado em ISP local.",
      },
    });

    const reply = response.text || "Não foi possível gerar o diagnóstico.";
    res.json({ diagnostic: reply });
  } catch(e) {
    console.error("AI Error:", e);
    res.status(500).json({ error: "AI Error" });
  }
});`;

// Remove the old one at the end
const oldIdx = code.indexOf('app.post("/api/ai/diagnostico-cobranca"');
if (oldIdx !== -1) {
  code = code.substring(0, oldIdx);
}

// Insert before startServer()
const startIdx = code.indexOf('const startServer = async () => {');
if (startIdx !== -1) {
  code = code.slice(0, startIdx) + routeStr + '\n\n' + code.slice(startIdx);
}

fs.writeFileSync('server.ts', code, 'utf8');
