import re

with open('src/components/GestaoPessoasPage.tsx', 'r') as f:
    content = f.read()

inteligencia_impl = """
  const renderInteligenciaEmocional = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Brain className="w-4 h-4 text-violet-500" />
            Inteligência Emocional
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Autoconhecimento</span>
              <span className="text-2xl font-black text-slate-800">82%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Autocontrole</span>
              <span className="text-2xl font-black text-slate-800">75%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Automotivação</span>
              <span className="text-2xl font-black text-slate-800">90%</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Empatia</span>
              <span className="text-2xl font-black text-slate-800">68%</span>
            </div>
          </div>
          <p className="text-sm text-slate-600 bg-violet-50 p-4 rounded-lg border border-violet-100 text-violet-800">
            <strong>Resumo:</strong> O colaborador apresenta excelente nível de automotivação, lidando bem com metas desafiadoras. O ponto de desenvolvimento encontra-se na <strong>Empatia</strong>, podendo gerar atritos em interações com clientes mais sensíveis.
          </p>
        </div>
      </div>
    );
  };
"""

content = re.sub(r'const renderInteligenciaEmocional = \(\) => renderPlaceholder\("Inteligência Emocional"[^;]+;', inteligencia_impl, content)

with open('src/components/GestaoPessoasPage.tsx', 'w') as f:
    f.write(content)

