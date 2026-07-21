const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const radarCode = `
                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-6">
                          <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col items-center">
                            <h5 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Radar Comportamental</h5>
                            <div className="w-full h-48">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                  { subject: 'Dominância (D)', value: vendorDisc.d },
                                  { subject: 'Influência (I)', value: vendorDisc.i },
                                  { subject: 'Estabilidade (S)', value: vendorDisc.s },
                                  { subject: 'Conformidade (C)', value: vendorDisc.c },
                                ]}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <RechartsRadar name="Perfil" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          
                          <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                                <Brain className="w-4 h-4 text-indigo-500" />
                                Análise do Agente IA
                              </h5>
                              <button
                                onClick={generateDiscAnalysis}
                                disabled={isGeneratingDiscAnalysis}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors print:hidden"
                              >
                                {isGeneratingDiscAnalysis ? "Analisando..." : "Gerar/Atualizar Parecer"}
                              </button>
                            </div>
                            
                            {discAnalysisResult ? (
                              <div className="prose prose-sm prose-slate max-w-none prose-headings:font-bold prose-h2:text-indigo-900 prose-h2:text-sm prose-h2:mt-4 prose-h2:mb-2 prose-h2:uppercase prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900">
                                <Markdown>{discAnalysisResult}</Markdown>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 text-slate-400">
                                <Brain className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">Clique em Gerar Parecer para a IA analisar este perfil.</p>
                              </div>
                            )}
                          </div>
                        </div>
`;

code = code.replace(
  '                        </div>\n                      ) : (',
  '                        </div>\n' + radarCode + '\n                      ) : ('
);

// Add states
if (!code.includes('isGeneratingDiscAnalysis')) {
  code = code.replace(
    'const [isGeneratingRaiox, setIsGeneratingRaiox] = useState(false);',
    'const [isGeneratingRaiox, setIsGeneratingRaiox] = useState(false);\n  const [isGeneratingDiscAnalysis, setIsGeneratingDiscAnalysis] = useState(false);\n  const [discAnalysisResult, setDiscAnalysisResult] = useState<string>("");'
  );
}

// Add generateDiscAnalysis function
const generateDiscFn = `
  const generateDiscAnalysis = async () => {
    setIsGeneratingDiscAnalysis(true);
    try {
      const dataPayload = {
        colaborador: selectedVendor,
        disc: vendorDisc
      };
      
      const response = await fetch("/api/ai/raiox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dataPayload })
      });
      
      const json = await response.json();
      if (json.analysis) {
        setDiscAnalysisResult(json.analysis);
      }
    } catch (e) {
      console.error("Erro ao gerar análise do DISC", e);
    } finally {
      setIsGeneratingDiscAnalysis(false);
    }
  };
`;

code = code.replace(
  'const generateRaioX = async () => {',
  generateDiscFn + '\n  const generateRaioX = async () => {'
);

// Ensure RechartsRadar is imported correctly. It should be if the import exists.

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Updated DISC view");
