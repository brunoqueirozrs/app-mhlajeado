const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const targetHeader = `<th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Indicação</th>`;
const newHeader = `<th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status de Envio</th>`;

code = code.replace(targetHeader, newHeader);

const targetSelect = `                      <td className="p-3">
                          <select
                            className={\`text-xs font-bold rounded-lg px-2 py-1.5 border outline-none cursor-pointer \${
                              c.checklist?.statusIndicacao === 'Indicou' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              c.checklist?.statusIndicacao === 'Não Indicou' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              c.checklist?.statusIndicacao === 'Solicitado' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }\`}
                            value={c.checklist?.statusIndicacao || ''}
                            onChange={(e) => {
                              const newCheck = { ...c.checklist, statusIndicacao: e.target.value };
                              // You would typically set state and call API here similar to financeiro
                              // but since we don't have access to setClientes here, I'll write the logic.
                              // Wait, I am inside PosVendaPage, I have access to setClientes!
                              setClientes(prev => prev.map(cl => cl.id === c.id ? { ...cl, checklist: newCheck } : cl));
                              fetch('/api/pos-vendas/' + encodeURIComponent(c.id), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ checklist: newCheck })
                              }).catch(() => console.error("Falha ao salvar indicação"));
                            }}
                          >
                            <option value="">-</option>
                            <option value="Solicitado">Solicitado</option>
                            <option value="Indicou">Indicou</option>
                            <option value="Não Indicou">Não Indicou</option>
                          </select>
                      </td>`;

const newSelect = `                      <td className="p-3 text-center">
                        {c.statusIndicacaoEnvio ? (
                          <span className={\`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase \${
                            c.statusIndicacaoEnvio.toLowerCase().includes('fila') ? 'bg-amber-100 text-amber-700' :
                            c.statusIndicacaoEnvio.toLowerCase().includes('enviado') || c.statusIndicacaoEnvio.toLowerCase().includes('sucesso') || c.statusIndicacaoEnvio.toLowerCase() === 'ok' ? 'bg-emerald-100 text-emerald-700' :
                            c.statusIndicacaoEnvio.toLowerCase().includes('erro') || c.statusIndicacaoEnvio.toLowerCase().includes('falha') ? 'bg-rose-100 text-rose-700' :
                            'bg-slate-100 text-slate-600'
                          }\`}>
                            {c.statusIndicacaoEnvio}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>`;

code = code.replace(targetSelect, newSelect);

fs.writeFileSync('src/components/PosVendaPage.tsx', code);
