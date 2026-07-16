import React, { useState } from "react";
import { Calculator, ArrowLeft, RefreshCw, FileText } from "lucide-react";

interface CalculoMultaPageProps {
  onBackToDashboard: () => void;
}

export default function CalculoMultaPage({ onBackToDashboard }: CalculoMultaPageProps) {
  const [valorBeneficio, setValorBeneficio] = useState<number | "">("");
  const [dataContratacao, setDataContratacao] = useState("");
  const [dataCancelamento, setDataCancelamento] = useState("");

  const calcularMulta = () => {
    if (!valorBeneficio || !dataContratacao || !dataCancelamento) return null;

    const dataIni = new Date(dataContratacao);
    const dataFim = new Date(dataCancelamento);

    if (dataFim < dataIni) return 0;

    // Calcular meses totais do contrato até o cancelamento
    const diffTime = Math.abs(dataFim.getTime() - dataIni.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Meses cumpridos
    const mesesCumpridos = Math.floor(diffDays / 30);
    
    // Total de meses de fidelidade: 12
    const totalFidelidade = 12;

    if (mesesCumpridos >= totalFidelidade) {
        return 0; // Se cumpriu os 12 meses, não há multa
    }

    // O símbolo MR corresponde ao número total de meses restantes
    const mesesRestantes = totalFidelidade - mesesCumpridos;

    // Fórmula: M = (VTB ÷ MF) × MR
    // M: Multa
    // VTB: Valor Total Beneficio
    // MF: Meses Fidelidade (12)
    // MR: Meses Restantes
    return (Number(valorBeneficio) / totalFidelidade) * mesesRestantes;
  };

  const limpar = () => {
    setValorBeneficio("");
    setDataContratacao("");
    setDataCancelamento("");
  };

  const multaCalculada = calcularMulta();

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToDashboard} 
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition cursor-pointer lg:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Cálculo de Multa</h1>
            <p className="text-[11px] text-slate-500 font-semibold mt-1">
              Auxílio rápido para o vendedor administrativo simular o cancelamento.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="card-modern border border-slate-200 rounded-[24px] shadow-sm overflow-hidden flex flex-col md:flex-row">
            
            {/* Formulário Input */}
            <div className="p-6 md:w-1/2 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50">
              <h2 className="text-sm font-black uppercase text-slate-700 mb-5 tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Inserir Dados
              </h2>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block ml-0.5">
                    Valor do Benefício Concedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 500.00"
                    className="w-full card-modern border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-400 transition"
                    value={valorBeneficio}
                    onChange={e => setValorBeneficio(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  <p className="text-[9px] text-slate-400 leading-tight block pt-0.5 pl-0.5">
                    Inclui benefícios mensais e descontos de instalação.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block ml-0.5">
                    Data de Contratação
                  </label>
                  <input
                    type="date"
                    className="w-full card-modern border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-400 transition"
                    value={dataContratacao}
                    onChange={e => setDataContratacao(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block ml-0.5">
                    Data de Cancelamento
                  </label>
                  <input
                    type="date"
                    className="w-full card-modern border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-400 transition"
                    value={dataCancelamento}
                    onChange={e => setDataCancelamento(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={limpar}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 uppercase tracking-wider px-3 py-2 transition flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Limpar Dados
                  </button>
                </div>
              </div>
            </div>

            {/* Resultado Visual Output */}
            <div className="p-6 md:w-1/2 bg-white flex flex-col justify-center items-center text-center">
              <h2 className="text-xs font-black uppercase text-sky-600 tracking-widest mb-2">
                Simulação de Multa
              </h2>

              {multaCalculada !== null ? (
                <div className="w-full space-y-4 animate-fade-in my-6">
                  <div className="text-4xl md:text-5xl font-black font-mono text-slate-900 tracking-tighter">
                    R$ {multaCalculada > 0 ? multaCalculada.toFixed(2) : "0,00"}
                  </div>
                  
                  {multaCalculada === 0 ? (
                    <div className="inline-block bg-[#E6FAF1] text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#00A86B]/20">
                      Período de fidelidade já cumprido.
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-medium px-4 text-center">
                      Valor apurado considerando rescisão antecipada.
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full py-10 px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center mb-3">
                    <Calculator className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Preencha os dados ao lado para exibir a prévia da multa cobrada do cliente.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Regra Cláusulas Legais (Visualização) */}
          <div className="bg-slate-800 text-slate-300 p-5 rounded-[20px] shadow-sm text-xs leading-relaxed space-y-3 font-sans border border-slate-700">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" /> Referência Contratual
            </h3>
            <p className="opacity-90">
              <strong>Cláusula 3.2:</strong> Caso ocorra a rescisão contratual, a pedido do CLIENTE, antes de completado o período de fidelização (12 meses), o CLIENTE se compromete a pagar em favor da CONTRATADA uma multa penal, apurada de acordo com a fórmula:
            </p>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 text-sky-300 font-mono font-bold tracking-tight inline-block">
              M = (VTB ÷ MF) × MR
            </div>
            <ul className="space-y-1 opacity-80 pt-1">
              <li><strong>M:</strong> Multa a ser paga.</li>
              <li><strong>VTB:</strong> Valor total dos benefícios concedidos.</li>
              <li><strong>MF:</strong> Meses de fidelidade (12).</li>
              <li><strong>MR:</strong> Meses restantes para completar o prazo.</li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}
