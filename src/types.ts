/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vendor {
  id?: string;
  nome: string;
  meta: number;
  telefone?: string;
}

export interface Lead {
  _linha: number;
  nomeLead: string;
  vendedor: string;
  telefone: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  provedor?: string;
  valorPlano?: string | number;
  planoAtual?: string;
  fidelidade?: string;
  interesse?: 'Alto' | 'Médio' | 'Baixo';
  status: 'Novo' | 'Agendado' | 'Negociação' | 'Venda Fechada' | 'Sem Interesse' | 'Frio';
  observacao?: string;
  dataCadastro?: string;
  ultimaAtualizacao?: string;
  agendamento?: string;
  objecao?: string;
  respostaObjecao?: string;
}

export interface Task {
  id: string;
  vendedor: string;
  descricao: string;
  dataLimite?: string;
  nomeLead?: string;
  status: 'PENDENTE' | 'CONCLUIDA';
  n8nNotified30m?: boolean;
  n8nNotified1h?: boolean;
  n8nNotified2h?: boolean;
}

export interface Absence {
  id?: string;
  vendedor: string;
  dataFalta: string;
  motivo: string;
  observacao?: string;
  status?: string;
  link?: string;
}

export interface FttaItem {
  _linha: number;
  nomeBloco: string;
  sindico?: string;
  contato?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  ultimaVisita?: string;
  proximaVisita?: string;
  alertaVisita?: boolean;
  administradora?: string;
  fotoFachada?: string;
}

export interface FttaProspeccao {
  _linha: number;
  nome: string;
  construtora?: string;
  sindico?: string;
  contato?: string;
  endereco?: string;
  bairro?: string;
  cidade?: string;
  consultor?: string;
  dataEntrega?: string;
  ultimaAcao?: string;
  proximaAcaoCalc?: string;
  alertaProxAcao?: boolean;
  diasParaAcao?: number;
  adquado?: string;
}

export interface Competitor {
  id?: string;
  _linha?: number;
  name: string;
  sigla: string;
  cor?: string;
  type?: string;
  mhnet?: string;
  pros: string[];
  cons: string[];
}

export interface BaseClient {
  idContrato: string;
  nome: string;
  plano: string;
  velocidadeMb?: number;
  valor: number;
  dataAtivacao?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  status?: string;
  motivoCancelamento?: string;
  consultorOrigem?: string;
  telefoneExterno?: string;
  cpf?: string;
  meses?: number;
  score?: number;
  canal?: string;
  prioridade?: 'urgente' | 'oportunidade' | 'neutro';
}

export interface BaseActionLog {
  id: string;
  idContrato: string;
  consultor: string;
  statusContato: string;
  resultado: string;
  planoAnterior?: string;
  planoNovo?: string;
  valorAnterior?: number;
  valorNovo?: number;
  deltaValor?: number;
  observacao?: string;
  dataContato: string;
  requerAtuacao?: boolean;
  dataRetorno?: string;
}

export interface SyncItem {
  route: string;
  payload: any;
  timestamp: number;
}

export interface Cobranca {
  // Controle / N8N
  idContrato: string; // Código do Cliente (C)
  statusEnvio?: string; // Status do Envio (A)
  
  // Informações do cliente
  nomeCliente: string; // Cliente (D)
  cpfCnpj?: string; // CPF/CNPJ (B)
  telefone: string; // telefone (H)
  celular?: string; // celular (I)
  
  // Dados de Contrato e Fatura
  dataAtivacao?: string; // Data da Ativação (T)
  numeroFaturas?: number; // Total Faturas Vencidas por Contrato (AE)
  baixouApp?: string; // Baixou APP (E)
  plano: string; // Descrição Produto Contrato (AO)
  situacaoContrato?: string; // Situação do Contrato (W)
  estagioContrato?: string; // Estágio Atual do Contrato (X)
  
  // Endereço e Regional
  cidade: string; // Cidade (J)
  bairro?: string; // Bairro do Cliente (K)
  regional?: string; // Regional (M)
  
