/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Competitor, Vendor } from "./types";

export const INITIAL_VENDORS: string[] = [
  "Bruno Garcia Queiroz",
  "Ana Paula Rodrigues",
  "Vitoria Caroline Baldez Rosales",
  "João Vithor Sader",
  "João Paulo da Silva Santos",
  "Claudia Maria Semmler",
  "Diulia Vitoria Machado Borges",
  "Elton da Silva Rodrigo Gonçalves",
  "Vendedor Teste"
];

export const BAIRROS_LAJEADO: string[] = [
  "Alto do Parque",
  "Americano",
  "Bom Pastor",
  "Campestre",
  "Carneiros",
  "Centenário",
  "Centro",
  "Conventos",
  "Das Nações",
  "Floresta",
  "Florestal",
  "Hidráulica",
  "Igrejinha",
  "Imigrante",
  "Jardim Botânico",
  "Jardim do Cedro",
  "Moinhos",
  "Moinhos D'Água",
  "Montanha",
  "Morro 25",
  "Olarias",
  "Planalto",
  "Parque do Imigrante",
  "São Cristóvão",
  "São José",
  "Universitário",
  "Verdes Vales",
  "Vila Antunes"
];

export const BAIRROS_ESTRELA: string[] = [
  "Alto da Bronze",
  "Auxiliadora",
  "Boa União",
  "Centro",
  "Chacrinha",
  "Cristo Rei",
  "Estados",
  "Imigrantes",
  "Indústrias",
  "Marmitt",
  "Oriental",
  "Pinheiros",
  "São José"
];

export const FALLBACK_COMPETITORS: Competitor[] = [
  {
    id: "comp_1",
    _linha: 101,
    name: "Vero Internet",
    sigla: "VR",
    cor: "#1565c0",
    type: "Fibra Óptica",
    mhnet: "A MHnet possui atendimento humanizado de verdade com loja física local em Lajeado e Estrela, suporte presencial no mesmo dia e planos sem pegadinhas nem taxas escondidas no final.",
    pros: ["Marca consolidada na região", "Boa cobertura urbana", "Campanhas publicitárias agressivas"],
    cons: ["Suporte inicial por ura telefônica demorada", "Fidelidade complexa de cancelar", "Aumento expressivo após o período promocional"]
  },
  {
    id: "comp_2",
    _linha: 102,
    name: "Claro",
    sigla: "CL",
    cor: "#dc2626",
    type: "Híbrido / Coaxial",
    mhnet: "Nossa internet MHNET é 100% fibra óptica direto até dentro da sua casa (FTTH), garantindo maior velocidade de upload para jogos e reuniões, sem oscilações bruscas quando chove ou há sobrecarga.",
    pros: ["Combos de TV por assinatura tradicionais", "Força no segmento corporativo", "Bons planos de telefonia combinados"],
    cons: ["Muitos bairros ainda usam rede coaxial antiga", "Sinal de upload muito baixo", "Atendimento robotizado em callcenter nacional"]
  },
  {
    id: "comp_3",
    _linha: 103,
    name: "Oi Fibra",
    sigla: "OI",
    cor: "#ea580c",
    type: "Fibra Óptica",
    mhnet: "Temos suporte técnico no mesmo dia com equipe de instalação própria da região, sem precisar aguardar dias pelo agendamento ou depender de terceirizados de fora.",
    pros: ["Planos com preços baixos iniciais", "Ganha modems novos em planos altos"],
    cons: ["Instabilidade crônica na infraestrutura primária", "Inexistência de canais de atendimento físico local em Lajeado", "Altas taxas para reparos fora do horário comercial"]
  },
  {
    id: "comp_4",
    _linha: 104,
    name: "Brasrede",
    sigla: "BR",
    cor: "#f59e0b",
    type: "Fibra Óptica",
    mhnet: "A MHnet oferece maior capacidade de link dedicado e estabilidade comprovada com rotas redundantes, além de uma infraestrutura moderna focada em alta disponibilidade para as regiões de atendimento.",
    pros: ["Atendimento local histórico", "Planos flexíveis", "Nome reconhecido no mercado regional"],
    cons: ["Infraestrutura envelhecida em alguns bairros", "Demora na atualização de novas tecnologias", "Limitado em opções combinadas de telefonia móvel"]
  }
];

export interface MaterialItem {
  id: string;
  name: string;
  type: "folder" | "file";
  thumbnail?: string;
  downloadUrl?: string;
  viewUrl?: string;
  parentId: string | null;
  category?: string;
}

export const FALLBACK_MATERIALS: MaterialItem[] = [
  {
    id: "fol_1",
    name: "Panfletos de Ofertas Lajeado/Estrela",
    type: "folder",
    parentId: null
  },
  {
    id: "fol_2",
    name: "Tabelas de Preços e Comissão",
    type: "folder",
    parentId: null
  },
  {
    id: "fol_3",
    name: "Vídeos e Imagens para Status Whats",
    type: "folder",
    parentId: null
  },
  // Folder Content
  {
    id: "file_1_1",
    name: "Panfleto MHNet 400M Mega Fibra.png",
    type: "file",
    category: "Fibra",
    thumbnail: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=200&auto=format&fit=crop&q=60",
    downloadUrl: "#",
    viewUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=800&auto=format&fit=crop&q=80",
    parentId: "fol_1"
  },
  {
    id: "file_1_2",
    name: "MHPlay - Hub de Entretenimento.png",
    type: "file",
    category: "Play",
    thumbnail: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=200&auto=format&fit=crop&q=60",
    downloadUrl: "#",
    viewUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&auto=format&fit=crop&q=80",
    parentId: "fol_1"
  },
  {
    id: "file_2_1",
    name: "Tabela Oficial Consumidor 2026.pdf",
    type: "file",
    category: "Fibra",
    thumbnail: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&auto=format&fit=crop&q=60",
    downloadUrl: "#",
    viewUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    parentId: "fol_2"
  },
  {
    id: "file_3_1",
    name: "Banner Whatsapp - Internet + Chip Móvel.png",
    type: "file",
    category: "Móvel",
    thumbnail: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=200&auto=format&fit=crop&q=60",
    downloadUrl: "#",
    viewUrl: "https://images.unsplash.com/photo-1562408590-e32931084e23?w=800&auto=format&fit=crop&q=80",
    parentId: "fol_3"
  },
  {
    id: "file_3_2",
    name: "Vídeo Promocional Câmeras de Vigilância.mp4",
    type: "file",
    category: "Câmera",
    thumbnail: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=200&auto=format&fit=crop&q=60",
    downloadUrl: "#",
    viewUrl: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80",
    parentId: "fol_3"
  }
];
