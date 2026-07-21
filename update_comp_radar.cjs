const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Add baseline to mock data
code = code.replace(
  '          { nome: "Comunicação", autoavaliacao: 5, gestor: 4, ia: 4 },',
  '          { nome: "Comunicação", autoavaliacao: 5, gestor: 4, ia: 4, baseline: 4 },'
);
code = code.replace(
  '          { nome: "Resiliência", autoavaliacao: 4, gestor: 3, ia: 3 },',
  '          { nome: "Resiliência", autoavaliacao: 4, gestor: 3, ia: 3, baseline: 4 },'
);
code = code.replace(
  '          { nome: "Fechamento", autoavaliacao: 3, gestor: 2, ia: 2 },',
  '          { nome: "Fechamento", autoavaliacao: 3, gestor: 2, ia: 2, baseline: 4 },'
);
code = code.replace(
  '          { nome: "Organização", autoavaliacao: 4, gestor: 4, ia: 5 },',
  '          { nome: "Organização", autoavaliacao: 4, gestor: 4, ia: 5, baseline: 4 },'
);
code = code.replace(
  '          { nome: "Prospecção", autoavaliacao: 5, gestor: 5, ia: 4 },',
  '          { nome: "Prospecção", autoavaliacao: 5, gestor: 5, ia: 4, baseline: 4 },'
);

// Update Competencias radar to include baseline and legend
const oldRadar = `<RadarChart cx="50%" cy="50%" outerRadius="80%" data={vendorCompetencias.competencias}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nome" tick={{fill: '#475569', fontSize: 11, fontWeight: 'bold'}} />
                                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                <RechartsRadar name="Autoavaliação" dataKey="autoavaliacao" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <RechartsRadar name="IA" dataKey="ia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                              </RadarChart>`;

const newRadar = `<RadarChart cx="50%" cy="50%" outerRadius="75%" data={vendorCompetencias.competencias}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nome" tick={{fill: '#475569', fontSize: 10, fontWeight: 'bold'}} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                <RechartsRadar name="Baseline (Ideal)" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="3 3" />
                                <RechartsRadar name="Autoavaliação" dataKey="autoavaliacao" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <RechartsRadar name="IA" dataKey="ia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                              </RadarChart>`;

code = code.replace(oldRadar, newRadar);

// Also add a baseline legend item to the manual list below it
const oldList = `<div className="space-y-4">
                            <div className="flex items-center gap-3">`;

const newList = `<div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full border-2 border-slate-400 border-dashed"></div>
                              <span className="text-sm font-bold text-slate-700">Baseline (Meta/Ideal)</span>
                            </div>
                            <div className="flex items-center gap-3">`;

code = code.replace(oldList, newList);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Updated comp radar");
