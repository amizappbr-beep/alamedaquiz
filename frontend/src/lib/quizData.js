// Quiz questions and scoring for Alameda 500 — Concierge Digital

export const QUIZ_QUESTIONS = [
  {
    id: "situacao",
    label: "Situação",
    prompt: "O que mais te motivaria hoje a buscar um imóvel?",
    options: [
      { value: "sair_aluguel", label: "Sair do aluguel", weight: 2 },
      { value: "mais_espaco", label: "Ter mais espaço", weight: 2 },
      { value: "algo_proprio", label: "Ter algo próprio", weight: 2 },
      { value: "pesquisando", label: "Estou apenas pesquisando", weight: 0 },
    ],
  },
  {
    id: "desejo",
    label: "Desejo",
    prompt: "O que não pode faltar na sua próxima casa?",
    options: [
      { value: "quintal", label: "Quintal", weight: 2 },
      { value: "privacidade", label: "Privacidade", weight: 2 },
      { value: "familia", label: "Espaço para família", weight: 2 },
      { value: "baixo_custo", label: "Baixo custo mensal", weight: 1 },
    ],
  },
  {
    id: "tempo",
    label: "Tempo",
    prompt: "Em quanto tempo você gostaria de mudar?",
    options: [
      { value: "rapido", label: "O mais rápido possível", weight: 3 },
      { value: "proximos_meses", label: "Nos próximos meses", weight: 2 },
      { value: "sem_pressa", label: "Sem pressa", weight: 0 },
    ],
  },
  {
    id: "parcela",
    label: "Parcela",
    prompt: "Qual faixa de parcela faria sentido pra você hoje?",
    options: [
      { value: "ate_1200", label: "Até R$ 1.200", weight: 1 },
      { value: "1200_1800", label: "R$ 1.200 a R$ 1.800", weight: 2 },
      { value: "acima_1800", label: "Acima de R$ 1.800", weight: 3 },
    ],
  },
  {
    id: "entrada",
    label: "Entrada",
    prompt: "Sobre a entrada, qual sua realidade hoje?",
    options: [
      { value: "tem_parte", label: "Já tenho parte do valor", weight: 3 },
      { value: "pode_parcelar", label: "Posso parcelar", weight: 2 },
      { value: "precisa_entender", label: "Preciso entender", weight: 1 },
    ],
  },
  {
    id: "decisao",
    label: "Decisão",
    prompt: "Se fizer sentido, você avançaria na compra ainda este mês?",
    options: [
      { value: "sim", label: "Sim", weight: 3 },
      { value: "talvez", label: "Talvez", weight: 2 },
      { value: "nao_agora", label: "Não agora", weight: 0 },
    ],
  },
];

export function classifyAnswers(answers) {
  let total = 0;
  Object.values(answers).forEach((a) => {
    total += a?.weight ?? 0;
  });
  if (total >= 12) return "quente";
  if (total >= 7) return "morno";
  return "frio";
}

export const WHATSAPP_PHONE = "5527996610579";

export function buildWhatsappUrl({ name, temperatura, score, casa, agendamento, modulos }) {
  const lines = [
    `Olá! Acabei de concluir a jornada interativa do Alameda 500.`,
    name ? `Meu nome é ${name}.` : "",
    temperatura ? `Temperatura do meu perfil: ${temperatura.toUpperCase()}${score ? ` (score ${score}/150)` : ""}.` : "",
    casa ? `Casa de interesse: ${casa}.` : "",
    agendamento
      ? `Agendei atendimento: ${agendamento.data} às ${agendamento.horario} (${agendamento.formato}).`
      : "",
    modulos && modulos.length ? `Módulos que explorei: ${modulos.join(", ")}.` : "",
    `Gostaria de dar o próximo passo.`,
  ].filter(Boolean);
  const msg = lines.join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

// Regras MCMV — placeholders para Fase 2
export const LEAD_SCORE = {
  QUENTE: 90,
  MORNO: 45,
};
