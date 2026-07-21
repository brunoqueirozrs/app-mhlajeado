const fs = require('fs');
let code = fs.readFileSync('src/components/GestaoPessoasPage.tsx', 'utf8');

// 1. Add "modulos" to vendorTab state and set as default
code = code.replace(
  'useState<"dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial" | "fit_cargo" | "indices" | "clima" | "pulse" | "aval_360" | "inteligencia_emocional" | "teste_conhecimento" | "big_five">("dashboard");',
  'useState<"modulos" | "dashboard" | "disc" | "pdi" | "raiox" | "coach" | "competencias" | "perfil_comercial" | "fit_cargo" | "indices" | "clima" | "pulse" | "aval_360" | "inteligencia_emocional" | "teste_conhecimento" | "big_five">("modulos");'
);

// 2. Remove the old tabs map block (lines roughly 679 to 734)
const tabsRegex = /<div className="flex flex-wrap items-center gap-2 pb-2 sm:pb-0 print:hidden">[\s\S]*?<\/div>\n            <\/div>/;
code = code.replace(tabsRegex, '</div>');

// 3. Import icons if missing (we need some icons for the modules grid)
// Let's check existing imports: 
// import { Users, User, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar, TrendingUp, Printer } from 'lucide-react';
code = code.replace(
  'import { Users, User, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar, TrendingUp, Printer }',
  'import { Users, User, Shield, Target, Activity, Brain, CheckCircle, Clock, Save, FileText, X, MessageSquare, Plus, Edit2, Play, Circle, Radar, TrendingUp, Printer, LayoutGrid, BarChart2, Heart, GraduationCap, ArrowLeft, ClipboardList }'
);

// 4. Create the modules grid and back button
const backButton = `
              {vendorTab !== "modulos" && (
                <div className="mb-4 print:hidden">
                  <button onClick={() => setVendorTab("modulos")} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Voltar para Módulos
                  </button>
                </div>
              )}
`;

const modulosGrid = `
              {vendorTab === "modulos" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between print:hidden">
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Catálogo de Módulos</h3>
                      <p className="text-sm text-slate-500">Selecione um módulo para visualizar ou aplicar avaliações.</p>
                    </div>
                    <button onClick={() => setVendorTab("dashboard")} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                      <Printer className="w-4 h-4" /> Resumo Geral (Impressão)
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { id: "disc", nome: "DISC & Perfil Animal", icon: Target, desc: "Avaliação comportamental semestral", color: "text-indigo-600", bg: "bg-indigo-50" },
                      { id: "pdi", nome: "PDI", icon: FileText, desc: "Plano de desenvolvimento contínuo", color: "text-emerald-600", bg: "bg-emerald-50" },
                      { id: "competencias", nome: "Competências", icon: Target, desc: "Avaliação trimestral", color: "text-orange-500", bg: "bg-orange-50" },
                      { id: "perfil_comercial", nome: "Perfil Comercial", icon: TrendingUp, desc: "Análise de campo semestral", color: "text-blue-500", bg: "bg-blue-50" },
                      { id: "raiox", nome: "Raio-X (IA)", icon: Brain, desc: "Análise preditiva sob demanda", color: "text-rose-500", bg: "bg-rose-50" },
                      { id: "coach", nome: "Coach IA", icon: MessageSquare, desc: "Suporte e gestão diária", color: "text-sky-500", bg: "bg-sky-50" },
                      { id: "fit_cargo", nome: "Fit de Cargo", icon: User, desc: "Alocação automática", color: "text-teal-500", bg: "bg-teal-50" },
                      { id: "indices", nome: "Índices (Risco/Potencial)", icon: Activity, desc: "Predição mensal automática", color: "text-red-500", bg: "bg-red-50" },
                      { id: "clima", nome: "Clima Organizacional", icon: Heart, desc: "Engajamento semanal/mensal", color: "text-pink-500", bg: "bg-pink-50" },
                      { id: "pulse", nome: "Pulse Survey", icon: BarChart2, desc: "Engajamento semanal", color: "text-fuchsia-500", bg: "bg-fuchsia-50" },
                      { id: "aval_360", nome: "Avaliação 360°", icon: Users, desc: "Avaliação de liderança anual", color: "text-purple-500", bg: "bg-purple-50" },
                      { id: "inteligencia_emocional", nome: "Inteligência Emocional", icon: Brain, desc: "Comportamento anual", color: "text-violet-500", bg: "bg-violet-50" },
                      { id: "teste_conhecimento", nome: "Teste de Conhecimento", icon: GraduationCap, desc: "Capacitação pós-treinamento", color: "text-cyan-500", bg: "bg-cyan-50" },
                      { id: "big_five", nome: "Big Five (OCEAN)", icon: ClipboardList, desc: "Comportamento anual (Líderes)", color: "text-amber-500", bg: "bg-amber-50" }
                    ].map(mod => (
                      <button 
                        key={mod.id} 
                        onClick={() => setVendorTab(mod.id as any)}
                        className="flex flex-col items-start p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group"
                      >
                        <div className={\`w-10 h-10 rounded-xl flex items-center justify-center mb-4 \${mod.bg}\`}>
                          <mod.icon className={\`w-5 h-5 \${mod.color}\`} />
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{mod.nome}</h4>
                        <p className="text-xs text-slate-500">{mod.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
`;

code = code.replace(
  '{/* Conteúdo da Aba */}',
  '{/* Conteúdo da Aba */}\n' + backButton
);

code = code.replace(
  '<div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 print:overflow-visible print:pr-0">',
  '<div className="flex-1 overflow-y-auto pr-2 pb-10 space-y-6 print:overflow-visible print:pr-0">\n' + modulosGrid
);

// 5. Adjust the Resumo Geral / Dashboard page to hide back button when printing
// The back button is already 'print:hidden'.

// 6. Fix "dashboard" header to "Resumo Geral"
code = code.replace(
  '<Printer className="w-4 h-4" /> Imprimir Relatório Completo',
  '<Printer className="w-4 h-4" /> Imprimir'
);

// We need to add a title for Resumo Geral
const resumoTitle = `
                  <div className="flex justify-between items-center print:hidden mb-6">
                    <h3 className="text-xl font-black text-slate-800">Resumo Geral (Completo)</h3>
                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                      <Printer className="w-4 h-4" /> Imprimir
                    </button>
                  </div>
`;
code = code.replace(
  '<div className="flex justify-end print:hidden">\n                    <button onClick={() => window.print()} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-colors">\n                      <Printer className="w-4 h-4" /> Imprimir\n                    </button>\n                  </div>',
  resumoTitle
);

// Let's hide the vendor header inside print if needed.
// Right now it has: className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:shadow-none print:border-slate-300 print:mb-4"
// That's fine for print.

// Ensure that "setVendorTab" sets it correctly when vendor is selected from the list.
// In the sidebar, onClick for a vendor is: setSelectedVendorId(v.id)
// We might want to reset tab to "modulos" when vendor changes.
const vendorSelectRegex = /setSelectedVendorId\(v\.id\)/;
code = code.replace(vendorSelectRegex, 'setSelectedVendorId(v.id); setVendorTab("modulos");');

fs.writeFileSync('src/components/GestaoPessoasPage.tsx', code);
console.log("Refactored modulos");
