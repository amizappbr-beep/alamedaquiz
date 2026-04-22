// Tabela de vendas Alameda 500 (ref. 20/03/2026)
// Fonte: Torres Engenharia

export const PRECO_MODELO = {
  "1_12": 460000, // Casa Premium — frente pra rua
  "6_7": 380000, // Casa Família — fundos (2 quintais)
  "2_a_11": 349000, // Casa Essencial — meio do terreno
};

// Status por unidade
export const UNIDADES = [
  { numero: 1, modelo: "1_12", nome: "Premium", status: "disponivel", preco: 460000 },
  { numero: 2, modelo: "2_a_11", nome: "Essencial", status: "reservada", preco: 349000 },
  { numero: 3, modelo: "2_a_11", nome: "Essencial", status: "disponivel", preco: 349000 },
  { numero: 4, modelo: "2_a_11", nome: "Essencial", status: "disponivel", preco: 349000 },
  { numero: 5, modelo: "2_a_11", nome: "Essencial", status: "disponivel", preco: 349000 },
  { numero: 6, modelo: "6_7", nome: "Família", status: "reservada", preco: 380000 },
  { numero: 7, modelo: "6_7", nome: "Família", status: "disponivel", preco: 380000 },
  { numero: 8, modelo: "2_a_11", nome: "Essencial", status: "vendida", preco: 349000 },
  { numero: 9, modelo: "2_a_11", nome: "Essencial", status: "disponivel", preco: 349000 },
  { numero: 10, modelo: "2_a_11", nome: "Essencial", status: "reservada", preco: 349000 },
  { numero: 11, modelo: "2_a_11", nome: "Essencial", status: "disponivel", preco: 349000 },
  { numero: 12, modelo: "1_12", nome: "Premium", status: "vendida", preco: 460000 },
];

export const CONDICOES = {
  percentualSinal: 0.13, // 13% de sinal
  parcelasSinalMax: 3, // sinal em até 3x
  percentualAteChaves: 0.20, // total pago até as chaves (inclui sinal)
  percentualFinanciado: 0.80, // financiamento bancário
  residualMaximo: 20000, // R$ 20.000 parceláveis pós-entrega
  residualMesesMax: 20, // até 20 meses pós-chaves
  correcaoSaldo: "CUB", // correção do saldo devedor até as chaves
  // Prazo de obra até as chaves: estimativa para cálculo do número de parcelas "até chaves"
  mesesObraEntrega: 18,
};

export function unidadesDisponiveisPorModelo(modeloId) {
  return UNIDADES.filter((u) => u.modelo === modeloId && u.status === "disponivel");
}

export function resumoDisponibilidade() {
  const total = UNIDADES.length;
  const disponivel = UNIDADES.filter((u) => u.status === "disponivel").length;
  const reservada = UNIDADES.filter((u) => u.status === "reservada").length;
  const vendida = UNIDADES.filter((u) => u.status === "vendida").length;
  return { total, disponivel, reservada, vendida };
}

export function formatBRL(valor) {
  if (valor == null || Number.isNaN(valor)) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}
