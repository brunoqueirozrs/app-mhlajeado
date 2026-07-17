import React, { useState, useMemo } from 'react';
import { Cobranca } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, LabelList } from 'recharts';
import { Download, FileText, ArrowLeft, Brain, TrendingUp, Users, Smartphone, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
// @ts-ignore
import html2pdf from "html2pdf.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface CobrancasDashboardProps {
  cobrancas: Cobranca[];
  onClose: () => void;
  onOpenDetails: (cobranca: Cobranca) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6b6b'];

export default function CobrancasDashboard({ cobrancas, onClose, onOpenDetails }: CobrancasDashboardProps) {
  const [dateFilter, setDateFilter] = useState("all");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);

  // Deriving KPIs
  const totalDevedores = cobrancas.filter(c => c.diasAtraso> 0).length;
  
  const baixouAppCount = cobrancas.filter(c => c.baixouApp?.trim().toUpperCase() === "SIM").length;
  const baixouAppPercent = totalDevedores> 0 ? Math.round((baixouAppCount / totalDevedores) * 100) : 0;
  
  const totalDiasAtraso = cobrancas.reduce((acc, c) => acc + (c.diasAtraso || 0), 0);
  const mediaDiasAtraso = totalDevedores> 0 ? Math.round(totalDiasAtraso / totalDevedores) : 0;

  // Since we might not have a lot of historical log data yet, we approximate these from cobrancas.historicoContatos
  let totalLigacoes = 0;
  let totalContatosEfetivos = 0;
  let totalAcordos = 0;

  cobrancas.forEach(c => {
    if (c.historicoContatos) {
      c.historicoContatos.forEach(log => {
        totalLigacoes++;
        if (log.contatoEfetivo) totalContatosEfetivos++;
        if (log.acordoFirmado) totalAcordos++;
      });
    }
  });

  const taxaContatoEfetivo = totalLigacoes> 0 ? Math.round((totalContatosEfetivos / totalLigacoes) * 100) : 0;

  // Chart Data: Bairro
  const bairroCounts = cobrancas.reduce((acc, c) => {
    const b = c.bairro || 'Desconhecido';
    if (c.diasAtraso> 0) acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const bairroChartData = Object.entries(bairroCounts)
    .map(([bairro, count]) => ({ bairro, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Chart Data: Plano
  const planoCounts = cobrancas.reduce((acc, c) => {
    let p = c.plano || 'Desconhecido';
    const match = p.match(/(\d+\s*(?:Mbps|Gbps|Mb|Gb|Mega|Giga))/i);
    if (match) {
      p = match[1];
      if (/wifitotal/i.test(c.plano || '')) {
        p += " + WIFITotal";
      }
    }
    if (c.diasAtraso> 0) acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const planoChartData = Object.entries(planoCounts)
    .map(([name, value]) => ({ name: name.length> 20 ? name.substring(0, 20) + "..." : name, value }))
    .sort((a, b) => b.value - a.value);

  // Critical Clients (Top 10 max days)
  const criticalClients = [...cobrancas]
    .sort((a, b) => b.diasAtraso - a.diasAtraso)
    .slice(0, 10);

  // Export functions
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(cobrancas.map(c => ({
      Nome: c.nomeCliente,
      'CPF/CNPJ': c.cpfCnpj,
      Cidade: c.cidade,
      Bairro: c.bairro,
      Plano: c.plano,
      Vencimento: c.dataVencimento,
      Atraso: c.diasAtraso,
      Valor: c.valor
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cobrancas");
    XLSX.writeFile(wb, "Dashboard_Cobrancas.xlsx");
  };

  const exportToPDF = () => {
    const element = document.getElementById('dashboard-content');
    if (!element) return;
    
    // Configurações para o PDF
    const opt = {
      margin:       10,
      filename:     'Apresentacao_Analise_Cobrancas.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
    };
    
    // Botões a serem ocultados na hora do print
    const actionButtons = document.getElementById('dashboard-actions');
    if (actionButtons) actionButtons.style.display = 'none';
    
    html2pdf().set(opt).from(element).save().then(() => {
      if (actionButtons) actionButtons.style.display = 'flex';
    });
  };

  const generateDiagnostic = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch("/api/ai/diagnostico-cobranca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          stats: {
            totalDevedores,
            mediaDiasAtraso,
            baixouAppPercent,
            taxaContatoEfetivo,
            bairrosCriticos: bairroChartData.slice(0,3).map(b => `${b.bairro} (${b.count})`),
            planosCriticos: planoChartData.slice(0,3).map(p => `${p.name} (${p.value})`)
          }
        })
      });
      const data = await res.json();
      setAiDiagnostic(data.diagnostic);
    } catch(e) {
      setAiDiagnostic("Não foi possível gerar o diagnóstico no momento.");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div id="dashboard-content" className="space-y-6 pb-12  font-sans bg-slate-50 p-6 rounded-3xl">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl shadow-xl text-white">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">Dashboard Gerencial</h1>
            <p className="text-slate-400 text-sm font-medium">Gestão Estratégica de Cobranças - MINET</p>
          </div>
        </div>
        <div id="dashboard-actions" className="flex gap-3">
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-bold text-sm transition-colors border border-emerald-500/20">
            <Download className="w-4 h-4" /> Planilha
          </button>
          <button onClick={exportToPDF} className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl font-bold text-sm transition-colors border border-rose-500/20">
            <FileText className="w-4 h-4" /> PDF Crítico
          </button>
          <button onClick={generateDiagnostic}
                  disabled={aiGenerating} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-500/30">
            <Brain className="w-4 h-4" /> {aiGenerating ? 'Analisando...' : 'Raio-X IA'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg"><Users className="w-4 h-4" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest">Total Devedores</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{totalDevedores}</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-sky-50 text-sky-500 rounded-lg"><Smartphone className="w-4 h-4" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest">% Baixaram App</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{baixouAppPercent}%</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-amber-50 text-amber-500 rounded-lg"><AlertTriangle className="w-4 h-4" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest">Média Atraso</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{mediaDiasAtraso} <span className="text-sm text-slate-400 font-medium lowercase">dias</span></p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><Phone className="w-4 h-4" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest">Contato Efetivo</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{taxaContatoEfetivo}%</p>
        </div>
        <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg"><CheckCircle className="w-4 h-4" /></div>
            <h3 className="text-xs font-black uppercase tracking-widest">Acordos Mês</h3>
          </div>
          <p className="text-3xl font-black text-slate-800">{totalAcordos}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bairro Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col h-[400px]">
          <h3 className="text-sm font-black text-slate-700 tracking-tight mb-6 flex items-center gap-2">
             Inadimplência por Bairro (Top 10)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bairroChartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="bairro" type="category" width={100} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                  <LabelList dataKey="count" position="right" style={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} />
                  {bairroChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plano Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col h-[400px]">
          <h3 className="text-sm font-black text-slate-700 tracking-tight mb-6 flex items-center gap-2">
             Devedores por Plano
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planoChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={2} dataKey="value">
                  {planoChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 600, color: '#64748b'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Funnel & Critical Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Simple Funnel Replacement (Since Recharts doesn't have a native funnel, we use a vertical bar chart or a list) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl text-white">
          <h3 className="text-sm font-black text-white tracking-tight mb-6">Funil de Cobrança</h3>
          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-slate-400">Total Devedores</span><span className="text-sm font-black">{totalDevedores}</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-full"></div></div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-slate-400">Tentativas (Disparos/Lig.)</span><span className="text-sm font-black">{totalLigacoes}</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalLigacoes / (totalDevedores || 1)) * 100)}%` }}></div></div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-slate-400">Contatos Efetivos</span><span className="text-sm font-black">{totalContatosEfetivos}</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalContatosEfetivos / (totalLigacoes || 1)) * 100)}%` }}></div></div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
              <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold text-slate-400">Acordos Firmados</span><span className="text-sm font-black">{totalAcordos}</span></div>
              <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (totalAcordos / (totalContatosEfetivos || 1)) * 100)}%` }}></div></div>
            </div>
          </div>
        </div>

        {/* Critical Clients Table */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-700 tracking-tight">Lista Crítica (Top 10 Maior Atraso)</h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">Atenção Prioritária</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap rounded-l-xl">Cliente</th>
                  <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Bairro</th>
                  <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Atraso</th>
                  <th className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap rounded-r-xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {criticalClients.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3">
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{c.nomeCliente}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{c.plano}</p>
                    </td>
                    <td className="p-3 text-xs font-medium text-slate-500">{c.bairro}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md text-xs border border-rose-100">
                        {c.diasAtraso} d
                      </span>
                    </td>
                    <td className="p-3">
                      <button onClick={() => onOpenDetails(c)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors">
                        Detalhar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>


      {aiDiagnostic && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden mt-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-3xl rounded-full" />
          <h3 className="flex items-center gap-2 font-black text-indigo-900 text-lg mb-3">
            <Brain className="w-5 h-5 text-indigo-600" /> Diagnóstico Estratégico IA
          </h3>
          <div className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap font-medium relative z-10">
            {aiDiagnostic}
          </div>
        </div>
      )}
    </div>
  );
}