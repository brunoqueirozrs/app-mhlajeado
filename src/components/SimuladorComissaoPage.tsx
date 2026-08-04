import React, { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Award,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Info,
  ArrowRight,
  Layers,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
  Zap,
  Percent,
  UserCheck,
  Building2
} from "lucide-react";

interface SimuladorComissaoPageProps {
  onBackToDashboard?: () => void;
}

export function SimuladorComissaoPage({ onBackToDashboard }: SimuladorComissaoPageProps) {
  const [activeChannel, setActiveChannel] = useState<"PAP" | "AR" | "COMPARATIVO">("PAP");

  // State PAP Inputs
  const [papAtivacoes, setPapAtivacoes] = useState<number>(30);
  const [papTicketMedio, setPapTicketMedio] = useState<number>(100);
  const [papIncrementoUpgrade, setPapIncrementoUpgrade] = useState<number>(500);

  // State AR Inputs
  const [arAtivacoes, setArAtivacoes] = useState<number>(25);
  const [arTicketMedio, setArTicketMedio] = useState<number>(120);
  const [arIncrementoUpgrade, setArIncrementoUpgrade] = useState<number>(400);
  const [arAtingimentoRetencao, setArAtingimentoRetencao] = useState<number>(100);

  // Helper Currency Formatter
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(isNaN(val) ? 0 : val);
  };

  // Helper Percent Formatter
  const formatPercent = (val: number) => {
    return (val * 100).toFixed(2).replace(".", ",") + "%";
  };

  // ================= CALCULATION PAP =================
  const calculatePAP = () => {
    const ativ = Math.max(0, Math.floor(papAtivacoes || 0));
    const ticket = Math.max(0, papTicketMedio || 0);
    const upgrade = Math.max(0, papIncrementoUpgrade || 0);

    const faturamentoNovasVendas = ativ * ticket;

    // Percentual por faixa de ativações
    let pctAtivacoes = 0.30;
    let faixaNome = "0 a 25 ativações (Comissão Base - 30%)";
    let nivelBonus = "Base (30%)";

    if (ativ > 40) {
      pctAtivacoes = 0.45;
      faixaNome = "Mais de 40 ativações (Bônus Nível 2 - 45%)";
      nivelBonus = "Nível 2 (+50% bônus)";
    } else if (ativ >= 26) {
      pctAtivacoes = 0.375;
      faixaNome = "26 a 40 ativações (Bônus Nível 1 - 37,5%)";
      nivelBonus = "Nível 1 (+25% bônus)";
    }

    const comissaoAtivacoes = faturamentoNovasVendas * pctAtivacoes;
    const comissaoUpgrade = upgrade * 0.30;
    const comissaoTotal = comissaoAtivacoes + comissaoUpgrade;

    // Next Tier Calculation
    let proximaFaixaTexto = "";
    let ativacoesFaltantes = 0;
    if (ativ <= 25) {
      ativacoesFaltantes = 26 - ativ;
      proximaFaixaTexto = `Faltam ${ativacoesFaltantes} ativações para atingir 37.50% (Bônus Nível 1)`;
    } else if (ativ <= 40) {
      ativacoesFaltantes = 41 - ativ;
      proximaFaixaTexto = `Faltam ${ativacoesFaltantes} ativações para atingir 45.00% (Bônus Nível 2)`;
    } else {
      proximaFaixaTexto = "Você já atingiu o nível MÁXIMO de comissionamento! 🔥";
    }

    return {
      ativ,
      ticket,
      upgrade,
      faturamentoNovasVendas,
      pctAtivacoes,
      faixaNome,
      nivelBonus,
      comissaoAtivacoes,
      comissaoUpgrade,
      comissaoTotal,
      proximaFaixaTexto,
      ativacoesFaltantes
    };
  };

  // ================= CALCULATION AR =================
  const calculateAR = () => {
    const ativ = Math.max(0, Math.floor(arAtivacoes || 0));
    const ticket = Math.max(0, arTicketMedio || 0);
    const upgrade = Math.max(0, arIncrementoUpgrade || 0);
    const retencaoPct = Math.max(0, arAtingimentoRetencao || 0);

    const faturamentoNovasVendas = ativ * ticket;

    // Percentual por faixa de ativações
    let pctAtivacoes = 0.20;
    let faixaNome = "0 a 20 ativações (Comissão Base - 20%)";
    let nivelBonus = "Base (20%)";

    if (ativ > 40) {
      pctAtivacoes = 0.30;
      faixaNome = "Mais de 40 ativações (Bônus Nível 2 - 30%)";
      nivelBonus = "Nível 2 (+50% bônus)";
    } else if (ativ >= 21) {
      pctAtivacoes = 0.25;
      faixaNome = "21 a 40 ativações (Bônus Nível 1 - 25%)";
      nivelBonus = "Nível 1 (+25% bônus)";
    }

    const comissaoAtivacoes = faturamentoNovasVendas * pctAtivacoes;
    const comissaoUpgrade = upgrade * 0.20;

    // Retenção Calculation (Base R$ 200,00)
    let comissaoRetencao = 0;
    let statusRetencao = "";

    if (retencaoPct < 80) {
      comissaoRetencao = 0;
      statusRetencao = "Abaixo do gatilho mínimo (< 80%) = R$ 0,00";
    } else if (retencaoPct <= 120) {
      comissaoRetencao = 200 * (retencaoPct / 100);
      statusRetencao = `${retencaoPct}% da meta = ${formatCurrency(comissaoRetencao)}`;
    } else {
      comissaoRetencao = 200 * 1.20; // R$ 240,00 teto
      statusRetencao = `Teto máximo atingido (> 120%) = R$ 240,00`;
    }

    const comissaoTotal = comissaoAtivacoes + comissaoUpgrade + comissaoRetencao;

    // Next Tier Calculation
    let proximaFaixaTexto = "";
    let ativacoesFaltantes = 0;
    if (ativ <= 20) {
      ativacoesFaltantes = 21 - ativ;
      proximaFaixaTexto = `Faltam ${ativacoesFaltantes} ativações para atingir 25.00% (Bônus Nível 1)`;
    } else if (ativ <= 40) {
      ativacoesFaltantes = 41 - ativ;
      proximaFaixaTexto = `Faltam ${ativacoesFaltantes} ativações para atingir 30.00% (Bônus Nível 2)`;
    } else {
      proximaFaixaTexto = "Você já atingiu o nível MÁXIMO de comissionamento! 🔥";
    }

    return {
      ativ,
      ticket,
      upgrade,
      retencaoPct,
      faturamentoNovasVendas,
      pctAtivacoes,
      faixaNome,
      nivelBonus,
      comissaoAtivacoes,
      comissaoUpgrade,
      comissaoRetencao,
      statusRetencao,
      comissaoTotal,
      proximaFaixaTexto,
      ativacoesFaltantes
    };
  };

  const papData = calculatePAP();
  const arData = calculateAR();

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">Simulador de Comissionamento</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Canais PAP & AR
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Calcule os ganhos em reais de acordo com a meta de ativações, mensalidade média, upgrades e retenção.
              </p>
            </div>
          </div>

          {/* Preset buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setPapAtivacoes(20);
                setPapTicketMedio(100);
                setPapIncrementoUpgrade(300);
                setArAtivacoes(18);
                setArTicketMedio(110);
                setArIncrementoUpgrade(250);
                setArAtingimentoRetencao(90);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Meta Conservadora
            </button>
            <button
              onClick={() => {
                setPapAtivacoes(30);
                setPapTicketMedio(100);
                setPapIncrementoUpgrade(500);
                setArAtivacoes(28);
                setArTicketMedio(120);
                setArIncrementoUpgrade(400);
                setArAtingimentoRetencao(100);
              }}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-sky-600/20"
            >
              Desempenho Padrão
            </button>
            <button
              onClick={() => {
                setPapAtivacoes(45);
                setPapTicketMedio(120);
                setPapIncrementoUpgrade(800);
                setArAtivacoes(42);
                setArTicketMedio(130);
                setArIncrementoUpgrade(700);
                setArAtingimentoRetencao(120);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Super Atingimento 🔥
            </button>
          </div>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveChannel("PAP")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeChannel === "PAP"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Canal PAP (Porta a Porta)
          </button>
          <button
            onClick={() => setActiveChannel("AR")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeChannel === "AR"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Canal AR (Alto Rendimento)
          </button>
          <button
            onClick={() => setActiveChannel("COMPARATIVO")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeChannel === "COMPARATIVO"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                : "bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            Comparativo Lado a Lado
          </button>
        </div>
      </div>

      {/* Main Content by Channel */}
      {activeChannel === "PAP" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: PAP Inputs */}
          <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <UserCheck className="w-5 h-5 text-sky-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Parâmetros de Entrada - PAP
              </h2>
            </div>

            {/* Input 1: Ativações */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  1. Quantidade de Ativações (Novos Clientes)
                </label>
                <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                  {papAtivacoes} ativações
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={papAtivacoes}
                onChange={(e) => setPapAtivacoes(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0</span>
                <span>25 (Base 30%)</span>
                <span>40 (Nível 1 - 37.5%)</span>
                <span>80+ (Nível 2 - 45%)</span>
              </div>
            </div>

            {/* Input 2: Ticket Médio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  2. Ticket Médio da Mensalidade (R$)
                </label>
                <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                  {formatCurrency(papTicketMedio)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={papTicketMedio}
                  onChange={(e) => setPapTicketMedio(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Input 3: Incremento Upgrade e SVAs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  3. Incremento de Upgrade e SVAs (R$)
                </label>
                <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-200 dark:border-sky-800">
                  {formatCurrency(papIncrementoUpgrade)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={papIncrementoUpgrade}
                  onChange={(e) => setPapIncrementoUpgrade(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Receita incremental gerada na base atual (Upgrade de planos e vendas de SVAs).
              </p>
            </div>

            {/* Tiers Rules Guide */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-sky-500" /> Tabela de Alíquotas PAP
              </h3>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">0 a 25 ativações (Comissão Base)</span>
                  <strong className="text-sky-500 font-mono">30,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">26 a 40 ativações (Bônus Nível 1)</span>
                  <strong className="text-sky-500 font-mono">37,50%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Acima de 40 ativações (Bônus Nível 2)</span>
                  <strong className="text-sky-500 font-mono">45,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Upgrade & SVAs (Fixo)</span>
                  <strong className="text-emerald-500 font-mono">30,00%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: PAP Results */}
          <div className="lg:col-span-7 space-y-5">
            {/* Total Hero Banner */}
            <div className="bg-gradient-to-tr from-sky-600 to-sky-500 p-6 rounded-3xl text-white shadow-lg shadow-sky-600/20 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-100">
                    Comissão Total Estimada (PAP)
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-1">
                    {formatCurrency(papData.comissaoTotal)}
                  </h2>
                </div>
                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20">
                  Faixa: {papData.nivelBonus}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-sky-100 text-[11px]">Faturamento Novas Vendas:</span>
                  <p className="font-bold text-sm">{formatCurrency(papData.faturamentoNovasVendas)}</p>
                </div>
                <div>
                  <span className="text-sky-100 text-[11px]">Alíquota Aplicada:</span>
                  <p className="font-bold text-sm">{formatPercent(papData.pctAtivacoes)}</p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Detalhamento dos Cálculos - PAP
              </h3>

              <div className="space-y-3">
                {/* Ativações */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        Comissão por Ativações ({papData.ativ} clientes × {formatCurrency(papData.ticket)})
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Faturamento: {formatCurrency(papData.faturamentoNovasVendas)} × {formatPercent(papData.pctAtivacoes)}
                    </p>
                  </div>
                  <span className="text-sm font-black text-sky-600 dark:text-sky-400 font-mono">
                    {formatCurrency(papData.comissaoAtivacoes)}
                  </span>
                </div>

                {/* Upgrade e SVAs */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        Comissão por Upgrade & SVAs ({formatCurrency(papData.upgrade)})
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Percentual fixo de 30,00% sobre incremento
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(papData.comissaoUpgrade)}
                  </span>
                </div>
              </div>

              {/* Next Tier Progress Bar */}
              <div className="p-4 bg-sky-950/20 border border-sky-800/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" /> Próximo Nível de Bônus
                  </span>
                  <span className="text-[11px] text-sky-400 font-bold">
                    {papData.proximaFaixaTexto}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Canal AR */}
      {activeChannel === "AR" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: AR Inputs */}
          <div className="lg:col-span-5 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Parâmetros de Entrada - AR (Alto Rendimento)
              </h2>
            </div>

            {/* Input 1: Ativações */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  1. Quantidade de Ativações (Novos Clientes)
                </label>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {arAtivacoes} ativações
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={arAtivacoes}
                onChange={(e) => setArAtivacoes(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0</span>
                <span>20 (Base 20%)</span>
                <span>40 (Nível 1 - 25%)</span>
                <span>80+ (Nível 2 - 30%)</span>
              </div>
            </div>

            {/* Input 2: Ticket Médio */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  2. Ticket Médio da Mensalidade (R$)
                </label>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {formatCurrency(arTicketMedio)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={arTicketMedio}
                  onChange={(e) => setArTicketMedio(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Input 3: Incremento Upgrade e SVAs */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  3. Incremento de Upgrade e SVAs (R$)
                </label>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {formatCurrency(arIncrementoUpgrade)}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">R$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={arIncrementoUpgrade}
                  onChange={(e) => setArIncrementoUpgrade(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Input 4: Atingimento da Meta de Retenção */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  4. % Atingimento Meta de Retenção
                </label>
                <span className="font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                  {arAtingimentoRetencao}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                value={arAtingimentoRetencao}
                onChange={(e) => setArAtingimentoRetencao(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0% (R$ 0)</span>
                <span>80% (Gatilho R$ 160)</span>
                <span>100% (R$ 200)</span>
                <span>120%+ (Teto R$ 240)</span>
              </div>
            </div>

            {/* Rules Guide AR */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-500" /> Tabela de Alíquotas AR
              </h3>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">0 a 20 ativações (Comissão Base)</span>
                  <strong className="text-emerald-500 font-mono">20,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">21 a 40 ativações (Bônus Nível 1)</span>
                  <strong className="text-emerald-500 font-mono">25,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Acima de 40 ativações (Bônus Nível 2)</span>
                  <strong className="text-emerald-500 font-mono">30,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Upgrade & SVAs (Fixo)</span>
                  <strong className="text-emerald-500 font-mono">20,00%</strong>
                </div>
                <div className="flex justify-between p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Retenção (Base R$ 200, Gatilho 80-120%)</span>
                  <strong className="text-amber-500 font-mono">Até R$ 240,00</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AR Results */}
          <div className="lg:col-span-7 space-y-5">
            {/* Total Hero Banner AR */}
            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-6 rounded-3xl text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">
                    Comissão Total Estimada (AR)
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black mt-1">
                    {formatCurrency(arData.comissaoTotal)}
                  </h2>
                </div>
                <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold border border-white/20">
                  Faixa: {arData.nivelBonus}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-emerald-100 text-[11px]">Faturamento Novas Vendas:</span>
                  <p className="font-bold text-sm">{formatCurrency(arData.faturamentoNovasVendas)}</p>
                </div>
                <div>
                  <span className="text-emerald-100 text-[11px]">Alíquota Aplicada:</span>
                  <p className="font-bold text-sm">{formatPercent(arData.pctAtivacoes)}</p>
                </div>
              </div>
            </div>

            {/* Detailed Breakdown Card AR */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                Detalhamento dos Cálculos - AR
              </h3>

              <div className="space-y-3">
                {/* Ativações */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        Comissão por Ativações ({arData.ativ} clientes × {formatCurrency(arData.ticket)})
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Faturamento: {formatCurrency(arData.faturamentoNovasVendas)} × {formatPercent(arData.pctAtivacoes)}
                    </p>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {formatCurrency(arData.comissaoAtivacoes)}
                  </span>
                </div>

                {/* Upgrade e SVAs */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        Comissão por Upgrade & SVAs ({formatCurrency(arData.upgrade)})
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      Percentual fixo de 20,00% sobre incremento
                    </p>
                  </div>
                  <span className="text-sm font-black text-teal-600 dark:text-teal-400 font-mono">
                    {formatCurrency(arData.comissaoUpgrade)}
                  </span>
                </div>

                {/* Retenção */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <strong className="text-xs text-slate-800 dark:text-slate-200">
                        Comissão de Retenção ({arData.retencaoPct}% da Meta)
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-4">
                      {arData.statusRetencao}
                    </p>
                  </div>
                  <span className="text-sm font-black text-amber-600 dark:text-amber-400 font-mono">
                    {formatCurrency(arData.comissaoRetencao)}
                  </span>
                </div>
              </div>

              {/* Next Tier Progress Bar */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Próximo Nível de Bônus
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    {arData.proximaFaixaTexto}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content: Comparativo Lado a Lado */}
      {activeChannel === "COMPARATIVO" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PAP Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Canal PAP (Porta a Porta)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-sky-500 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 rounded-lg">
                  {papData.nivelBonus}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Ativações:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{papData.ativ} clientes ({formatCurrency(papData.ticket)})</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Alíquota Ativação:</span>
                  <strong className="text-sky-500 font-mono">{formatPercent(papData.pctAtivacoes)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Ativações:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(papData.comissaoAtivacoes)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Upgrade/SVA (30%):</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(papData.comissaoUpgrade)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Retenção:</span>
                  <span className="text-slate-400 italic">Não aplicável</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">TOTAL PAP:</span>
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                  {formatCurrency(papData.comissaoTotal)}
                </span>
              </div>
            </div>

            {/* AR Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Canal AR (Alto Rendimento)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  {arData.nivelBonus}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Ativações:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{arData.ativ} clientes ({formatCurrency(arData.ticket)})</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Alíquota Ativação:</span>
                  <strong className="text-emerald-500 font-mono">{formatPercent(arData.pctAtivacoes)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Ativações:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(arData.comissaoAtivacoes)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Upgrade/SVA (20%):</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(arData.comissaoUpgrade)}</strong>
                </div>
                <div className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Comissão Retenção ({arData.retencaoPct}%):</span>
                  <strong className="text-amber-500 font-mono">{formatCurrency(arData.comissaoRetencao)}</strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">TOTAL AR:</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatCurrency(arData.comissaoTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SimuladorComissaoPage;
