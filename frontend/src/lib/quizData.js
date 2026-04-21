// Quiz questions and scoring for Alameda 500

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
  // answers: { [questionId]: { value, label, weight } }
  let total = 0;
  Object.values(answers).forEach((a) => {
    total += a?.weight ?? 0;
  });
  // Max possible = 2+2+3+3+3+3 = 16. Min = 0.
  if (total >= 12) return "quente";
  if (total >= 7) return "morno";
  return "frio";
}

export const RESULT_COPY = {
  quente: {
    eyebrow: "Lead prioritário",
    title: "Boa notícia!",
    description:
      "Pelo seu perfil, você pode se encaixar nas condições do Alameda 500. Você tem prioridade no atendimento.",
    cta: "Falar com especialista agora",
    tone: "warm",
  },
  morno: {
    eyebrow: "Perfil próximo do ideal",
    title: "Você está muito perto.",
    description:
      "Podemos simular as melhores condições para que o Alameda 500 caiba no seu planejamento.",
    cta: "Simular minhas condições",
    tone: "neutral",
  },
  frio: {
    eyebrow: "Vamos te preparar",
    title: "Talvez ainda não seja o momento ideal…",
    description:
      "Mas podemos te ajudar a se organizar para quando o momento certo chegar. Vem entender as possibilidades.",
    cta: "Quero entender melhor",
    tone: "cool",
  },
};

export const WHATSAPP_PHONE = "5527996610579";

export function buildWhatsappUrl({ name, classification }) {
  const nameStr = name ? ` Meu nome é ${name}.` : "";
  const msg = `Olá! Acabei de fazer o teste do Alameda 500 e quero falar com um especialista.${nameStr} Meu perfil: ${classification.toUpperCase()}.`;
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}
