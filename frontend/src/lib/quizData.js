// Quiz expandido em 2 blocos — Alameda 500
// Bloco 1: momento (existente) — 6 perguntas
// Bloco 2: perfil + financeiro (novo) — 6 perguntas

export const QUIZ_QUESTIONS = [
  // ——— BLOCO 1 — MOMENTO ———
  {
    id: "situacao",
    bloco: 1,
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
    bloco: 1,
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
    bloco: 1,
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
    bloco: 1,
    label: "Parcela",
    prompt: "Qual faixa de parcela faria sentido pra você hoje?",
    options: [
      { value: "ate_1200", label: "Até R$ 1.200", weight: 1 },
      { value: "1200_1800", label: "R$ 1.200 a R$ 1.800", weight: 2 },
      { value: "1800_2500", label: "R$ 1.800 a R$ 2.500", weight: 3 },
      { value: "acima_2500", label: "Acima de R$ 2.500", weight: 3 },
    ],
  },
  {
    id: "entrada",
    bloco: 1,
    label: "Entrada",
    prompt: "Sobre a entrada (sinal), qual sua realidade hoje?",
    options: [
      { value: "tem_parte", label: "Já tenho parte do valor", weight: 3 },
      { value: "pode_parcelar", label: "Posso parcelar", weight: 2 },
      { value: "precisa_entender", label: "Preciso entender", weight: 1 },
    ],
  },
  {
    id: "decisao",
    bloco: 1,
    label: "Decisão",
    prompt: "Se fizer sentido, você avançaria na compra ainda este mês?",
    options: [
      { value: "sim", label: "Sim", weight: 3 },
      { value: "talvez", label: "Talvez", weight: 2 },
      { value: "nao_agora", label: "Não agora", weight: 0 },
    ],
  },

  // ——— BLOCO 2 — PERFIL FINANCEIRO E PESSOAL ———
  {
    id: "renda_familiar",
    bloco: 2,
    label: "Renda",
    prompt: "Qual a sua renda familiar bruta mensal (somando cônjuge se tiver)?",
    options: [
      { value: "ate_2850", label: "Até R$ 2.850 (Faixa 1 MCMV)", weight: 1 },
      { value: "2850_4700", label: "R$ 2.850 a R$ 4.700 (Faixa 2)", weight: 2 },
      { value: "4700_8600", label: "R$ 4.700 a R$ 8.600 (Faixa 3)", weight: 3 },
      { value: "acima_8600", label: "Acima de R$ 8.600 (SBPE)", weight: 3 },
    ],
  },
  {
    id: "trabalho",
    bloco: 2,
    label: "Trabalho",
    prompt: "Qual seu regime de trabalho hoje?",
    options: [
      { value: "clt", label: "Carteira assinada (CLT)", weight: 3 },
      { value: "servidor", label: "Servidor público", weight: 3 },
      { value: "autonomo", label: "Autônomo / informal", weight: 2 },
      { value: "mei", label: "MEI / empresário", weight: 2 },
      { value: "aposentado", label: "Aposentado / pensionista", weight: 3 },
    ],
  },
  {
    id: "fgts",
    bloco: 2,
    label: "FGTS",
    prompt: "Tem saldo de FGTS que poderia usar na compra?",
    options: [
      { value: "sim_muito", label: "Sim, acima de R$ 30 mil", weight: 3 },
      { value: "sim_pouco", label: "Sim, até R$ 30 mil", weight: 2 },
      { value: "nao", label: "Não tenho FGTS", weight: 1 },
      { value: "nao_sei", label: "Não sei o saldo", weight: 1 },
    ],
  },
  {
    id: "estado_civil",
    bloco: 2,
    label: "Família",
    prompt: "Qual sua situação familiar?",
    options: [
      { value: "solteiro", label: "Solteiro(a), sem dependentes", weight: 2 },
      { value: "casal_sem_filhos", label: "Casal sem filhos", weight: 2 },
      { value: "familia_pequena", label: "Família com 1 ou 2 filhos", weight: 3 },
      { value: "familia_grande", label: "Família com 3+ pessoas", weight: 2 },
    ],
  },
  {
    id: "imovel_atual",
    bloco: 2,
    label: "Imóvel",
    prompt: "Você já possui imóvel próprio hoje?",
    options: [
      { value: "nao", label: "Não, este seria o 1º", weight: 3 },
      { value: "sim_vou_vender", label: "Sim, e pretendo vender", weight: 3 },
      { value: "sim_vou_manter", label: "Sim, e vou manter", weight: 2 },
      { value: "mcmv_ja_usado", label: "Já comprei com MCMV antes", weight: 1 },
    ],
  },
  {
    id: "regiao",
    bloco: 2,
    label: "Região",
    prompt: "Qual sua região preferida na Grande Vitória?",
    options: [
      { value: "serra", label: "Serra (onde fica o Alameda 500)", weight: 3 },
      { value: "vitoria", label: "Vitória", weight: 2 },
      { value: "vila_velha", label: "Vila Velha", weight: 2 },
      { value: "cariacica", label: "Cariacica / Viana", weight: 2 },
      { value: "indiferente", label: "Tanto faz, quero o melhor", weight: 3 },
    ],
  },
];

