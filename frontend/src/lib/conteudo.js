import { ALAMEDA_IMAGES } from "./assets";

// 3 modelos de planta do Alameda 500
export const CASA_MODELOS = [
  {
    id: "1_12",
    nome: "Premium",
    numeros: "Casas 1 e 12",
    tagline: "De frente pra rua, com privacidade.",
    descricao:
      "De frente para a rua, com quintal privativo lateral — ótima exposição solar e privacidade.",
    areaPrivativa: 79.02,
    areaConstruida: 50.32,
    quartos: 2,
    banheiros: 1,
    lavabo: true,
    destaques: ["Quintal lateral", "Lavabo", "Frente pra rua", "Maior área privativa"],
    idealPara: ["privacidade", "algo_proprio", "mais_espaco"],
    imagem: ALAMEDA_IMAGES.fachadaDia,
    unidades: 2,
  },
  {
    id: "6_7",
    nome: "Família",
    numeros: "Casas 6 e 7",
    tagline: "Quintal na frente e nos fundos.",
    descricao:
      "Nos fundos do terreno, com quintal privativo na frente E nos fundos. Espaço dobrado pra família.",
    areaPrivativa: 63.33,
    areaConstruida: 50.44,
    quartos: 2,
    banheiros: 1,
    lavabo: true,
    destaques: ["2 quintais privativos", "Lavabo", "Espaço pra família", "Área gourmet"],
    idealPara: ["familia", "quintal"],
    imagem: ALAMEDA_IMAGES.quintal,
    unidades: 2,
  },
  {
    id: "2_a_11",
    nome: "Essencial",
    numeros: "Casas 2 a 5 e 8 a 11",
    tagline: "Melhor custo-benefício.",
    descricao:
      "Na área central do terreno, com quintal privativo nos fundos. Planta enxuta e eficiente.",
    areaPrivativa: 54.56,
    areaConstruida: 49.86,
    quartos: 2,
    banheiros: 1,
    lavabo: false,
    destaques: ["Quintal nos fundos", "Melhor custo", "Área central", "8 unidades"],
    idealPara: ["baixo_custo", "sair_aluguel"],
    imagem: ALAMEDA_IMAGES.sala,
    unidades: 8,
  },
];

// Sugere um modelo com base nas respostas do quiz
export function sugerirCasa(quizAnswers) {
  if (!quizAnswers || Object.keys(quizAnswers).length === 0) return null;
  const scores = { "1_12": 0, "6_7": 0, "2_a_11": 0 };
  Object.values(quizAnswers).forEach((a) => {
    CASA_MODELOS.forEach((m) => {
      if (m.idealPara.includes(a?.value)) scores[m.id] += 1;
    });
  });
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (entries[0][1] === 0) return null;
  return CASA_MODELOS.find((m) => m.id === entries[0][0]);
}

// 10 diferenciais do empreendimento
export const DIFERENCIAIS = [
  {
    id: "quintal",
    titulo: "Quintal privativo",
    descricao:
      "Cada casa tem seu próprio quintal — para lazer, pet, horta ou um cantinho só seu.",
    icon: "TreePine",
  },
  {
    id: "sem_condominio",
    titulo: "Sem taxa de condomínio",
    descricao:
      "Economia real de R$ 300 a R$ 500 por mês comparado a condomínios fechados.",
    icon: "Wallet",
  },
  {
    id: "sacada",
    titulo: "Sacada estilo europeu",
    descricao: "No quarto do casal — design sofisticado e luz natural abundante.",
    icon: "LayoutPanelTop",
  },
  {
    id: "integrado",
    titulo: "Ambiente social integrado",
    descricao:
      "Sala, cozinha e varanda conectadas — ideal pra receber família e amigos.",
    icon: "Users",
  },
  {
    id: "servico",
    titulo: "Área de serviço dedicada",
    descricao: "Separada dos ambientes sociais, com espaço pra máquina e tanque.",
    icon: "Shirt",
  },
  {
    id: "descarga",
    titulo: "Descarga econômica",
    descricao:
      "Sistema que economiza até 60% de água nos banheiros — sustentabilidade no dia a dia.",
    icon: "Droplet",
  },
  {
    id: "churrasqueira",
    titulo: "Área gourmet com churrasqueira",
    descricao:
      "No quintal privativo — sua casa no clima do churrasco todo final de semana.",
    icon: "Flame",
  },
  {
    id: "ar_split",
    titulo: "Previsão para ar-split",
    descricao:
      "Infraestrutura já instalada — basta comprar o aparelho e instalar.",
    icon: "Wind",
  },
  {
    id: "porcelanato",
    titulo: "Porcelanato e acabamentos premium",
    descricao: "Padrão alto em toda a casa — sala, quartos, banheiros e cozinha.",
    icon: "Sparkles",
  },
  {
    id: "opcoes",
    titulo: "3 opções de planta",
    descricao: "Escolha o modelo que combina com seu estilo de vida e orçamento.",
    icon: "LayoutGrid",
  },
];

export const MODULOS = [
  {
    id: "empreendimento",
    titulo: "Conhecer o empreendimento",
    descricao: "Galeria imersiva: fachada, interiores, áreas comuns.",
    icon: "Building2",
    cor: "#6471A2",
  },
  {
    id: "casas",
    titulo: "Escolher minha casa ideal",
    descricao: "3 modelos de planta — com sugestão personalizada.",
    icon: "Home",
    cor: "#6471A2",
  },
  {
    id: "perfil",
    titulo: "Descobrir meu perfil de compra",
    descricao: "6 perguntas rápidas revelam seu perfil.",
    icon: "UserRound",
    cor: "#6471A2",
  },
  {
    id: "simulador",
    titulo: "Simular meu financiamento",
    descricao: "Calcule parcela e proposta com regras MCMV / Caixa.",
    icon: "Calculator",
    cor: "#6471A2",
  },
  {
    id: "diferenciais",
    titulo: "Meus diferenciais",
    descricao: "10 motivos que fazem a diferença no dia a dia.",
    icon: "Sparkles",
    cor: "#6471A2",
  },
  {
    id: "corretor",
    titulo: "Falar com corretor",
    descricao: "Agende ou receba atendimento imediato.",
    icon: "MessageCircle",
    cor: "#4A5680",
    isFinal: true,
  },
];
