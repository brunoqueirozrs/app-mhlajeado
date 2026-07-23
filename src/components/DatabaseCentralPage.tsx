import React from 'react';
import { Database, FileSpreadsheet, Server, Cloud, ShieldCheck, ArrowRight, Layers, LayoutGrid } from 'lucide-react';

export default function DatabaseCentralPage() {
  return (
    <div className="flex-1 p-8 lg:p-12 overflow-y-auto bg-slate-50 relative min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center border border-sky-200">
              <Database className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">Central de Base de Dados</h1>
              <p className="text-slate-500 font-medium mt-1">
                Mapeamento da arquitetura de dados e locais de armazenamento do sistema.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* GOOGLE SHEETS */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <FileSpreadsheet className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center border border-emerald-200">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Google Sheets</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 relative z-10">
              Utilizado para armazenar dados operacionais que necessitam de edição rápida em massa ou relatórios legados. Atua através de endpoints de exportação CSV.
            </p>

            <div className="space-y-4 relative z-10">
              <ModuleItem 
                title="Leads PAP & Frios" 
                desc="Armazena o histórico e cadastro de todos os Leads da prospecção." 
                sheetTab="Leads PAP, Tratativas, Leads Frios" />
              <ModuleItem 
                title="Agenda de Instalações" 
                desc="Controle de vendas convertidas que necessitam de instalação, e fila de monitoramento." 
                sheetTab="Agenda Instalação, Fila de Monitoramento" />
              <ModuleItem 
                title="Acompanhamento de Protocolos" 
                desc="Listagem de protocolos internos pendentes de atendimento." 
                sheetTab="Protocolos Internos" />
              <ModuleItem 
                title="Minhas Tarefas" 
                desc="Tarefas diárias dos vendedores e rotinas." 
                sheetTab="Tarefas" />
              <ModuleItem 
                title="Viabilidade (FTTA)" 
                desc="Casas mapeadas e lotes de rede de fibra." 
                sheetTab="Lajeado, Estrela, Prospecção" />
              <ModuleItem 
                title="Controle de Cobranças" 
                desc="Boletos vencidos e negociações." 
                sheetTab="Cobrancas" />
              <ModuleItem 
                title="Vendedores/Colaboradores" 
                desc="Apenas a lista base de nomes dos vendedores logados e suas metas." 
                sheetTab="Vendedores" />
            </div>
          </div>

          {/* FIREBASE (FIRESTORE) */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5">
              <Cloud className="w-32 h-32" />
            </div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center border border-amber-200">
                <Cloud className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Firebase (Firestore)</h2>
            </div>

            <p className="text-sm text-slate-600 mb-6 relative z-10">
              Banco de dados NoSQL robusto e seguro. Armazena dados sensíveis e estruturais dos colaboradores (Gestão de Pessoas / RH) e históricos da Inteligência Artificial.
            </p>

            <div className="space-y-4 relative z-10">
              <ModuleItem 
                title="Testes DISC" 
                desc="Armazena os perfis comportamentais (Águia, Lobo, Gato, Tubarão) e notas D,I,S,C." 
                sheetTab="Collection: disc_results" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Plano de Desenvolvimento (PDI)" 
                desc="Planos de ação e metas vinculadas a cada vendedor." 
                sheetTab="Collection: pdis" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Raio-X de IA" 
                desc="Análises textuais geradas pela IA e recomendações por colaborador." 
                sheetTab="Collection: raioxes" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Avaliação de Competências" 
                desc="Radar de habilidades e notas gerenciais." 
                sheetTab="Collection: competencias" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Perfil Comercial" 
                desc="Taxas de conversão, gargalos e pontos fortes/fracos no campo." 
                sheetTab="Collection: perfil_comerciais" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Histórico do Roleplay IA" 
                desc="Conversas simuladas com os clientes e avaliações finais dadas pelo Agente." 
                sheetTab="Collections: roleplay_messages, roleplay_evaluations" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
              <ModuleItem 
                title="Auditoria de Testes" 
                desc="Logs de todos os testes finalizados na plataforma." 
                sheetTab="Collection: test_results" 
                icon={<Database className="w-4 h-4 text-amber-500" />} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ModuleItem = ({ title, desc, sheetTab, icon }: { title: string, desc: string, sheetTab: string, icon?: React.ReactNode }) => (
  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-200 transition-colors">
    <div className="mt-1 shrink-0">
      {icon ? icon : <Layers className="w-4 h-4 text-slate-400" />}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 mb-2">{desc}</p>
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-200/50 text-[10px] font-bold text-slate-600">
        <ArrowRight className="w-3 h-3" />
        {sheetTab}
      </div>
    </div>
  </div>
);
