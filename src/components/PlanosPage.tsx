import React, { useEffect, useState } from "react";
import { List, Search, Wifi, Tv, Smartphone, AlertCircle, Loader2, MessageCircle, X, CheckSquare, Square, Send, Mail } from "lucide-react";
import { getAccessToken, googleSignIn } from "../lib/auth";

interface Plano {
  codigo: string;
  nome: string;
  valor: string;
  valorAd: string;
  categoria: string;
}

// Simple RFC-compliant CSV parser
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"';
        i++; // skip next quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell);
        currentCell = "";
      } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
        currentRow.push(currentCell);
        rows.push(currentRow);
        currentRow = [];
        currentCell = "";
        if (char === '\r') i++; // skip \n
      } else {
        currentCell += char;
      }
    }
  }
  
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }
  
  return rows;
}

export default function PlanosPage() {
  const SPREADSHEET_ID = "19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w";
  
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [selectedPlanos, setSelectedPlanos] = useState<Plano[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState("");

  const [deliveryMethod, setDeliveryMethod] = useState<"whatsapp" | "gmail">("whatsapp");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [emailSubject, setEmailSubject] = useState("Apresentação de Planos de Internet MHNET");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchPlanos = async () => {
    try {
      setIsLoading(true);
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=Planos&t=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      
      if (!res.ok) throw new Error("Falha ao carregar a planilha");
      
      const csvText = await res.text();
      const rows = parseCSV(csvText);
      
      let currentCategory = "Internet Fibra";
      const parsedPlanos: Plano[] = [];
      
      // Skip the first row (headers)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length < 4) continue;
        
        const codigo = row[0]?.trim();
        const nome = row[1]?.trim();
        const valor = row[2]?.trim();
        const valorAd = row[3]?.trim();
        
        // Detect category header
        if (!codigo && nome && valor === "Valor" && valorAd === "Valor (AD)") {
          currentCategory = nome;
          continue;
        }
        
        // Must have at least a name
        if (nome && nome !== "") {
          parsedPlanos.push({
            codigo,
            nome,
            valor,
            valorAd,
            categoria: currentCategory
          });
        }
      }
      
      setPlanos(parsedPlanos);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao carregar planos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanos();
  }, []);

  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('tv') || lower.includes('câmera') || lower.includes('streaming') || lower.includes('play')) return <Tv className="w-5 h-5" />;
    if (lower.includes('movel') || lower.includes('móvel') || lower.includes('celular') || lower.includes('telefone')) return <Smartphone className="w-5 h-5" />;
    return <Wifi className="w-5 h-5" />;
  };

  const filteredPlanos = planos.filter(p => {
    const term = searchQuery.toLowerCase();
    return p.nome.toLowerCase().includes(term) || 
           p.codigo.toLowerCase().includes(term) ||
           p.categoria.toLowerCase().includes(term) ||
           p.valorAd.toLowerCase().includes(term);
  });

  const categories = Array.from(new Set(filteredPlanos.map(p => p.categoria)));

  const togglePlanoSelection = (plano: Plano) => {
    setSelectedPlanos(prev => {
      const isSelected = prev.some(p => p.nome === plano.nome && p.codigo === plano.codigo);
      if (isSelected) {
        return prev.filter(p => !(p.nome === plano.nome && p.codigo === plano.codigo));
      } else {
        return [...prev, plano];
      }
    });
  };

  const handleGeneratePitch = async () => {
    if (selectedPlanos.length === 0) return;
    setIsModalOpen(true);
    setIsGeneratingMessage(true);
    try {
      const res = await fetch("/api/gemini/generatePlanosPitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planos: selectedPlanos, isMultiple: selectedPlanos.length > 1 })
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedMessage(data.text);
      } else {
        setGeneratedMessage("Erro ao gerar mensagem. Você pode escrever manualmente aqui.");
      }
    } catch (e) {
      setGeneratedMessage("Erro ao conectar com a IA. Você pode escrever manualmente aqui.");
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const sendToWhatsApp = () => {
    const encoded = encodeURIComponent(generatedMessage);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  const sendToGmail = async () => {
    if (!recipientEmail.trim()) {
      setEmailStatus({ type: "error", message: "Por favor, insira o e-mail do destinatário." });
      return;
    }
    setEmailStatus(null);
    setIsSendingEmail(true);

    try {
      let token = await getAccessToken();
      if (!token) {
        const result = await googleSignIn();
        token = result?.accessToken || null;
      }

      if (!token) {
        throw new Error("Não foi possível obter permissão de acesso à sua conta Google.");
      }

      // Build RFC 2822 raw message
      const utf8Subject = `=?utf-8?B?${btoa(encodeURIComponent(emailSubject).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}?=`;
      const emailLines = [
        `To: ${recipientEmail.trim()}`,
        "Content-Type: text/plain; charset=utf-8",
        "MIME-Version: 1.0",
        `Subject: ${utf8Subject}`,
        "",
        generatedMessage
      ];
      const emailContent = emailLines.join("\r\n");
      const raw = btoa(encodeURIComponent(emailContent).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || "Falha ao enviar e-mail via API do Gmail.");
      }

      setEmailStatus({ type: "success", message: "E-mail enviado com sucesso usando sua conta Gmail!" });
    } catch (e: any) {
      console.error(e);
      setEmailStatus({ type: "error", message: e.message || "Erro desconhecido ao enviar e-mail." });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-24 md:pb-8 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-sm shrink-0">
            <List className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-800">Planos & Preços</h1>
            <p className="text-xs font-bold text-slate-400 mt-1 tracking-widest uppercase">Catálogo Comercial MHNET</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          {selectedPlanos.length > 0 && (
            <button
              onClick={handleGeneratePitch}
              className="shrink-0 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar IA ({selectedPlanos.length})
            </button>
          )}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar plano..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full card-modern border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 shadow-sm transition"
            />
          </div>
          <button 
            onClick={fetchPlanos}
            disabled={isLoading}
            className="shrink-0 flex items-center justify-center card-modern border border-slate-200 rounded-xl p-2.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 hover:border-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Sincronizar novamente com a planilha"
          >
            <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 card-modern rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          <p className="text-sm font-bold text-slate-500 mt-4">Sincronizando planos da planilha...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-10">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <div className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  {getCategoryIcon(category)}
                </div>
                <h2 className="text-lg font-extrabold text-slate-800">{category}</h2>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                  {filteredPlanos.filter(p => p.categoria === category).length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPlanos.filter(p => p.categoria === category).map((plano, idx) => {
                  const isSelected = selectedPlanos.some(p => p.nome === plano.nome && p.codigo === plano.codigo);
                  return (
                  <div 
                    key={idx} 
                    onClick={() => togglePlanoSelection(plano)}
                    className={`card-modern border rounded-2xl p-5 shadow-sm -md transition group flex flex-col h-full cursor-pointer ${isSelected ? "border-emerald-500 ring-1 ring-emerald-500 bg-[#E6FAF1]/10" : "border-slate-200/80 hover:border-blue-300"}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-slate-800 leading-snug text-sm group-hover:text-blue-950 transition-colors pr-6">
                        {plano.nome}
                      </h3>
                      <div className="shrink-0 mt-0.5">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#00A86B]" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-300 transition-colors" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center gap-2">
                        {plano.codigo ? (
                          <div className="inline-flex items-center bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-1 rounded-md">
                            Cód: {plano.codigo}
                          </div>
                        ) : (
                          <div className="inline-flex items-center bg-amber-50 text-amber-600 text-[10px] font-mono font-bold px-2 py-1 rounded-md">
                            S/ Código
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valor (AD)</p>
                          <p className="font-extrabold text-blue-900 font-mono text-base tracking-tight">{plano.valorAd || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Valor Normal</p>
                          <p className="font-bold text-slate-600 font-mono text-sm tracking-tight line-through opacity-70">{plano.valor || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredPlanos.length === 0 && (
            <div className="text-center py-16 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">Nenhum plano encontrado para a sua busca.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-900 text-sm font-bold hover:underline"
              >
                Limpar busca
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delivery Pitch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 ">
          <div className="card-modern rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${deliveryMethod === "gmail" ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-[#00A86B]"}`}>
                  {deliveryMethod === "gmail" ? <Mail className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg leading-tight">Enviar Planos</h3>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Apresentação gerada por IA</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              {isGeneratingMessage ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative">
                    <Loader2 className={`w-10 h-10 animate-spin ${deliveryMethod === "gmail" ? "text-sky-500" : "text-[#00A86B]"}`} />
                    <div className={`absolute inset-0 border-4 rounded-full -z-10 ${deliveryMethod === "gmail" ? "border-sky-100" : "border-[#00A86B]/20"}`}></div>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-700">A IA está escrevendo...</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Criando a melhor abordagem de vendas para {selectedPlanos.length} plano(s).</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-800 mb-2 uppercase tracking-wider">Planos Selecionados:</p>
                    <ul className="space-y-1">
                      {selectedPlanos.map((p, i) => (
                        <li key={i} className="text-sm font-medium text-blue-950 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">•</span>
                          <span>{p.nome} - <strong className="font-mono">{p.valorAd || p.valor}</strong></span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Delivery Mode Tabs */}
                  <div className="flex border-b border-slate-100 mb-4">
                    <button
                      onClick={() => setDeliveryMethod("whatsapp")}
                      className={`flex-1 py-3 text-center text-sm font-extrabold flex items-center justify-center gap-2 border-b-2 transition ${deliveryMethod === "whatsapp" ? "border-emerald-500 text-[#00A86B]" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setDeliveryMethod("gmail")}
                      className={`flex-1 py-3 text-center text-sm font-extrabold flex items-center justify-center gap-2 border-b-2 transition ${deliveryMethod === "gmail" ? "border-sky-500 text-sky-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
                    >
                      <Mail className="w-4 h-4" />
                      E-mail (Gmail)
                    </button>
                  </div>

                  {deliveryMethod === "gmail" && (
                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3 ">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">E-mail do Destinatário</label>
                        <input
                          type="email"
                          placeholder="cliente@email.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          className="w-full card-modern border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider pl-1">Assunto do E-mail</label>
                        <input
                          type="text"
                          placeholder="Assunto da Proposta"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="w-full card-modern border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-sky-500/30 focus:outline-none"
                        />
                      </div>
                      {emailStatus && (
                        <div className={`p-3 rounded-lg text-xs font-bold ${emailStatus.type === "success" ? "bg-[#E6FAF1] text-emerald-800 border border-[#00A86B]/20" : "bg-rose-50 text-rose-800 border border-rose-100"}`}>
                          {emailStatus.message}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest pl-1">Mensagem para o cliente</label>
                    <textarea 
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                      className={`w-full h-44 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 resize-none leading-relaxed transition ${deliveryMethod === "gmail" ? "focus:ring-sky-500/50" : "focus:ring-emerald-500/50"}`}
                      placeholder="Sua mensagem aparecerá aqui..."
                    />
                    <p className="text-[10px] font-bold text-slate-400 pl-1">Você pode editar a mensagem acima antes de enviar.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 card-modern border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition active:scale-95"
              >
                Cancelar
              </button>
              {deliveryMethod === "whatsapp" ? (
                <button
                  onClick={sendToWhatsApp}
                  disabled={isGeneratingMessage || !generatedMessage.trim()}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" />
                  Abrir WhatsApp
                </button>
              ) : (
                <button
                  onClick={sendToGmail}
                  disabled={isGeneratingMessage || isSendingEmail || !generatedMessage.trim()}
                  className="flex-1 px-4 py-3 bg-sky-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-sky-700 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-500/20"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar com Gmail
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
