import re

with open('server.ts', 'r') as f:
    content = f.read()

roleplay_routes = """
app.post("/api/ai/roleplay/chat", async (req, res) => {
  const { messages, persona } = req.body;
  if (!messages || !persona) return res.status(400).json({ error: "Missing parameters" });

  const personaContexts = {
    "indeciso": "Você é um cliente de internet residencial que está interessado, mas é muito indeciso e inseguro. Sempre faz perguntas sobre garantia, se vai ficar caindo, se o preço não vai aumentar. Você não diz não logo de cara, mas dá voltas.",
    "irritado": "Você é um cliente que já teve problemas com provedores anteriores. Você é grosso, direto e impaciente. Reclama de instabilidade e do tempo de espera para instalação. Responda com desconfiança e irritação.",
    "porta_fechada": "Você é um cliente que acabou de abrir a porta e não tem tempo. Você corta o vendedor logo na primeira frase dizendo que já tem internet boa e que não quer mudar de jeito nenhum. Tente encerrar a conversa rapidamente."
  };

  const systemContext = personaContexts[persona as keyof typeof personaContexts] || "Você é um cliente avaliando a compra de internet.";

  try {
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await safeGenerateContent({
      model: "gemini-2.5-flash",
      contents: formattedMessages,
      config: {
        systemInstruction: `Atue como cliente no roleplay. Responda de forma curta (máx 3 frases), natural, como alguém falando no portão de casa. \n\nPersonagem: ${systemContext}`,
      },
    });

    res.json({ reply: response.text || "..." });
  } catch(e) {
    console.error("AI Roleplay Chat Error:", e);
    res.json({ reply: "Desculpe, não consigo falar agora. (Simulação indisponível)" });
  }
});

app.post("/api/ai/roleplay/evaluate", async (req, res) => {
  const { messages, persona } = req.body;
  
  if (!messages) return res.status(400).json({ error: "Missing messages" });

  try {
    const prompt = `Analise a seguinte transcrição de um roleplay de vendas de internet fibra óptica (PAP - Porta a Porta). O vendedor interagiu com um cliente do tipo "${persona}".
    
    Transcrição:
    ${messages.map((m: any) => `${m.role === 'user' ? 'VENDEDOR' : 'CLIENTE'}: ${m.content}`).join('\\n')}
    
    Você deve avaliar a performance do vendedor utilizando a seguinte matriz de rubrica:
    - Quebra-gelo e Abordagem Inicial (0 a 20 pontos)
    - Sondagem e Escuta Ativa (0 a 20 pontos)
    - Apresentação de Valor / Contorno de Objeções (0 a 30 pontos)
    - Tentativa de Fechamento (0 a 30 pontos)
    
    Responda ESTRITAMENTE num formato JSON válido com as seguintes chaves:
    {
      "score": <número total de 0 a 100>,
      "criteriaScores": {
        "abordagem": <0-20>,
        "sondagem": <0-20>,
        "contornoObjeccoes": <0-30>,
        "fechamento": <0-30>
      },
      "feedbackAnalitico": "Texto com o raciocínio detalhado, elogiando os acertos e apontando onde o vendedor falhou, especialmente em relação ao tipo de cliente.",
      "recomendacao": "Uma dica de ouro acionável para a próxima vez."
    }
    `;

    const response = await safeGenerateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um treinador sênior de vendas PAP (Porta a Porta). Avalie com rigor e precisão, focado na conversão e nas técnicas de vendas.",
        responseMimeType: "application/json"
      },
    });

    const reply = response.text || "{}";
    res.json(JSON.parse(reply));
  } catch(e) {
    console.error("AI Roleplay Evaluate Error:", e);
    res.status(500).json({ error: "Erro na avaliação" });
  }
});

// Catch-all for undefined /api/*
"""

content = content.replace("// Catch-all for undefined /api/*", roleplay_routes)

with open('server.ts', 'w') as f:
    f.write(content)

