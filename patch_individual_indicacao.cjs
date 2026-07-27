const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const targetFunc = `  const handleBulkSendIndicacao = async () => {`;
const insertFunc = `  const handleSendIndicacaoIndividual = async (client: ClientPosVenda) => {
    if (sendingIndicacoesState[client.id]?.status === 'loading') return;
    setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'loading' } }));
    
    try {
      const res = await fetch("/api/pos-vendas/disparar-indicacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientes: [client] })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "Erro na comunicação com o servidor.");
      }
      
      setSendingIndicacoesState(prev => ({ ...prev, [client.id]: { status: 'success' } }));
      
      // Update the checklist visually if possible, or assume N8N will do it
      // Let's reset the success state after 5 seconds
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
      
    } catch (err: any) {
      setSendingIndicacoesState(prev => ({ 
        ...prev, 
        [client.id]: { status: 'error', message: err.message || "Erro desconhecido" } 
      }));
      
      setTimeout(() => {
        setSendingIndicacoesState(prev => {
          const newState = { ...prev };
          delete newState[client.id];
          return newState;
        });
      }, 5000);
    }
  };

`;

code = code.replace(targetFunc, insertFunc + targetFunc);

const targetBtn = `                      <td className="p-3 text-right">
                        <button 
                          onClick={() => alert(\`Enviando solicitação de indicação para \${c.nome}\`)}
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Solicitar
                        </button>
                      </td>`;

const replacementBtn = `                      <td className="p-3 text-right">
                        <div className="flex flex-col items-end gap-1 ml-auto">
                          <button 
                            onClick={() => handleSendIndicacaoIndividual(c)}
                            disabled={sendingIndicacoesState[c.id]?.status === 'loading' || sendingIndicacoesState[c.id]?.status === 'success'}
                            className={\`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 \${
                              sendingIndicacoesState[c.id]?.status === 'loading' ? 'bg-emerald-100/50 text-emerald-700/50 cursor-not-allowed' : 
                              sendingIndicacoesState[c.id]?.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                              sendingIndicacoesState[c.id]?.status === 'error' ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' :
                              'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }\`}
                          >
                            {sendingIndicacoesState[c.id]?.status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                             sendingIndicacoesState[c.id]?.status === 'success' ? <CheckCircle className="w-3.5 h-3.5 animate-in zoom-in" /> :
                             sendingIndicacoesState[c.id]?.status === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                             <UserCheck className="w-3.5 h-3.5" />}
                            {sendingIndicacoesState[c.id]?.status === 'loading' ? 'Enviando...' :
                             sendingIndicacoesState[c.id]?.status === 'success' ? 'Solicitado' :
                             sendingIndicacoesState[c.id]?.status === 'error' ? 'Erro' :
                             'Solicitar'}
                          </button>
                          {sendingIndicacoesState[c.id]?.status === 'error' && (
                            <span className="text-[10px] text-rose-500 font-medium">
                              {sendingIndicacoesState[c.id]?.message}
                            </span>
                          )}
                        </div>
                      </td>`;

code = code.replace(targetBtn, replacementBtn);
fs.writeFileSync('src/components/PosVendaPage.tsx', code);
