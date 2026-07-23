const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    // Popula mocks iniciais se vazio
    if (vendors.length > 0 && discResults.length === 0) {
      setDiscResults(vendors.map((v, i) => ({
        id: \`disc_\${i}\`, vendorId: v.id, data: new Date().toISOString(),
        d: 20 + (i * 5) % 80, i: 30 + (i * 7) % 70, s: 15 + (i * 3) % 85, c: 25 + (i * 11) % 75, perfilPrimario: "I", perfilSecundario: "D", perfilAnimal: "Águia"
      })));
      setPdis(vendors.map((v, i) => ({
        id: \`pdi_\${i}\`, vendorId: v.id, competencia: "Fechamento de Vendas",
        situacaoAtual: 3, meta: "Chegar na taxa de conversão de 15%", acaoCombinada: "Role-play 1x por semana com o coordenador",
        prazo: "2024-12-31", status: "em_andamento", dataCriacao: new Date().toISOString(), dataAtualizacao: new Date().toISOString()
      })));
      setCompetencias([]);
      setPerfilComerciais(vendors.map((v, i) => ({
        id: \`pc_\${i}\`, vendorId: v.id, data: new Date().toISOString(),
        gargaloPrincipal: "Conversão na etapa de Quebra de Objeções",
        taxaConversaoMedia: 8.5,
        ticketMedio: 120,
        pontosFortesCampo: ["Abertura carismática", "Conhecimento técnico do plano"],
        areasMelhoriaCampo: ["Contorno de objeção sobre preço", "Urgência de fechamento"]
      })));
    }
  }, [vendors]);`;

code = code.replace(targetStr, '');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
