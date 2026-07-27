const fs = require('fs');
let code = fs.readFileSync('src/components/PosVendaPage.tsx', 'utf8');

const target = `              <button 
                onClick={() => {
                  if (confirm("Deseja disparar solicitações de indicação em massa?")) {
                    alert("Disparo em massa iniciado!");
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition"
              >
                <Zap className="w-4 h-4" /> Disparo em Massa
              </button>`;

const replacement = `              <button 
                onClick={() => {
                  if (selectedIndicacoesIds.size === 0) {
                    alert("Selecione pelo menos um cliente para disparar.");
                    return;
                  }
                  requestConfirm("Disparo em Massa (Indicações)", \`Deseja enviar solicitações de indicação para \${selectedIndicacoesIds.size} clientes selecionados?\`, handleBulkSendIndicacao);
                }}
                disabled={isDispatchingIndicacoes || selectedIndicacoesIds.size === 0}
                className={\`\${isDispatchingIndicacoes || selectedIndicacoesIds.size === 0 ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition\`}
              >
                {isDispatchingIndicacoes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isDispatchingIndicacoes ? 'Disparando...' : \`Disparo em Massa (\${selectedIndicacoesIds.size})\`}
              </button>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/PosVendaPage.tsx', code);
