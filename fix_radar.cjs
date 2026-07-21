const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// Update imports
code = code.replace(
  "import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';",
  "import { Radar as RechartsRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';"
);

// Update DISC radar chart
const oldDiscRadar = `<RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                  { subject: 'Dominância (D)', value: vendorDisc.d },
                                  { subject: 'Influência (I)', value: vendorDisc.i },
                                  { subject: 'Estabilidade (S)', value: vendorDisc.s },
                                  { subject: 'Conformidade (C)', value: vendorDisc.c },
                                ]}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <RechartsRadar name="Perfil" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                </RadarChart>`;

const newDiscRadar = `<RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                  { subject: 'Dominância (D)', value: vendorDisc.d, baseline: 50 },
                                  { subject: 'Influência (I)', value: vendorDisc.i, baseline: 50 },
                                  { subject: 'Estabilidade (S)', value: vendorDisc.s, baseline: 50 },
                                  { subject: 'Conformidade (C)', value: vendorDisc.c, baseline: 50 },
                                ]}>
                                  <PolarGrid />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                  <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                  <RechartsRadar name="Baseline (Ideal)" dataKey="baseline" stroke="#94a3b8" fill="none" strokeDasharray="3 3" />
                                  <RechartsRadar name="Perfil" dataKey="value" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.4} />
                                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                                </RadarChart>`;

code = code.replace(oldDiscRadar, newDiscRadar);

// Update Competencias radar chart
const oldCompRadar = `<RadarChart cx="50%" cy="50%" outerRadius="80%" data={vendorCompetencias.competencias}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nome" tick={{fill: '#475569', fontSize: 11, fontWeight: 'bold'}} />
                                <RechartsRadar name="Autoavaliação" dataKey="autoavaliacao" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <RechartsRadar name="IA" dataKey="ia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                              </RadarChart>`;

const newCompRadar = `<RadarChart cx="50%" cy="50%" outerRadius="80%" data={vendorCompetencias.competencias}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="nome" tick={{fill: '#475569', fontSize: 11, fontWeight: 'bold'}} />
                                <Tooltip wrapperClassName="text-xs rounded-xl shadow-lg border-slate-200" contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'}} />
                                <RechartsRadar name="Autoavaliação" dataKey="autoavaliacao" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <RechartsRadar name="Gestor" dataKey="gestor" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                                <RechartsRadar name="IA" dataKey="ia" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                              </RadarChart>`;

code = code.replace(oldCompRadar, newCompRadar);

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Updated radar charts");
