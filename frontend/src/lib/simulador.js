// Simulador de compra — Alameda 500
// Regras MCMV/SBPE (aproximação 2026) + tabela de vendas Torres Engenharia
import { CONDICOES } from "./tabelaVendas";

// Faixas MCMV (valores aproximados 2026)
export const FAIXAS_MCMV = [
  { id: "1", nome: "Faixa 1", rendaMax: 2850, taxaAA: 0.045, subsidioEstimado: 55000 },
  { id: "2", nome: "Faixa 2", rendaMax: 4700, taxaAA: 0.055, subsidioEstimado: 30000 },
  { id: "3", nome: "Faixa 3", rendaMax: 8600, taxaAA: 0.0775, subsidioEstimado: 0 },
  { id: "sbpe", nome: "SBPE", rendaMax: Infinity, taxaAA: 0.105, subsidioEstimado: 0 },
];

export function identificarFaixa(rendaBruta) {
  return FAIXAS_MCMV.find((f) => rendaBruta <= f.rendaMax) || FAIXAS_MCMV[FAIXAS_MCMV.length - 1];
}

// Pricing price (PMT)
export function parcelaPrice(valorFinanciado, taxaAA, meses) {
  if (valorFinanciado <= 0 || meses <= 0) return 0;
  const taxaAM = Math.pow(1 + taxaAA, 1 / 12) - 1;
  if (taxaAM === 0) return valorFinanciado / meses;
  const pmt =
    (valorFinanciado * taxaAM * Math.pow(1 + taxaAM, meses)) /
    (Math.pow(1 + taxaAM, meses) - 1);
  return pmt;
}

/**
 * Simula proposta completa
 * @param {object} input
 * @param {number} input.valorImovel
 * @param {number} input.rendaBrutaFamiliar
 * @param {number} input.entradaPropria - poupança/recursos próprios
 * @param {number} input.fgts - saldo FGTS disponível
 * @param {number} input.prazoFinanciamentoMeses - 240/300/360
 * @param {number} input.parcelasSinal - 1, 2 ou 3
 * @param {boolean} input.usarResidualPosChaves - se quer parcelar até 20k pós-entrega
 */
export function simularProposta({
  valorImovel,
  rendaBrutaFamiliar,
  entradaPropria = 0,
  fgts = 0,
  prazoFinanciamentoMeses = 360,
  parcelasSinal = 3,
  usarResidualPosChaves = false,
}) {
  const sinalTotal = valorImovel * CONDICOES.percentualSinal; // 13%
  const ateChavesTotal = valorImovel * CONDICOES.percentualAteChaves; // 20% total
  const complementoAteChaves = ateChavesTotal - sinalTotal; // ~7%
  const mesesComplemento = Math.max(1, CONDICOES.mesesObraEntrega - parcelasSinal);

  // Residual pós-chaves opcional: valor fixo R$ 20k em 20 meses (regra Torres)
  const residual = usarResidualPosChaves ? CONDICOES.residualMaximo : 0;

  // Valor financiado bancário (80% - residual se usar)
  const valorFinanciado = valorImovel * CONDICOES.percentualFinanciado - residual;

  // Entrada + FGTS pode reduzir o financiamento (se a pessoa quiser antecipar)
  const recursosProprios = Math.max(0, (entradaPropria || 0) + (fgts || 0) - ateChavesTotal);
  const financiadoLiquido = Math.max(0, valorFinanciado - recursosProprios);

  // Faixa e parcela bancária
  const faixa = identificarFaixa(rendaBrutaFamiliar);
  const parcelaBancaria = parcelaPrice(financiadoLiquido, faixa.taxaAA, prazoFinanciamentoMeses);

  // Parcela do sinal
  const parcelaSinal = sinalTotal / parcelasSinal;

  // Parcela complemento até chaves (simples, sem juros — correção CUB ignorada na simulação)
  const parcelaComplemento = complementoAteChaves / mesesComplemento;

  // Parcela residual pós-chaves
  const parcelaResidual = residual > 0 ? residual / CONDICOES.residualMesesMax : 0;

  // Regra prudencial: parcela bancária não deve exceder 30% da renda
  const limiteComprometimento = rendaBrutaFamiliar * 0.3;
  const aprovadoCapacidade = parcelaBancaria <= limiteComprometimento;

  // Recurso próprio cobre os 20% até chaves?
  const cobreAteChaves = (entradaPropria || 0) + (fgts || 0) >= ateChavesTotal * 0.95;

  const aprovadoGeral = aprovadoCapacidade && cobreAteChaves && financiadoLiquido > 0;

  // Monta razões
  const razoes = [];
  if (!aprovadoCapacidade) {
    razoes.push(
      `Parcela estimada de ${parcelaBancaria.toFixed(0)} compromete mais de 30% da renda.`
    );
  }
  if (!cobreAteChaves) {
    razoes.push(
      `Recursos próprios (entrada + FGTS) precisam cobrir ~${(ateChavesTotal).toFixed(0)} pagos até as chaves.`
    );
  }

  return {
    faixa,
    sinalTotal,
    parcelaSinal,
    parcelasSinal,
    complementoAteChaves,
    parcelaComplemento,
    mesesComplemento,
    ateChavesTotal,
    valorFinanciado: financiadoLiquido,
    valorFinanciadoBruto: valorFinanciado,
    parcelaBancaria,
    prazoFinanciamentoMeses,
    taxaAA: faixa.taxaAA,
    residual,
    parcelaResidual,
    usarResidualPosChaves,
    limiteComprometimento,
    aprovadoCapacidade,
    cobreAteChaves,
    aprovadoGeral,
    razoes,
  };
}
