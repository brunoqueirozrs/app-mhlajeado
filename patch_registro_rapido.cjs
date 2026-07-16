const fs = require('fs');
let code = fs.readFileSync('src/components/CobrancasPage.tsx', 'utf8');

// Add states
code = code.replace(
  '// Selected Billing Item',
  `// Registro Rapido
  const [isRegistroRapidoOpen, setIsRegistroRapidoOpen] = useState(false);
  const [registroRapidoAtendeu, setRegistroRapidoAtendeu] = useState<boolean | null>(null);
  const [registroRapidoRelato, setRegistroRapidoRelato] = useState("");

  // Selected Billing Item`
);

// Add submit function right before handleSubmitContactLog
const fnInsertPos = code.indexOf('const handleSubmitContactLog = async () => {');
const rapidFn = `
  const handleRegistroRapidoSubmit = async (atendeu: boolean, relato?: string) => {
    if (!selectedItem) return;
    try {
      if (atendeu === false) {
        await onRegisterCobrancaLog(selectedItem.idContrato, {
          tipo: "Telefone",
          descricao: "Tentativa de chamada sem sucesso",
          contatoEfetivo: false,
          acordoFirmado: false,
          motivoInadimplencia: ""
        });
        alert("Tentativa de chamada registrada!");
      } else {
        if (!relato?.trim()) {
          alert("Por favor, preencha o relato.");
          return;
        }
        await onRegisterCobrancaLog(selectedItem.idContrato, {
          tipo: "Telefone",
          descricao: "Chamada atendida: " + relato,
          contatoEfetivo: true,
          acordoFirmado: false,
          motivoInadimplencia: ""
        });
        alert("Relato registrado!");
      }
      setIsRegistroRapidoOpen(false);
      setRegistroRapidoAtendeu(null);
      setRegistroRapidoRelato("");
      
      // We rely on parent updates to refresh 'cobrancas', but we can try to find fresh locally if it mutates
      // Usually the parent mutation triggers re-render, we don't need to manually re-find unless necessary.
      // We will do nothing because we don't have fresh 'cobrancas' available directly inside a closure easily if not careful, 
      // but 'cobrancas' is a prop so it might refresh the selectedItem if we find it.
      const fresh = cobrancas.find(x => x.idContrato === selectedItem.idContrato);
      if (fresh) setSelectedItem(fresh);

    } catch (e: any) {
      alert("Erro ao registrar ligação: " + e.message);
    }
  };

  `;
code = code.substring(0, fnInsertPos) + rapidFn + code.substring(fnInsertPos);

// Modify header description
code = code.replace(
  '<p className="text-xs text-slate-400 font-mono font-bold uppercase">Contrato ID: {selectedItem.idContrato} · Telefone: {selectedItem.telefone}</p>',
  `<div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400 font-mono font-bold uppercase">Contrato ID: {selectedItem.idContrato} · Telefone: {selectedItem.telefone}</p>
                  <button 
                    onClick={() => { setIsRegistroRapidoOpen(true); setRegistroRapidoAtendeu(null); setRegistroRapidoRelato(""); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Registro Rápido de Ligação
                  </button>
                </div>`
);

// Append Modal
const modalCode = `
      {/* REGISTRO RAPIDO MODAL */}
      {isRegistroRapidoOpen && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[250] font-sans">
          <div className="bg-white rounded-[26px] border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
            <div className="p-5 bg-sky-600 text-white flex justify-between items-center shrink-0">
              <div className="font-sans">
                <span className="text-[9px] font-black uppercase tracking-wider block text-sky-200">Ligação Telefônica</span>
                <h3 className="text-sm font-black uppercase tracking-tight block">Registro Rápido</h3>
              </div>
              <button
                onClick={() => setIsRegistroRapidoOpen(false)}
                className="p-1 px-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-slate-800">
              <p className="text-sm font-bold text-center">O cliente atendeu a ligação?</p>
              
              {registroRapidoAtendeu === null && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => handleRegistroRapidoSubmit(false)}
                    className="p-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-bold text-sm transition flex flex-col items-center justify-center gap-1"
                  >
                    <Phone className="w-5 h-5 mb-1" />
                    Não Atendeu
                  </button>
                  <button
                    onClick={() => setRegistroRapidoAtendeu(true)}
                    className="p-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition flex flex-col items-center justify-center gap-1"
                  >
                    <CheckCircle className="w-5 h-5 mb-1" />
                    Sim, Atendeu
                  </button>
                </div>
              )}

              {registroRapidoAtendeu === true && (
                <div className="space-y-3 mt-4 animate-fade-in">
                  <label className="text-xs font-black uppercase text-slate-500 block">Relato do Atendimento</label>
                  <textarea
                    value={registroRapidoRelato}
                    onChange={(e) => setRegistroRapidoRelato(e.target.value)}
                    placeholder="Descreva o que foi conversado..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[100px]"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRegistroRapidoAtendeu(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => handleRegistroRapidoSubmit(true, registroRapidoRelato)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 transition"
                    >
                      Salvar Relato
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
`;

const lastDivIndex = code.lastIndexOf('</div>');
const beforeLastDiv = code.substring(0, lastDivIndex);
const afterLastDiv = code.substring(lastDivIndex);

code = beforeLastDiv + modalCode + afterLastDiv;

fs.writeFileSync('src/components/CobrancasPage.tsx', code, 'utf8');
