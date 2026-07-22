import React, { useState, useEffect } from "react";
import { db } from "../lib/db";
import { collection, onSnapshot, query, orderBy, where, QueryConstraint } from "firebase/firestore";
import { ClipboardList, Search, Filter, Calendar, User, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface TestResult {
  id: string;
  vendorId: string;
  vendorName: string;
  type: string;
  date: string;
  summary: string;
  details: any;
}

export default function AdminTestResultsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterVendor, setFilterVendor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    let constraints: QueryConstraint[] = [];

    if (filterStartDate) {
      constraints.push(where("date", ">=", new Date(`${filterStartDate}T00:00:00`).toISOString()));
    }
    if (filterEndDate) {
      constraints.push(where("date", "<=", new Date(`${filterEndDate}T23:59:59.999`).toISOString()));
    }

    constraints.push(orderBy("date", "desc"));

    const q = query(collection(db, "test_results"), ...constraints);
    const unsub = onSnapshot(q, (snapshot) => {
      setResults(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult)));
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar testes:", error);
      setLoading(false);
    });
    
    return () => unsub();
  }, [filterStartDate, filterEndDate]);

  const filteredResults = results.filter(res => {
    const matchVendor = res.vendorName.toLowerCase().includes(filterVendor.toLowerCase());
    const matchType = filterType ? res.type === filterType : true;
    return matchVendor && matchType;
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'disc': return 'Perfil DISC';
      case 'raiox': return 'Raio-X (IA)';
      case 'competencias': return 'Avaliação de Competências';
      case 'perfil_comercial': return 'Perfil Comercial';
      case 'roleplay': return 'Roleplay (IA)';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'disc': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'raiox': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'competencias': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'perfil_comercial': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'roleplay': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <ClipboardList className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Histórico de Testes e Avaliações</h1>
          <p className="text-slate-500">Acompanhamento centralizado de desempenho e diagnósticos da equipe.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do vendedor..."
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="w-full md:w-48 relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            <option value="">Todos os tipos</option>
            <option value="disc">Perfil DISC</option>
            <option value="raiox">Raio-X (IA)</option>
            <option value="competencias">Avaliação de Competências</option>
            <option value="perfil_comercial">Perfil Comercial</option>
            <option value="roleplay">Roleplay (IA)</option>
          </select>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
            title="Data Inicial"
          />
          <span className="text-slate-400 text-sm">até</span>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-600"
            title="Data Final"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Nenhum resultado encontrado</h3>
          <p className="text-slate-500">Ajuste os filtros ou aguarde a realização de novos testes.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResults.map(res => (
            <div key={res.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div 
                className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}
              >
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{res.vendorName}</p>
                      <p className="text-xs text-slate-500">Vendedor</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full border ${getTypeColor(res.type)}`}>
                      {getTypeLabel(res.type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {new Date(res.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                  <div className="text-sm font-medium text-slate-700 line-clamp-1">
                    {res.summary}
                  </div>
                </div>
                
                <div className="text-slate-400 hidden md:block">
                  {expandedId === res.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {expandedId === res.id && (
                <div className="p-5 border-t border-slate-100 bg-slate-50">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Dados Brutos / Detalhes</h4>
                  <pre className="text-xs font-mono text-slate-600 bg-slate-800 p-4 rounded-xl overflow-x-auto">
                    <code className="text-sky-300">{JSON.stringify(res.details, null, 2)}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