  // Valores e Vencimento
  valor: number; // Valor de Saldo (AB)
  dataVencimento: string; // Data Vencimento Original (AC)
  diasAtraso: number; // Dias Intervalo Hoje - Vencimento (AD)
  
  // Controle interno UI (retro-compatibilidade com UI antiga)
  status: "Pendente" | "Vencido" | "Pago" | "Negociando";
  dataPagamento?: string;
  consultor?: string; // Vendedor (R)
  acaoEnvio?: string;
  campanha?: string;
  canal?: string;
  formaPagamento?: string;
  observacao?: string;
  historicoContatos: CobrancaLog[];
}

export interface CobrancaLog {
  dataLog: string;
  operador: string;
  tipo: string;
  descricao: string;
  contatoEfetivo?: boolean;
  acordoFirmado?: boolean;
  motivoInadimplencia?: string;
}

export interface Installation {
  id: string;
  nomeCliente: string;
  telefone: string;
  endereco: string;
  cidade: string;
  cpf?: string;
  vendedorResponsavel: string;
  gerenteResponsavel: string;
  planoEscolhido: string;
  dataAgendamento: string;
  horario: string;
  status: 'Pendente' | 'Confirmada' | 'Instalada' | 'Cancelada' | 'Reagendada';
  observacao?: string;
  equipeLoja?: string;
  dataCriacao?: string;
  aiNotificationMessage?: string;
  protocolRaw?: string;
  slotIndex?: number;
  coordenadas?: string;
  atividade?: string;
}

export interface TradeAction {
  id: string;
  dataAcao: string;
  horaAcao: string;
  tipo: string;
  localNome: string;
  endereco: string;
  cidade: string;
  bairro: string;
  vendedora: string;
  leadsCaptados: number;
  nota: number;
  fornecedorNome: string;
  fornecedorContato: string;
  parceiroNome: string;
  parceiroContato: string;
  parceiroFixo: boolean;
  observacoes: string;
  registradoPor: string;
  dataRegistro: string;
}


// --- GESTÃO DE PESSOAS ---

export interface DiscQuestion {
  bloco: number;
  opcoes: { fator: "D" | "I" | "S" | "C"; frase: string }[];
}

export interface DiscResult {
  id: string;
  vendorId: string;
  data: string;
  d: number;
  i: number;
  s: number;
  c: number;
  perfilPrimario: "D" | "I" | "S" | "C";
  perfilSecundario: "D" | "I" | "S" | "C";
  perfilAnimal: "Tubarão" | "Águia" | "Gato" | "Lobo";
  rawAdaptado?: { d: number, i: number, s: number, c: number };
  rawIntimo?: { d: number, i: number, s: number, c: number };
  rawNatural?: { d: number, i: number, s: number, c: number };
}

export interface PDI {
  id: string;
  vendorId: string;
  competencia: string;
  situacaoAtual: number; // 1 a 5
  meta: string;
  acaoCombinada: string;
  prazo: string;
  status: "nao_iniciado" | "em_andamento" | "concluido";
  evidencia?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface RaioX {
  id: string;
  vendorId: string;
  data: string;
  resumoIa: string;
  pontosFortes: string[];
  pontosAtencao: { ponto: string; sugestao: string }[];
  recomendacoesPdi: string;
}

export interface CompetenciaAvaliacao {
  id: string;
  vendorId: string;
  data: string;
  competencias: {
    nome: string;
    autoavaliacao: number;
    gestor: number;
    ia: number;
    baseline?: number;
  }[];
}

export interface PerfilComercial {
  id: string;
  vendorId: string;
  data: string;
  gargaloPrincipal: string;
  taxaConversaoMedia: number;
  ticketMedio: number;
  pontosFortesCampo: string[];
  areasMelhoriaCampo: string[];
}

export interface CoachConversation {
  id: string;
  vendorId: string;
  data: string;
  mensagem: string;
  respostaIa: string;
}