export const QUIZ_BLOCOS = [
  {
    numero: 1,
    titulo: "Seu momento",
    descricao: "6 perguntas rápidas sobre o que você busca.",
  },
  {
    numero: 2,
    titulo: "Seu perfil financeiro e familiar",
    descricao: "Mais 6 perguntas pra montar sua proposta ideal.",
  },
];

export function getQuestionsByBloco(blocoNumero) {
  return QUIZ_QUESTIONS.filter((q) => q.bloco === blocoNumero);
}

export function classifyAnswers(answers) {
  let total = 0;
  let maxPossible = 0;
  Object.values(answers).forEach((a) => (total += a?.weight ?? 0));
  QUIZ_QUESTIONS.forEach((q) => {
    maxPossible += Math.max(...q.options.map((o) => o.weight));
  });
  // Normalizar para classificação (thresholds ajustados ao novo max de 12*3=36)
  const pct = total / maxPossible;
  if (pct >= 0.75) return "quente";
  if (pct >= 0.45) return "morno";
  return "frio";
}

// Gera insights textuais após o bloco 1 ou o quiz completo
export function gerarInsights(answers) {
  const insights = [];
  const a = (id) => answers[id]?.value;

  if (a("tempo") === "rapido" && a("decisao") === "sim") {
    insights.push({
      icon: "⚡",
      titulo: "Você tem urgência",
      descricao: "Prioridade máxima no atendimento — temos unidades disponíveis agora.",
    });
  }
  if (a("desejo") === "quintal" || a("desejo") === "familia") {
    insights.push({
      icon: "🏡",
      titulo: "Espaço é essencial pra você",
      descricao: "Casas 6 e 7 (Família) têm quintal na frente E nos fundos — perfeito pro seu perfil.",
    });
  }
  if (a("desejo") === "privacidade") {
    insights.push({
      icon: "🔒",
      titulo: "Privacidade importa",
      descricao: "Casas 1 e 12 são de frente pra rua, mais isoladas — ideais.",
    });
  }
  if (a("desejo") === "baixo_custo" || a("parcela") === "ate_1200") {
    insights.push({
      icon: "💰",
      titulo: "Custo-benefício é sua prioridade",
      descricao: "Casas 2–11 (Essencial) oferecem o melhor valor, a partir de R$ 349.000.",
    });
  }
  if (a("renda_familiar") === "ate_2850") {
    insights.push({
      icon: "🏦",
      titulo: "Você se encaixa na Faixa 1 do MCMV",
      descricao: "Subsídio de até R$ 55 mil e taxa reduzida. Ótima notícia!",
    });
  }
  if (a("fgts") === "sim_muito") {
    insights.push({
      icon: "💵",
      titulo: "FGTS forte",
      descricao: "Você pode usar o saldo na entrada e reduzir bastante a parcela.",
    });
  }
  if (a("imovel_atual") === "nao") {
    insights.push({
      icon: "🎯",
      titulo: "Primeiro imóvel",
      descricao: "Condições especiais do MCMV aplicáveis — subsídio + taxa reduzida.",
    });
  }
  if (a("entrada") === "tem_parte" && a("fgts") && a("fgts") !== "nao") {
    insights.push({
      icon: "✅",
      titulo: "Entrada encaminhada",
      descricao: "Com a combinação de recursos próprios + FGTS, sinal + até chaves viável.",
    });
  }
  return insights;
}

export const WHATSAPP_PHONE = "5527996610579";

export function buildWhatsappUrl({ name, temperatura, score, casa, agendamento, modulos, simulacao }) {
  const lines = [
    `Olá! Acabei de concluir a jornada interativa do Alameda 500.`,
    name ? `Meu nome é ${name}.` : "",
    temperatura ? `Temperatura do meu perfil: ${temperatura.toUpperCase()}${score ? ` (score ${score}/150)` : ""}.` : "",
    casa ? `Casa de interesse: ${casa}.` : "",
    simulacao?.parcelaBancaria
      ? `Fiz simulação — parcela estimada: R$ ${Math.round(simulacao.parcelaBancaria)} (faixa ${simulacao.faixa?.nome}).`
      : "",
    agendamento
      ? `Agendei atendimento: ${agendamento.data} às ${agendamento.horario} (${agendamento.formato}).`
      : "",
    modulos && modulos.length ? `Módulos explorados: ${modulos.join(", ")}.` : "",
    `Gostaria de dar o próximo passo.`,
  ].filter(Boolean);
  const msg = lines.join("\n");
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;
}

export const LEAD_SCORE = { QUENTE: 90, MORNO: 45 };
