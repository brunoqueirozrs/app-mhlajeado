const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf-8');

// 1. Restore quickAddStatus state
const stateInsertIdx = content.indexOf('const [weatherData, setWeatherData]');
if (stateInsertIdx !== -1) {
  content = content.slice(0, stateInsertIdx) + `const [quickAddStatus, setQuickAddStatus] = useState<'idle' | 'loading' | 'success'>('idle');\n  ` + content.slice(stateInsertIdx);
}

// 2. Remove AI block
const aiStartStr = '{/* 2. LIVE AI INSIGHTS CARD PANEL */}';
const aiEndStr = '{/* 3. CORE COMMAND BENTO GRID */}';
const aiStartIdx = content.indexOf(aiStartStr);
const aiEndIdx = content.indexOf(aiEndStr);

if (aiStartIdx !== -1 && aiEndIdx !== -1) {
  content = content.slice(0, aiStartIdx) + content.slice(aiEndIdx);
}

// 3. Add back quick add block
const gridStartStr = '{/* 4. WORK MODULE PORTALS GRID */}';
const gridStartIdx = content.indexOf(gridStartStr);

const quickAddBlock = `      {/* 3.5 QUICK ADD PROTOCOL (CHAMADOS MANUTENCAO) */}
      <div className="card-modern border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Inclusão Rápida de Chamado</h4>
            <p className="text-[10px] font-medium text-slate-500">Enviar para fila de monitoramento</p>
          </div>
        </div>
        <form 
          className="flex flex-1 max-w-xl w-full gap-2 items-center" 
          onSubmit={async (e) => {
            e.preventDefault();
            if (quickAddStatus === 'loading') return;
            const form = e.target as HTMLFormElement;
            const rawText = (form.elements.namedItem("rawText") as HTMLInputElement).value;
            if(!rawText) return;
            setQuickAddStatus('loading');
            
            // Tentar extrair o nome e o protocolo (ex: "Protocolo 15669184 - CC... - LJO - NOME")
            let extractedCliente = "-";
            let extractedProtocolo = rawText;
            
            if (rawText.includes('-')) {
              const parts = rawText.split('-');
              extractedCliente = parts[parts.length - 1].trim();
              extractedProtocolo = parts[0].trim();
            }

            try {
              const res = await fetch('/api/installations-queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cliente: extractedCliente,
                  protocolo: extractedProtocolo,
                  vendedor: loggedUser,
                  observacoes: "Adicionado via painel rápido"
                })
              });
              if(res.ok) {
                setQuickAddStatus('success');
                setTimeout(() => setQuickAddStatus('idle'), 2500);
                form.reset();
              } else {
                setQuickAddStatus('idle');
                alert("Erro ao adicionar à fila.");
              }
            } catch(err) {
              setQuickAddStatus('idle');
              alert("Erro ao adicionar");
            }
          }}
        >
          <input 
            name="rawText" 
            type="text" 
            placeholder="Cole os dados do protocolo aqui..." 
            className="flex-1 bg-slate-50 border border-slate-200 text-xs px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50" 
            disabled={quickAddStatus === 'loading'}
          />
          <button 
            type="submit" 
            disabled={quickAddStatus === 'loading'}
            className={\`
              px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 shadow-sm min-w-[100px] justify-center
              \${quickAddStatus === 'success' 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white ring-2 ring-emerald-500/50 ring-offset-1' 
                : 'bg-amber-500 hover:bg-amber-600 text-white'
              }
              \${quickAddStatus === 'loading' ? 'opacity-70 cursor-wait' : ''}
            \`}
          >
            {quickAddStatus === 'loading' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : quickAddStatus === 'success' ? (
              <><CheckCircle className="w-4 h-4 animate-in zoom-in duration-300" /> Sucesso</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Enviar</>
            )}
          </button>
        </form>
      </div>
      `;

if (gridStartIdx !== -1) {
  content = content.slice(0, gridStartIdx) + quickAddBlock + content.slice(gridStartIdx);
}

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log('Patched');

