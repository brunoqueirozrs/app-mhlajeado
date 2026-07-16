/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, Activity, Award, Calendar, BarChart, ArrowRight,
  TrendingDown, Check, UserCheck, Crown, Landmark
} from "lucide-react";
import { Lead } from "../types";

interface IndicatorsPageProps {
  isAdmin: boolean;
  loggedUser: string;
  leads: Lead[];
}

export default function IndicatorsPage({
  isAdmin,
  loggedUser,
  leads
}: IndicatorsPageProps) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [indicadores, setIndicadores] = useState({
    periodo: "",
    totalGeral: 0,
    vendasGeral: 0,
    totalLeadsHoje: 0,
    ranking: [] as { nome: string; totalLeads: number; leadsHoje: number; vendas: number; conversao: number }[],
    rankingBairros: [] as { nome: string; quantidade: number }[],
    serieDiaria: [] as { dia: string; leads: number }[]
  });

  // Calculate local statistics based on global leads array
  useEffect(() => {
    // Current period
    const agora = new Date();
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const periodoStr = `${meses[agora.getMonth()]} de ${agora.getFullYear()}`;
    const hojeStr = agora.toLocaleDateString("pt-BR");

    // Helper for case-and-accent-insensitive seller matchmaking
    const matchSeller = (leadSeller: string, user: string) => {
      if (!leadSeller || !user) return false;
      const s = leadSeller.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const u = user.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      return s === u || s.includes(u) || u.includes(s);
    };

    // Filter leads depending on user role
    const relevantLeads = isAdmin ? leads : leads.filter(l => matchSeller(l.vendedor, loggedUser));

    const totalCount = relevantLeads.length;
    const closedCount = relevantLeads.filter(l => l.status === "Venda Fechada").length;
    const leadsHoje = relevantLeads.filter(l => l.dataCadastro === hojeStr || l.ultimaAtualizacao?.includes(hojeStr)).length;

    // Series for last 7 days
    const dailySeriesMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(agora.getDate() - i);
      const str = d.toLocaleDateString("pt-BR");
      dailySeriesMap[str] = 0;
    }

    relevantLeads.forEach(e => {
      const dt = e.dataCadastro || e.ultimaAtualizacao?.split(" ")[0];
      if (dt && dailySeriesMap[dt] !== undefined) {
        dailySeriesMap[dt]++;
      }
    });

    const serieDiaria = Object.keys(dailySeriesMap).map(k => ({
      dia: k,
      leads: dailySeriesMap[k]
    }));

    // Create Ranking if admin
    let ranking: typeof indicadores.ranking = [];
    let rankingBairros: { nome: string; quantidade: number }[] = [];
    
    // Calculate Bairros Ranking
    const bairrosCount: Record<string, number> = {};
    relevantLeads.forEach(l => {
      const b = l.bairro?.trim() || "Não informado";
      bairrosCount[b] = (bairrosCount[b] || 0) + 1;
    });
    
    rankingBairros = Object.keys(bairrosCount).map(b => ({
      nome: b,
      quantidade: bairrosCount[b]
    })).sort((a, b) => b.quantidade - a.quantidade).slice(0, 5); // top 5 bairros

    if (isAdmin) {
      // Find list of sellers
      const salespeople = Array.from(new Set(leads.map(l => l.vendedor).filter(Boolean)));
      ranking = salespeople.map(v => {
        const vLeads = leads.filter(l => l.vendedor === v);
        const vLeadsHoje = vLeads.filter(l => l.dataCadastro === hojeStr || l.ultimaAtualizacao?.includes(hojeStr)).length;
        const vVendas = vLeads.filter(l => l.status === "Venda Fechada").length;
        const conv = vLeads.length > 0 ? Math.round((vVendas / vLeads.length) * 100) : 0;
        return {
          nome: v,
          totalLeads: vLeads.length,
          leadsHoje: vLeadsHoje,
          vendas: vVendas,
          conversao: conv
        };
      }).sort((a, b) => b.vendas - a.vendas);
    }

    setIndicadores({
      periodo: periodoStr,
      totalGeral: totalCount,
      vendasGeral: closedCount,
      totalLeadsHoje: leadsHoje,
      ranking,
      rankingBairros,
      serieDiaria
    });
  }, [leads, isAdmin, loggedUser]);

  // SVG dimensions for chart
  const maxVal = Math.max(...indicadores.serieDiaria.map(s => s.leads), 1);
  const chartHeight = 70;
  const barWidth = 32;
  const gap = 12;

  return (
    <div id="indicators-viewport" className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-805 tracking-tight flex items-center gap-1.5 leading-none">
          <Activity className="w-5 h-5 text-sky-90">Análise e Indicadores</Activity>
        </h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-wider flex items-center gap-1">
          <Calendar className="w-4.5 h-4.5 text-slate-350" />
          Mês de Referência: {indicadores.periodo}
        </p>
      </div>

      {/* comparative KPI indicators widgets */}
      <div id="funnel-cards-area" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI Lead registrations */}
        <div className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase text-slate-400">Total de Leads</span>
            <span className="text-xl font-black text-sky-90">{indicadores.totalGeral}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-700 to-sky-500 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase pl-1.5 flex justify-between">
            <span>Objetivo do Mês</span>
            <span className="text-sky-850">Ativo</span>
          </div>
        </div>

        {/* KPI closed deals sales */}
        <div className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase text-slate-400">Vendas Fechadas</span>
            <span className="text-xl font-black text-emerald-650">{indicadores.vendasGeral}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-300" 
              style={{ width: `${indicadores.totalGeral > 0 ? (indicadores.vendasGeral / indicadores.totalGeral) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase pl-1.5 flex justify-between">
            <span>Taxa de Conversão</span>
            <span className="text-emerald-700 font-bold">
              {indicadores.totalGeral > 0 ? Math.round((indicadores.vendasGeral / indicadores.totalGeral) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* KPI leads checked today */}
        <div className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase text-slate-400">Ações Realizadas Hoje</span>
            <span className="text-xl font-black text-blue-900">{indicadores.totalLeadsHoje}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-900 to-blue-400 h-full rounded-full" style={{ width: "100%" }}></div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase pl-1.5 flex justify-between">
            <span>Leads salvos nas últimas 24h</span>
            <span className="text-blue-600 font-bold">Hoje</span>
          </div>
        </div>
      </div>

      {/* Mini SVG inline bar charts detailing records */}
      <div id="serie-diaria-chart" className="card-modern border border-slate-105 rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase text-slate-400 leading-none">Produtividade Semanal (Últimos 7 dias)</h3>
        
        <div className="overflow-x-auto pb-2 scrollbar-none flex justify-center">
          <svg 
            width={indicadores.serieDiaria.length * (barWidth + gap) - gap} 
            height={chartHeight + 25} 
            className="font-sans"
            style={{ minWidth: "280px" }}
          >
            {indicadores.serieDiaria.map((s, idx) => {
              const rectH = Math.max(4, Math.round((s.leads / maxVal) * chartHeight));
              const xPos = idx * (barWidth + gap);
              const yPos = chartHeight - rectH + 5;
              const isToday = s.dia === new Date().toLocaleDateString("pt-BR");

              return (
                <g key={idx}>
                  {/* Bar */}
                  <rect
                    x={xPos}
                    y={yPos}
                    width={barWidth}
                    height={rectH}
                    rx="3"
                    className={`${isToday ? "fill-sky-850" : "fill-slate-300 opacity-60"}`}
                  />
                  {/* Lead value above bar */}
                  {s.leads > 0 && (
                    <text
                      x={xPos + barWidth / 2}
                      y={yPos - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      className="fill-slate-650"
                    >
                      {s.leads}
                    </text>
                  )}
                  {/* Day label below base */}
                  <text
                    x={xPos + barWidth / 2}
                    y={chartHeight + 18}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="extrabold"
                    className="fill-slate-400 uppercase"
                  >
                    {s.dia.split("/")[0]}/{s.dia.split("/")[1]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Admin leaderboard panel ranking of sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAdmin && indicadores.ranking.length > 0 && (
          <div id="admin-ranking-panel" className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-450 leading-none flex items-center gap-1">
              <Crown className="w-4 h-4 text-amber-500" />
              Ranking Comercial da Equipe
            </h3>

            <div className="space-y-2">
              {indicadores.ranking.map((sales, pos) => {
                const isFirst = pos === 0;
                return (
                  <div 
                    key={sales.nome} 
                    className={`border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                      isFirst ? "bg-amber-50/50 border-amber-200" : "bg-white border-slate-100"
                    }`}
                  >
                    {/* Circle Position placement */}
                    <div className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center text-white ${
                      isFirst ? "bg-amber-500" : pos === 1 ? "bg-slate-400" : "bg-slate-300"
                    }`}>
                      {pos + 1}
                    </div>

                    {/* Seller Details */}
                    <div className="flex-1 min-width-0">
                      <p className="text-xs font-black text-slate-800 tracking-tight pl-0.5 truncate">{sales.nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        {sales.totalLeads} leads total | {sales.leadsHoje} hoje | conv. {sales.conversao}%
                      </p>
                    </div>

                    {/* Closed Volume Sales counts */}
                    <div className="text-right">
                      <p className="text-base font-black text-sky-950 tracking-tight pr-0.5">{sales.vendas}</p>
                      <p className="text-[8px] text-slate-400 font-extrabold uppercase">Vendas</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bairros Ranking Panel */}
        {indicadores.rankingBairros.length > 0 && (
          <div id="bairros-ranking-panel" className="card-modern border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-450 leading-none flex items-center gap-1">
              <Landmark className="w-4 h-4 text-[#00A86B]" />
              Top Bairros (Leads)
            </h3>

            <div className="space-y-2">
              {indicadores.rankingBairros.map((bairro, pos) => {
                const isFirst = pos === 0;
                return (
                  <div 
                    key={bairro.nome} 
                    className={`border rounded-xl p-3.5 flex items-center gap-3 transition-colors ${
                      isFirst ? "bg-[#E6FAF1]/50 border-emerald-200" : "bg-white border-slate-100"
                    }`}
                  >
                    {/* Circle Position placement */}
                    <div className={`w-6 h-6 rounded-full font-black text-xs flex items-center justify-center text-white ${
                      isFirst ? "bg-emerald-500" : pos === 1 ? "bg-emerald-400" : "bg-slate-300"
                    }`}>
                      {pos + 1}
                    </div>

                    {/* Bairro Details */}
                    <div className="flex-1 min-width-0">
                      <p className="text-xs font-black text-slate-800 tracking-tight pl-0.5 truncate">{bairro.nome}</p>
                    </div>

                    {/* Quantity */}
                    <div className="text-right">
                      <p className="text-base font-black text-emerald-700 tracking-tight pr-0.5">{bairro.quantidade}</p>
                      <p className="text-[8px] text-slate-400 font-extrabold uppercase">Leads</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
