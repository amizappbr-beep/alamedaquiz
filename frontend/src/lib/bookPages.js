// Sequência canônica do "Book Alameda 500"
// A jornada agora é uma evolução página-a-página com gatilhos de
// liberação progressiva (broker desbloqueia após a 2ª página).

import {
  BookOpen,
  Building2,
  Home as HomeIcon,
  MapPin,
  User,
  Calculator,
  Handshake,
} from "lucide-react";

// stage = chave técnica usada no JourneyContext.stage
// number = página visível pro usuário (1 a 7)
// nextLabel = copy do CTA principal "Próxima etapa" quando ESSA é a página atual
//
// IMPORTANTE: o capítulo "diferenciais" foi MESCLADO em "empreendimento"
// (Cap. 01) — agora os diferenciais aparecem dentro da apresentação do
// empreendimento, eliminando uma página solta e reduzindo o atrito.
export const BOOK_PAGES = [
  {
    stage: "hub",
    number: 1,
    label: "Capa",
    title: "Bem-vindo",
    icon: BookOpen,
    nextLabel: "Começar minha experiência",
  },
  {
    stage: "empreendimento",
    number: 2,
    label: "O empreendimento",
    title: "Conheça o Alameda 500 e seus diferenciais",
    icon: Building2,
    nextLabel: "Escolher minha casa ideal",
    rewardPts: 25, // herdou os 10 pts antigos de "diferenciais"
  },
  {
    stage: "casas",
    number: 3,
    label: "Sua casa ideal",
    title: "3 modelos exclusivos",
    icon: HomeIcon,
    nextLabel: "Conhecer a localização",
    rewardPts: 20,
    unlocksBroker: true, // chega aqui → Falar com corretor liberado
  },
  {
    stage: "localizacao",
    number: 4,
    label: "Localização",
    title: "Bairro Alterosas, Serra/ES",
    icon: MapPin,
    nextLabel: "Descobrir meu perfil",
    rewardPts: 10,
  },
  {
    stage: "perfil",
    number: 5,
    label: "Seu perfil",
    title: "Vamos te conhecer",
    icon: User,
    nextLabel: "Simular condições",
    rewardPts: 25,
  },
  {
    stage: "simulador",
    number: 6,
    label: "Simulação",
    title: "Suas condições reais",
    icon: Calculator,
    nextLabel: "Falar com o corretor",
    rewardPts: 25,
  },
  {
    stage: "corretor",
    number: 7,
    label: "Corretor",
    title: "Próximo passo com a Torres",
    icon: Handshake,
    // última página — não tem nextLabel
  },
];

export const BOOK_TOTAL = BOOK_PAGES.length;

export function getBookPage(stage) {
  return BOOK_PAGES.find((p) => p.stage === stage) || BOOK_PAGES[0];
}

export function getNextStage(stage) {
  const idx = BOOK_PAGES.findIndex((p) => p.stage === stage);
  if (idx < 0 || idx >= BOOK_PAGES.length - 1) return null;
  return BOOK_PAGES[idx + 1].stage;
}

export function getPrevStage(stage) {
  const idx = BOOK_PAGES.findIndex((p) => p.stage === stage);
  if (idx <= 0) return null;
  return BOOK_PAGES[idx - 1].stage;
}

// Gatilho de liberação do botão "Falar com corretor":
// liberado quando o usuário VISITOU empreendimento E casas (as 2 primeiras
// páginas de conteúdo, números 2 e 3).
export function isBrokerUnlocked(modulosVisitados = []) {
  return (
    modulosVisitados.includes("empreendimento") &&
    modulosVisitados.includes("casas")
  );
}
