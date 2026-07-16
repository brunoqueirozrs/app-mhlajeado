const fs = require('fs');

let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

// 1. Update state type
code = code.replace(
  'const [activeTab, setActiveTab] = useState<"pendentes" | "base_ativa" | "n8n">("pendentes");',
  'const [activeTab, setActiveTab] = useState<"pendentes" | "base_ativa" | "financeiro" | "n8n">("pendentes");'
);

// 2. Add Tab Button
const tabButton = `
            <button 
              onClick={() => setActiveTab("financeiro")}
              className={\`px-4 py-2 text-sm font-bold rounded-xl whitespace-nowrap transition-colors \${activeTab === 'financeiro' ? 'bg-sky-600 text-white' : 'text-slate-500 hover:bg-slate-100'}\`}
            >
              Financeiro (3 Meses)
            </button>
`;
code = code.replace(
  '<button \n              onClick={() => setActiveTab("n8n")}',
  tabButton + '<button \n              onClick={() => setActiveTab("n8n")}'
);

// 3. Add Tab Content
const financeTab = `
      {activeTab === "financeiro" && !selectedClient && (
        <div className="space-y-6">
          <div className="card-modern rounded-3xl p-6 border border-slate-200 shadow-sm bg-white overflow-hidden">
            <h2 className="text-xl font-black text-slate-800 mb-6">Acompanhamento Financeiro (Primeiros 3 Meses)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">1º Mês</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">2º Mês</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">3º Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 text-sm">{c.nome}</div>
                        <div className="text-[10px] text-slate-500 font-medium">{c.plano}</div>
                      </td>
                      {[1, 2, 3].map(mes => (
                        <td key={mes} className="p-3">
                          <select
                            className={\`text-xs font-bold rounded-lg px-2 py-1.5 border outline-none cursor-pointer \${
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Pago' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Em Atraso' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] === 'Enviado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }\`}
                            value={c.checklist?.[['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]] || ''}
                            onChange={(e) => {
                              const newCheck = { ...c.checklist, [['cobrancaMes1','cobrancaMes2','cobrancaMes3'][mes-1]]: e.target.value };
                              setClientes(prev => prev.map(cl => cl.id === c.id ? { ...cl, checklist: newCheck } : cl));
                              
                              // Trigger update to API (optimistic)
                              fetch('/api/posvenda/save', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ sheetName: selectedMes, rowId: c.id, checklist: newCheck, isComplete: (c.status === 'Concluído' || c.status === 'Alerta') })
                              }).catch(() => console.error("Falha ao salvar financeiro"));
                            }}
                          >
                            <option value="">-</option>
                            <option value="Pago">Pago</option>
                            <option value="Em Atraso">Atraso</option>
                            <option value="Enviado">Enviado</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(
  '{activeTab === "n8n" && (',
  financeTab + '\n      {activeTab === "n8n" && ('
);

fs.writeFileSync('src/components/PosVendaPage.tsx', code, 'utf8');
