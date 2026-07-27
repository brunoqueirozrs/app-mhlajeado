const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

code = code.replace(`import {
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
} from "lucide-react";`, `import {
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
} from "lucide-react";`);

code = code.replace(`  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ cliente: '', protocolo: '', vendedor: '', observacoes: '' });`, `  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ cliente: '', protocolo: '', vendedor: '', observacoes: '' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDisparoMassa = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(\`Você tem certeza que deseja realizar o disparo em massa para \${selectedIds.length} item(ns) selecionado(s)?\`)) {
      alert("✅ Disparo em massa iniciado com sucesso!");
      setSelectedIds([]);
    }
  };`);

code = code.replace(`          <div className="flex shrink-0 gap-3">
            <button
              onClick={() => setIsAddingProtocol(true)}
              className="px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-white text-sm font-black rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all active:scale-95 flex items-center gap-2 border border-sky-400/50"
            >`, `          <div className="flex shrink-0 gap-3">
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
            >`);

code = code.replace(`                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                      {formatDataDisplay(item.dataAdicao)}
                    </span>
                    {getTempoEmAberto(item.dataAdicao, item.status) && (`, `                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                        {formatDataDisplay(item.dataAdicao)}
                      </span>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => toggleSelection(e as any, item.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                    </div>
                    {getTempoEmAberto(item.dataAdicao, item.status) && (`);

fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
