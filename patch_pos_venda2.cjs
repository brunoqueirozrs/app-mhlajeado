const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const target = `            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Indicação</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-bold text-slate-800 text-sm">{c.nome}</td>`;

const replacement = `            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 w-10 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        checked={filteredClientes.length > 0 && selectedIndicacoesIds.size === filteredClientes.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIndicacoesIds(new Set(filteredClientes.map(c => c.id)));
                          } else {
                            setSelectedIndicacoesIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Indicação</th>
                    <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClientes.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          checked={selectedIndicacoesIds.has(c.id)}
                          onChange={(e) => {
                            const newSet = new Set(selectedIndicacoesIds);
                            if (e.target.checked) newSet.add(c.id);
                            else newSet.delete(c.id);
                            setSelectedIndicacoesIds(newSet);
                          }}
                        />
                      </td>
                      <td className="p-3 font-bold text-slate-800 text-sm">{c.nome}</td>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PosVendaPage.tsx', code);
