const fs = require('fs');

let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const target = `  const OptionBtn = ({ val, current, onClick }: any) => (
    
          </div>`;

const restored = `  const OptionBtn = ({ val, current, onClick }: any) => (
    <button 
      onClick={onClick}
      className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border \${current === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}\`}
    >
      {val}
    </button>
  );

  return (
    <div className="space-y-6 font-sans pb-20">
      {!selectedClient && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <UserCheck className="w-7 h-7 text-sky-600" /> Pós-Vendas
              </h1>
              <p className="text-slate-500 text-sm mt-1">Módulo de Retenção & Checklists de Instalação</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-600 shadow-sm min-w-[200px]"
                value={vendedoraFilter}
                onChange={(e) => setVendedoraFilter(e.target.value)}
              >
                <option value="Todas">Todas Vendedoras</option>
                {uniqueVendedoras.map((v: any) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>

              <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none font-bold text-slate-600 shadow-sm min-w-[200px]"
                value={selectedMes}
                onChange={(e) => setSelectedMes(e.target.value)}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
            <button 
              onClick={() => setActiveTab("pendentes")}
              className={\`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors \${activeTab === 'pendentes' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}\`}
            >
              Fila de Pós-Venda
            </button>
            <button 
              onClick={() => setActiveTab("base_ativa")}
              className={\`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors \${activeTab === 'base_ativa' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}\`}
            >
              Base Ativa
            </button>
            <button 
              onClick={() => setActiveTab("financeiro")}
              className={\`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors \${activeTab === 'financeiro' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}\`}
            >
              Financeiro (3 Meses)
            </button>
          </div>
`;

code = code.replace(target, restored);
fs.writeFileSync('src/components/PosVendaPage.tsx', code, 'utf8');
