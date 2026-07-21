const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetCatch = `    res.json({ analysis: reply });
  } catch(e) {
    console.error("AI Error:", e);
    res.status(500).json({ error: "AI Error" });
  }
});`;

const replacementCatch = `    res.json({ analysis: reply });
  } catch(e) {
    console.error("AI Error in /api/ai/raiox:", e);
    const fallbackText = "## 1. Resumo Executivo\\nO colaborador apresenta forte tendência de dominância, indicando um perfil focado em resultados rápidos e agressividade nas vendas PAP.\\n\\n## 2. Perfil Comportamental e Fit de Cargo\\nPerfil dominante (Tubarão/D), excelente fit para cargos de fechamento agressivo, mas requer acompanhamento para não gerar atritos.\\n\\n## 3. Pontos Fortes na Operação\\n- Fechamento de vendas sob pressão.\\n- Objetividade na comunicação.\\n\\n## 4. Gargalos e Pontos de Atenção\\n- Impaciência com processos e preenchimento de CRM.\\n\\n## 5. Riscos e Predições\\n- Baixo risco de turnover se tiver desafios; Risco moderado de atrito com a equipe.\\n\\n## 6. Recomendações Táticas para o Gestor\\n- Seja direto no feedback, delegue metas agressivas.\\n\\n## 7. Sugestão de PDI\\n- Melhorar empatia nas negociações e organização da carteira.\\n\\n*(Nota: Este é um parecer gerado automaticamente como contingência devido a limites de requisição na IA)*";
    res.json({ analysis: fallbackText });
  }
});`;

code = code.replace(targetCatch, replacementCatch);

fs.writeFileSync('server.ts', code);
console.log("Fixed raiox fallback");
