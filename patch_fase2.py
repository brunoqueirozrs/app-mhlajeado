import re

with open('src/components/GestaoPessoasPage.tsx', 'r') as f:
    content = f.read()

indices_impl = """
  const renderIndices = () => {
    // Fake prediction data
    const turnoverRisk = 15; // 15%
    const highPotential = 85; // 85%
    
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            Índices Preditivos (Risco & Potencial)
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Turnover Risk */}
            <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 flex flex-col items-center text-center">
              <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-2">Risco de Turnover</h4>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-rose-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-rose-500"
                    strokeDasharray={`${turnoverRisk}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-rose-700">{turnoverRisk}%</span>
                </div>
              </div>
              <p className="text-xs text-rose-600 mt-4 font-medium">Baixo risco de saída nos próximos 6 meses.</p>
            </div>

            {/* High Potential */}
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center">
              <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2">Potencial de Liderança</h4>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-emerald-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${highPotential}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-black text-emerald-700">{highPotential}%</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 mt-4 font-medium">Alto potencial para assumir supervisão.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };
"""

aval360_impl = """
  const renderAval360 = () => {
    const data = [
      { name: "Comunicação", auto: 4.5, pares: 4.2, liderados: 4.8, gestor: 4.0 },
      { name: "Liderança", auto: 4.0, pares: 3.8, liderados: 4.5, gestor: 3.5 },
      { name: "Foco em Resultados", auto: 5.0, pares: 4.5, liderados: 4.2, gestor: 4.8 },
      { name: "Trabalho em Equipe", auto: 4.2, pares: 4.6, liderados: 4.4, gestor: 4.5 },
      { name: "Inteligência Emocional", auto: 3.8, pares: 3.5, liderados: 4.0, gestor: 3.2 },
    ];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Avaliação 360°
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0'}} />
                <RechartsRadar name="Autoavaliação" dataKey="auto" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <RechartsRadar name="Pares" dataKey="pares" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                <RechartsRadar name="Liderados" dataKey="liderados" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 mb-2">Resumo da Avaliação</h4>
            <p className="text-sm text-slate-600">
              O colaborador possui uma percepção de si mesmo muito alinhada com a equipe em <strong>Foco em Resultados</strong>, porém há um gap de percepção na área de <strong>Inteligência Emocional</strong>, onde o gestor e pares avaliaram com notas mais baixas.
            </p>
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h5 className="text-xs font-bold text-indigo-800 uppercase mb-2">Plano de Ação Recomendado</h5>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  Realizar treinamento de feedback não-violento.
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  Mentoria quinzenal focada em gestão de conflitos.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };
"""

pulse_impl = """
  const renderPulse = () => {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col print:break-inside-avoid print:shadow-none print:border-slate-300">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Pulse Survey (Termômetro de Engajamento)
          </h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-6 w-full">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Satisfação com o Clima</span>
                  <span className="text-sm font-bold text-slate-900">8.5/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Alinhamento com a Liderança</span>
                  <span className="text-sm font-bold text-slate-900">7.2/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-bold text-slate-700">Carga de Trabalho</span>
                  <span className="text-sm font-bold text-slate-900">6.0/10</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 bg-rose-50 p-5 rounded-xl border border-rose-100">
               <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center gap-2">
                 <Activity className="w-4 h-4" /> Alerta de Carga
               </h4>
               <p className="text-sm text-rose-700">
                 O indicador de <strong>Carga de Trabalho</strong> caiu 15% nas últimas 2 semanas. Sugere-se uma conversa 1:1 para priorização de demandas de campo.
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
"""

content = re.sub(r'const renderIndices = \(\) => renderPlaceholder\("Índices Preditivos[^;]+;', indices_impl, content)
content = re.sub(r'const renderAval360 = \(\) => renderPlaceholder\("Avaliação 360°"[^;]+;', aval360_impl, content)
content = re.sub(r'const renderPulse = \(\) => renderPlaceholder\("Pulse Survey"[^;]+;', pulse_impl, content)

with open('src/components/GestaoPessoasPage.tsx', 'w') as f:
    f.write(content)

