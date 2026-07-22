const fs = require('fs');
let content = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

const clima_impl = `  const renderClima = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Clima Organizacional
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center text-center p-6 bg-slate-50 border border-slate-200 rounded-xl mb-6">
            <span className="text-4xl font-black text-slate-800 mb-2">82 / 100</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">eNPS (Net Promoter Score Interno)</span>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800">Dimensões do Clima</h4>
            
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Comunicação</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Reconhecimento</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Relacionamento com Gestor</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '90%' }}></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="w-1/3 text-sm font-bold text-slate-700 text-right">Ferramentas de Trabalho</span>
              <div className="w-2/3 bg-slate-100 rounded-full h-2.5">
                <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };`;

const teste_conhecimento_impl = `  const renderTesteConhecimento = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-sky-500" />
            Teste de Conhecimento (Capacitação)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Planos e Serviços</span>
                  <span className="font-black text-sky-600">95%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Técnicas de Vendas PAP</span>
                  <span className="font-black text-sky-600">80%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-sky-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">Sistemas (App/CRM)</span>
                  <span className="font-black text-rose-600">60%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="bg-sky-50 p-6 rounded-xl border border-sky-100 flex flex-col justify-center">
              <h4 className="font-bold text-sky-900 mb-2">Plano de Treinamento</h4>
              <p className="text-sm text-sky-800 mb-4">
                O colaborador apresenta domínio excepcional no portfólio de planos, mas necessita de reciclagem no uso do aplicativo de vendas.
              </p>
              <button className="self-start px-4 py-2 bg-sky-600 text-white font-bold rounded-lg text-sm shadow-sm hover:bg-sky-700">
                Agendar Reciclagem CRM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };`;

const ocean_impl = `  const renderBigFive = () => {
    const oceanData = [
      { name: "Abertura à Experiência", value: 75, color: "#3b82f6" },
      { name: "Conscienciosidade", value: 85, color: "#10b981" },
      { name: "Extroversão", value: 90, color: "#f59e0b" },
      { name: "Amabilidade", value: 65, color: "#8b5cf6" },
      { name: "Neuroticismo", value: 30, color: "#ef4444" },
    ];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Big Five (OCEAN)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              {oceanData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="h-2.5 rounded-full" style={{ width: item.value + "%", backgroundColor: item.color }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-3">Análise de Personalidade</h4>
              <p className="text-sm text-indigo-800">
                Perfil altamente <strong>Extrovertido e Consciencioso</strong>, com baixo índice de Neuroticismo (alta estabilidade emocional). Excelente alinhamento para trabalho externo sob pressão (PAP). O nível mediano de Amabilidade o torna um bom negociador, não cedendo facilmente em descontos.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };`;

content = content.replace(/const renderClima = \(\) => renderPlaceholder\("Clima Organizacional"[^;]+;/g, clima_impl);
content = content.replace(/const renderTesteConhecimento = \(\) => renderPlaceholder\("Teste de Conhecimento"[^;]+;/g, teste_conhecimento_impl);
content = content.replace(/const renderBigFive = \(\) => renderPlaceholder\("Big Five \(OCEAN\)"[^;]+;/g, ocean_impl);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', content);
