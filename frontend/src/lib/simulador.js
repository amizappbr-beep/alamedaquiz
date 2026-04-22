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
 * @param {number} input.entradaPropria - dinheiro disponível HOJE para o sinal
 * @param {number} input.fgts - saldo FGTS (reduz financiamento)
 * @param {number} input.capacidadeMensal - capacidade de pagamento mensal durante a obra
 * @param {number} input.prazoFinanciamentoMeses - 240/300/360/420
 * @param {number} input.parcelasSinal - 1, 2 ou 3
 * @param {boolean} input.usarResidualPosChaves
 */
export function simularProposta({
  valorImovel,
  rendaBrutaFamiliar,
  entradaPropria = 0,
  fgts = 0,
  capacidadeMensal = null,
  prazoFinanciamentoMeses = 360,
  parcelasSinal = 3,
  usarResidualPosChaves = false,
}) {
  const sinalTotal = valorImovel * CONDICOES.percentualSinal;
  const ateChavesTotal = valorImovel * CONDICOES.percentualAteChaves;
  const complementoAteChaves = ateChavesTotal - sinalTotal;
  const mesesComplemento = Math.max(1, CONDICOES.mesesObraEntrega - parcelasSinal);

  // Residual fixo R$ 20k em 20 meses (regra Torres)
  const residual = usarResidualPosChaves ? CONDICOES.residualMaximo : 0;

  // FGTS reduz diretamente o financiamento bancário (aplicado na liberação)
  const valorFinanciado = valorImovel * CONDICOES.percentualFinanciado - residual;
  const financiadoLiquido = Math.max(0, valorFinanciado - (fgts || 0));

  // Faixa e parcela bancária
  const faixa = identificarFaixa(rendaBrutaFamiliar);
  const parcelaBancaria = parcelaPrice(financiadoLiquido, faixa.taxaAA, prazoFinanciamentoMeses);

  const parcelaSinal = sinalTotal / parcelasSinal;
  const parcelaComplemento = complementoAteChaves / mesesComplemento;
  const parcelaResidual = residual > 0 ? residual / CONDICOES.residualMesesMax : 0;

  // Check 1: parcela bancária cabe em 30% da renda
  const limiteComprometimento = rendaBrutaFamiliar * 0.3;
  const aprovadoCapacidade = parcelaBancaria <= limiteComprometimento;
  // Check 2: dinheiro hoje cobre a 1ª parcela do sinal
  const sinalOk = (entradaPropria || 0) >= parcelaSinal * 0.95;
  // Check 3: capacidade mensal cobre o complemento (se informada)
  const complementoOk =
    capacidadeMensal === null ||
    capacidadeMensal === undefined ||
    capacidadeMensal >= parcelaComplemento * 0.95;

  const aprovadoGeral = aprovadoCapacidade && sinalOk && complementoOk && financiadoLiquido > 0;

  const razoes = [];
  if (!aprovadoCapacidade) {
    razoes.push(
      `Parcela bancária de R$ ${parcelaBancaria.toFixed(0)} supera 30% da renda.`
    );
  }
  if (!sinalOk) {
    razoes.push(
      `Para o sinal em ${parcelasSinal}x, é preciso ao menos R$ ${parcelaSinal.toFixed(0)} hoje.`
    );
  }
  if (!complementoOk) {
    razoes.push(
      `Capacidade mensal não cobre R$ ${parcelaComplemento.toFixed(0)}/mês durante a obra.`
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
    sinalOk,
    complementoOk,
    aprovadoGeral,
    razoes,
  };
}
