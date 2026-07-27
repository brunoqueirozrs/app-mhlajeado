const fs = require('fs');
let code = fs.readFileSync('src/components/InstallationsQueuePage.tsx', 'utf8');

const target = `  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
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
  };`;

// Find first occurence and second occurrence. It's probably easier to just replace all `const [selectedIds, setSelectedIds] = useState<string[]>([]);` with empty, then put it back once.
code = code.replace(/const \[selectedIds, setSelectedIds\] = useState<string\[\]>\(\[\]\);/g, '');

const insertTarget = `  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [isAddingProtocol, setIsAddingProtocol] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ cliente: '', protocolo: '', vendedor: '', observacoes: '' });`;

code = code.replace(insertTarget, insertTarget + `\n  const [selectedIds, setSelectedIds] = useState<string[]>([]);`);

fs.writeFileSync('src/components/InstallationsQueuePage.tsx', code);
