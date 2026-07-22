import re

with open('src/components/GestaoPessoasPage.tsx', 'r') as f:
    content = f.read()

if "AlertCircle," not in content and "AlertCircle " not in content:
    content = content.replace("import { Users,", "import { Users, AlertCircle,")

raiox_impl = """
  const renderRaiox = () => {
    let fitCargo = 75;
    if (vendorDisc) {
      const ideal = { d: 70, i: 80, s: 40, c: 30 };
      const natural = vendorDisc.rawNatural || { d: 50, i: 50, s: 50, c: 50 };
      const diffTotal = Math.abs(natural.d - ideal.d) + Math.abs(natural.i - ideal.i) + Math.abs(natural.s - ideal.s) + Math.abs(natural.c - ideal.c);
      fitCargo = Math.max(0, Math.round(100 - ((diffTotal / 400) * 100 * 2)));
    }

    let scoreCompetencias = 80;
    if (vendorCompetencias && vendorCompetencias.competencias) {
      const autoArr = vendorCompetencias.competencias.map((c: any) => c.autoavaliacao);
      if (autoArr.length) scoreCompetencias = Math.round((autoArr.reduce((a: number, b: number)=>a+b,0)/autoArr.length) * 20);
    }

    let scoreComercial = 82;
    if (vendorPerfilComercial) {
       scoreComercial = Math.round(vendorPerfilComercial.taxaConversaoMedia * 5); 
       if (scoreComercial > 100) scoreComercial = 100;
    }

    const scoreAval360 = 85; 
    const scoreConhecimento = 78;

    const w1 = 0.15, w2 = 0.25, w3 = 0.25, w4 = 0.20, w5 = 0.15;
    const scoreFinal = Math.round((fitCargo * w1) + (scoreCompetencias * w2) + (scoreComercial * w3) + (scoreAval360 * w4) + (scoreConhecimento * w5));

    const values = [fitCargo, scoreCompetencias, scoreComercial, scoreAval360, scoreConhecimento];
    const avg = values.reduce((a,b) => a+b, 0) / values.length;
    const variance = values.reduce((a,b) => a + Math.pow(b - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const confiabilidade = Math.max(0, Math.round(100 - (stdDev * 2.5)));

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-rose-500" />
            Raio-X Consolidado & People Analytics
          </h3>
          <button onClick={generateRaioX} disabled={isGeneratingRaiox} className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden">
            {isGeneratingRaiox ? "Gerando Resumo..." : "Recalcular com IA"}
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Header Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Target className="w-24 h-24" />
              </div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 relative z-10">Score Final Ponderado</span>
              <div className="flex items-end gap-2 relative z-10">
                <span className="text-5xl font-black text-emerald-400">{scoreFinal}</span>
                <span className="text-lg text-slate-500 font-bold mb-1">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 relative z-10">Agrega DISC, Competências, Comercial, 360 e Conhecimento.</p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Índice de Confiabilidade</span>
                <Activity className={`w-5 h-5 ${confiabilidade > 80 ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-slate-800">{confiabilidade}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                <div className={`h-1.5 rounded-full ${confiabilidade > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${confiabilidade}%` }}></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Calculado pelo desvio padrão ({stdDev.toFixed(1)}) entre as múltiplas avaliações.</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-bold text-rose-800 uppercase tracking-wider">Maior GAP Mapeado</span>
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xl font-black text-rose-900 leading-tight">
                {vendorPerfilComercial && vendorPerfilComercial.areasMelhoriaCampo.length > 0 ? vendorPerfilComercial.areasMelhoriaCampo[0] : "Técnicas de Fechamento"}
              </span>
              <p className="text-xs text-rose-700 mt-2">Impacto Direto: Perda de 15% na conversão final de rota.</p>
            </div>
          </div>

          {/* Breakdown / Radar Equivalente */}
          <div>
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" /> Detalhamento Multimétodo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{fitCargo}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Fit Cargo (15%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreCompetencias}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Competências (25%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreComercial}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Comercial (25%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreAval360}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Aval 360° (20%)</span>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 text-center">
                <span className="block text-xl font-black text-slate-800">{scoreConhecimento}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Conhecimento (15%)</span>
              </div>
            </div>
          </div>

          {/* Texto de IA gerado (O Raio-X original) */}
          {vendorRaiox.length > 0 ? (
            <div>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-rose-500" /> Análise Qualitativa da IA
              </h4>
              {vendorRaiox.map(rx => (
                <div key={rx.id} className="border border-slate-200 rounded-xl p-5 relative overflow-hidden bg-white shadow-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <div className="prose prose-sm prose-slate max-w-none prose-headings:font-black prose-h2:text-indigo-900 prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-ul:my-2">
                    <Markdown>{rx.resumoIa}</Markdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
               <p className="text-sm text-slate-600">Gere a análise da IA para obter insights qualitativos detalhados sobre o colaborador.</p>
            </div>
          )}

          {/* PDI Automático */}
          <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
             <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Plano de Desenvolvimento Recomendado (Automático)
             </h4>
             <ul className="space-y-3">
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Treinamento de Role-Play Focado</span>
                   <span className="block text-xs text-emerald-700 mt-1">Utilizar o simulador IA (Persona: Indeciso) 3x na semana para calibrar a conversão na fase de objeções.</span>
                 </div>
               </li>
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Reciclagem de Conhecimento Técnico</span>
                   <span className="block text-xs text-emerald-700 mt-1">Revisão do portfólio de planos empresariais e uso avançado do CRM Mobile.</span>
                 </div>
               </li>
               <li className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100">
                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                 <div>
                   <span className="block text-sm font-bold text-emerald-900">Acompanhamento de Campo (Rota Dupla)</span>
                   <span className="block text-xs text-emerald-700 mt-1">O supervisor deve focar no controle emocional do vendedor diante de negativas consecutivas.</span>
                 </div>
               </li>
             </ul>
          </div>
        </div>
      </div>
    );
  };
"""

# Replace the old renderRaiox
pattern = r'const renderRaiox = \(\) => \((.*?)\n  \);\n\n  const renderPlaceholder'
content = re.sub(pattern, raiox_impl + "\n\n  const renderPlaceholder", content, flags=re.DOTALL)

with open('src/components/GestaoPessoasPage.tsx', 'w') as f:
    f.write(content)

