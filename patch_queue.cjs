const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

const importSearch = `import {
  ClipboardList,
  CheckCircle,
  Clock,
  Timer,
  Check,
  RefreshCw,
  Filter,
  Phone,
  PhoneCall,
  AlertTriangle,
  Trash2,
  X,
  Plus,
} from "lucide-react";`;
const importReplace = `import {
  ClipboardList,
  CheckCircle,
  Clock,
  Timer,
  Check,
  RefreshCw,
  Filter,
  Phone,
  PhoneCall,
  AlertTriangle,
  Trash2,
  X,
  Plus,
  Zap,
} from "lucide-react";`;
code = code.replace(importSearch, importReplace);

const stateSearch = `  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ cliente: '', protocolo: '', vendedor: '', observacoes: '' });`;
const stateReplace = `  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ cliente: '', protocolo: '', vendedor: '', observacoes: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);`;
code = code.replace(stateSearch, stateReplace);

const toggleSelectionCode = `
  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDisparoMassa = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(\`Você tem certeza que deseja realizar o disparo em massa para \${selectedIds.length} item(ns) selecionado(s)?\`)) {
      alert("✅ Disparo em massa iniciado com sucesso! (Funcionalidade pronta para integrar ao backend/n8n)");
      setSelectedIds([]);
    }
  };
`;

const fetchCallSearch = `  const fetchQueue = async () => {`;
code = code.replace(fetchCallSearch, toggleSelectionCode + '\n' + fetchCallSearch);

const topButtonSearch = `        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wide uppercase mb-4">
              <ClipboardList className="w-4 h-4" />
              Gestão de Implantação
            </div>`;
const topButtonReplace = `        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold tracking-wide uppercase mb-4">
              <ClipboardList className="w-4 h-4" />
              Gestão de Implantação
            </div>`;
code = code.replace(topButtonSearch, topButtonReplace);

const buttonSearch = `          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => setIsAddingProtocol(true)}
              className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-black rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all active:scale-95 flex items-center gap-2 border border-sky-400/50"
            >
              <Plus className="w-5 h-5" />
              Nova Solicitação
            </button>
          </div>`;
const buttonReplace = `          <div className="flex shrink-0 gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDisparoMassa}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all active:scale-95 flex items-center gap-2 border border-emerald-400/50"
              >
                <Zap className="w-5 h-5" />
                Disparo em Massa ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setIsAddingProtocol(true)}
              className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-black rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all active:scale-95 flex items-center gap-2 border border-sky-400/50"
            >
              <Plus className="w-5 h-5" />
              Nova Solicitação
            </button>
          </div>`;
code = code.replace(buttonSearch, buttonReplace);

const cardSearch = `                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                      {formatDataDisplay(item.dataAdicao)}
                    </span>
                  </div>
                </div>`;
const cardReplace = `                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {formatDataDisplay(item.dataAdicao)}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => toggleSelection(e, item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>`;
code = code.replace(cardSearch, cardReplace);

fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
console.log("Patched InstallationsQueuePage.tsx with Selection and Disparo");
