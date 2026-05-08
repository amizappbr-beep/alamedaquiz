import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useJourney } from "../../context/JourneyContext";
import { UNIDADES, PRECO_MODELO, formatBRL, resumoDisponibilidade } from "../../lib/tabelaVendas";
import { simularProposta } from "../../lib/simulador";
import { CASA_MODELOS } from "../../lib/conteudo";
import {
  Calculator,
  ArrowRight,
  Info,
  Loader2,
  TrendingUp,
  Home,
  Percent,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function formatBRLInput(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return num.toLocaleString("pt-BR");
}

export default function ModuloSimulador() {
  const {
    goTo,
    setSimulacao,
    quiz_answers,
    casa_preferida,
    markModuloVisitado,
  } = useJourney();

  const [unidadeNumero, setUnidadeNumero] = useState(null);
  const [renda, setRenda] = useState("");
  const [entrada, setEntrada] = useState("");
  const [fgts, setFgts] = useState("");
  const [capacidadeMensal, setCapacidadeMensal] = useState("");
  const [prazo, setPrazo] = useState(360);
  const [parcelasSinal, setParcelasSinal] = useState(3);
  const [residual, setResidual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // pré-selecionar primeira unidade disponível do modelo preferido
    if (!unidadeNumero && casa_preferida) {
      const u = UNIDADES.find((x) => x.modelo === casa_preferida && x.status === "disponivel");
      if (u) setUnidadeNumero(u.numero);
    } else if (!unidadeNumero) {
      const u = UNIDADES.find((x) => x.status === "disponivel");
      if (u) setUnidadeNumero(u.numero);
    }
    // pré-preencher renda se respondeu no quiz
    const rendaAnswer = quiz_answers?.renda_familiar?.value;
    if (rendaAnswer && !renda) {
      const map = {
        ate_2850: "2500",
        "2850_4700": "3800",
        "4700_8600": "6500",
        acima_8600: "10000",
      };
      if (map[rendaAnswer]) setRenda(map[rendaAnswer]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unidadesDisp = UNIDADES.filter((u) => u.status === "disponivel");
  const unidadeSel = UNIDADES.find((u) => u.numero === unidadeNumero);
  const resumo = resumoDisponibilidade();

  const parseNum = (s) => parseInt((s || "").replace(/\D/g, ""), 10) || 0;

  const podeSimular =
    unidadeNumero && parseNum(renda) > 0 && parseNum(entrada) > 0;

  // Espelho dinâmico — recalcula conforme o usuário preenche
  const previa = useMemo(() => {
    if (!unidadeSel) return null;
    const rendaN = parseNum(renda);
    if (rendaN <= 0) return null;
    try {
      return simularProposta({
        valorImovel: unidadeSel.preco,
        rendaBrutaFamiliar: rendaN,
        entradaPropria: parseNum(entrada),
        fgts: parseNum(fgts),
        capacidadeMensal: capacidadeMensal ? parseNum(capacidadeMensal) : null,
        prazoFinanciamentoMeses: prazo,
        parcelasSinal,
        usarResidualPosChaves: residual,
      });
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadeSel?.preco, renda, entrada, fgts, capacidadeMensal, prazo, parcelasSinal, residual]);

  const submit = async (e) => {
    e.preventDefault();
    if (!podeSimular) {
      setError("Preencha unidade, renda e o valor disponível para o sinal.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/simulacao`, {
        unidade_numero: unidadeNumero,
        renda_bruta: parseNum(renda),
        entrada: parseNum(entrada),
        fgts: parseNum(fgts),
        capacidade_mensal: capacidadeMensal ? parseNum(capacidadeMensal) : null,
        prazo_meses: prazo,
        parcelas_sinal: parcelasSinal,
        usar_residual_pos_chaves: residual,
      });

      setSimulacao({
        renda_bruta: parseNum(renda),
        entrada: parseNum(entrada),
        fgts: parseNum(fgts),
        prazo_meses: prazo,
        parcela_estimada: data.parcela_bancaria,
        faixa_mcmv: data.faixa?.nome || null,
        unidade_numero: unidadeNumero,
        valor_imovel: data.valor_imovel,
        sinal_total: data.sinal_total,
        valor_financiado: data.valor_financiado,
        aprovado: data.aprovado,
        _raw: data,
      });
      markModuloVisitado("simulador");
      goTo("resultado_simulacao");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Não foi possível simular. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const modeloDaUnidade = unidadeSel
    ? CASA_MODELOS.find((m) => m.id === unidadeSel.modelo)
    : null;

  return (
    <section
      data-testid="modulo-simulador"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">
        <div className="fade-up">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
            Módulo 4 • Simulador
          </div>
          <h1
            className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl"
            style={{ color: "var(--torres-ink)" }}
          >
            Simule sua proposta completa.
          </h1>
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--torres-muted)" }}>
            Considera sinal (13%), pagamentos até as chaves (20% total),
            financiamento bancário (80%) com regras MCMV/SBPE e FGTS. Resultado
            em segundos.
          </p>
          <div
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-4 py-2 text-xs font-semibold"
            style={{ color: "var(--torres-muted)" }}
          >
            <Home className="h-3.5 w-3.5" />
            {resumo.disponivel} de {resumo.total} unidades disponíveis
          </div>
        </div>

        {/* Banner de ajuda — pensado para leads com baixa familiaridade com simuladores */}
        <div
          data-testid="simulador-ajuda-banner"
          className="fade-up fade-up-delay-1 mt-6 overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 sm:p-6"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"
                aria-hidden
              >
                <HelpCircle className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <div className="serif text-base font-semibold sm:text-lg" style={{ color: "var(--torres-ink)" }}>
                  Quer que a gente te ajude a preencher?
                </div>
                <div className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
                  Sem problema nenhum. Um corretor pega seu caso em minutos e faz a
                  conta com você — por WhatsApp ou em uma visita rápida.
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => goTo("imediato")}
                data-testid="simulador-ajuda-whatsapp-btn"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.55)] transition-all hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                Falar agora no WhatsApp
              </button>
              <button
                type="button"
                onClick={() => goTo("agendamento")}
                data-testid="simulador-ajuda-agendar-btn"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border-2 border-emerald-600 bg-white px-5 py-3 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-50"
              >
                <Calendar className="h-4 w-4" />
                Prefiro agendar
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]" data-testid="simulador-form">
          {/* Left: inputs */}
          <div className="space-y-6">
            {/* Unidade */}
            <Field label="1. Escolha a unidade">
              <div className="flex flex-wrap gap-2" data-testid="simulador-unidades">
                {unidadesDisp.map((u) => {
                  const isSel = unidadeNumero === u.numero;
                  return (
                    <button
                      key={u.numero}
                      type="button"
                      data-testid={`unidade-${u.numero}`}
                      onClick={() => setUnidadeNumero(u.numero)}
                      className={`inline-flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                        isSel
                          ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                          : "border-[color:var(--torres-line)] bg-white hover:border-[color:var(--torres-indigo)]/60"
                      }`}
                    >
                      <span className={`text-[10px] uppercase tracking-wider ${isSel ? "text-white/80" : ""}`} style={!isSel ? { color: "var(--torres-muted)" } : {}}>
                        Casa {u.numero}
                      </span>
                      <span className={`text-xs font-semibold ${isSel ? "text-white" : ""}`} style={!isSel ? { color: "var(--torres-ink)" } : {}}>
                        {u.nome}
                      </span>
                      <span className={`serif text-sm font-bold ${isSel ? "text-white" : ""}`} style={!isSel ? { color: "var(--torres-indigo)" } : {}}>
                        {formatBRL(u.preco)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Renda */}
            <Field label="2. Renda familiar bruta mensal (R$)">
              <input
                type="text"
                inputMode="numeric"
                value={renda}
                onChange={(e) => setRenda(formatBRLInput(e.target.value))}
                placeholder="Ex: 6.000"
                data-testid="simulador-renda"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </Field>

            {/* Entrada sinal + FGTS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="3. Disponível hoje para o sinal (R$)"
                hint="Pode ser parcelado em até 3x. Não precisa dos 20% já!"
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={entrada}
                  onChange={(e) => setEntrada(formatBRLInput(e.target.value))}
                  placeholder="Ex: 20.000"
                  data-testid="simulador-entrada"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </Field>
              <Field
                label="4. Saldo FGTS (R$)"
                hint="Reduz o financiamento bancário — não precisa estar disponível agora."
              >
                <input
                  type="text"
                  inputMode="numeric"
                  value={fgts}
                  onChange={(e) => setFgts(formatBRLInput(e.target.value))}
                  placeholder="Ex: 40.000"
                  data-testid="simulador-fgts"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </Field>
            </div>

            {/* Capacidade mensal durante a obra */}
            <Field
              label="5. Capacidade mensal durante a obra (R$) — opcional"
              hint="Durante ~15 meses, até as chaves. Se deixar em branco, mostramos a parcela esperada pra você validar."
            >
              <input
                type="text"
                inputMode="numeric"
                value={capacidadeMensal}
                onChange={(e) => setCapacidadeMensal(formatBRLInput(e.target.value))}
                placeholder="Ex: 2.000"
                data-testid="simulador-capacidade-mensal"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </Field>

            {/* Prazo + parcelas sinal */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="6. Prazo do financiamento">
                <div className="flex gap-2 flex-wrap" data-testid="simulador-prazos">
                  {[240, 300, 360, 420].map((p) => (
                    <button
                      key={p}
                      type="button"
                      data-testid={`prazo-${p}`}
                      onClick={() => setPrazo(p)}
                      className={`flex-1 min-w-[70px] rounded-xl border py-3 text-sm font-semibold transition-all ${
                        prazo === p
                          ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                          : "border-[color:var(--torres-line)] bg-white hover:border-[color:var(--torres-indigo)]/60"
                      }`}
                    >
                      {p / 12} anos
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="7. Parcelas do sinal (13%)">
                <div className="flex gap-2" data-testid="simulador-sinal-parcelas">
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      type="button"
                      data-testid={`sinal-${p}x`}
                      onClick={() => setParcelasSinal(p)}
                      className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-all ${
                        parcelasSinal === p
                          ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                          : "border-[color:var(--torres-line)] bg-white hover:border-[color:var(--torres-indigo)]/60"
                      }`}
                    >
                      {p}x
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Residual */}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--torres-line)] bg-white p-4">
              <input
                type="checkbox"
                checked={residual}
                onChange={(e) => setResidual(e.target.checked)}
                data-testid="simulador-residual"
                className="mt-0.5 h-4 w-4 accent-[color:var(--torres-indigo)]"
              />
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                  Usar residual pós-chaves (até R$ 20 mil)
                </div>
                <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                  Reduz o financiamento, parcelável em até 20 meses após a entrega.
                </div>
              </div>
            </label>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" data-testid="simulador-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!podeSimular || loading}
              data-testid="simulador-submit-btn"
              className={`group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
                podeSimular && !loading
                  ? "btn-primary-torres"
                  : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4" />
                  Ver minha proposta
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Ajuda compacta pós-formulário — para quem travou no preenchimento */}
            <div
              data-testid="simulador-ajuda-rodape"
              className="rounded-2xl border border-[color:var(--torres-line)] bg-white p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2 text-xs font-semibold" style={{ color: "var(--torres-muted)" }}>
                <HelpCircle className="h-3.5 w-3.5" />
                Travou em algum campo? Sem problema.
              </div>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => goTo("imediato")}
                  data-testid="simulador-ajuda-rodape-whatsapp-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Me ajuda pelo WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => goTo("agendamento")}
                  data-testid="simulador-ajuda-rodape-agendar-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--torres-indigo)] bg-white px-4 py-2 text-xs font-semibold transition-all hover:bg-[color:var(--torres-indigo)]/5"
                  style={{ color: "var(--torres-indigo)" }}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Agendar uma conversa
                </button>
              </div>
            </div>
          </div>

          {/* Right: espelho dinâmico da proposta */}
          <aside>
            <div
              className="sticky top-20 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6"
              data-testid="simulador-espelho"
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  Espelho da proposta
                </div>
                {previa && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      previa.aprovadoGeral
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                    data-testid="simulador-espelho-status"
                  >
                    {previa.aprovadoGeral ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Apto
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3" />
                        Ajustar
                      </>
                    )}
                  </span>
                )}
              </div>

              {unidadeSel ? (
                <>
                  <div className="serif mt-2 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
                    Casa {unidadeSel.numero} — {unidadeSel.nome}
                  </div>
                  <div className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
                    {modeloDaUnidade?.areaPrivativa} m² privativos • {modeloDaUnidade?.quartos} quartos
                    {modeloDaUnidade?.lavabo ? " + lavabo" : ""}
                  </div>
                  <div className="my-5 border-t border-[color:var(--torres-line)]"></div>

                  <Row icon={<TrendingUp className="h-3.5 w-3.5" />} label="Valor do imóvel" value={formatBRL(unidadeSel.preco)} />
                  <Row icon={<Percent className="h-3.5 w-3.5" />} label={`Sinal (13%) em ${parcelasSinal}x`} value={previa ? `${parcelasSinal}x ${formatBRL(previa.parcelaSinal)}` : formatBRL(unidadeSel.preco * 0.13)} />
                  <Row icon={<Percent className="h-3.5 w-3.5" />} label="Complemento até chaves" value={previa ? `${previa.mesesComplemento}x ${formatBRL(previa.parcelaComplemento)}` : formatBRL(unidadeSel.preco * 0.07)} />
                  <Row
                    icon={<Percent className="h-3.5 w-3.5" />}
                    label={`Financiamento (${prazo / 12} anos)`}
                    value={previa ? `${prazo}x ${formatBRL(previa.parcelaBancaria)}` : formatBRL(unidadeSel.preco * 0.8)}
                    destaque
                  />
                  {previa && residual && (
                    <Row
                      icon={<Percent className="h-3.5 w-3.5" />}
                      label="Residual pós-chaves"
                      value={`20x ${formatBRL(previa.parcelaResidual)}`}
                    />
                  )}

                  {previa && (
                    <>
                      <div className="my-4 border-t border-[color:var(--torres-line)]"></div>
                      <Row
                        icon={<TrendingUp className="h-3.5 w-3.5" />}
                        label={`Faixa: ${previa.faixa.nome}`}
                        value={`${(previa.taxaAA * 100).toFixed(2)}% a.a.`}
                      />
                      <Row
                        icon={<Home className="h-3.5 w-3.5" />}
                        label="Limite (30% da renda)"
                        value={formatBRL(previa.limiteComprometimento)}
                      />
                      {!previa.aprovadoCapacidade && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800" data-testid="simulador-alerta-parcela">
                          ⚠ Parcela {formatBRL(previa.parcelaBancaria)} passa do limite ({formatBRL(previa.limiteComprometimento)}). Tente prazo maior ou aumente o FGTS.
                        </div>
                      )}
                      {!previa.sinalOk && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800" data-testid="simulador-alerta-sinal">
                          ⚠ Pro sinal em {previa.parcelasSinal}x, precisa de ~{formatBRL(previa.parcelaSinal)} hoje.
                        </div>
                      )}
                      {!previa.complementoOk && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-800" data-testid="simulador-alerta-complemento">
                          ⚠ Durante a obra: {formatBRL(previa.parcelaComplemento)}/mês por {previa.mesesComplemento} meses. Sua capacidade mensal não cobre.
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="mt-3 text-sm" style={{ color: "var(--torres-muted)" }}>
                  Escolha uma unidade acima para ver o resumo.
                </div>
              )}
              <div className="mt-6 flex items-start gap-2 rounded-xl bg-[color:var(--torres-indigo)]/5 p-3 text-xs" style={{ color: "var(--torres-indigo-deep)" }}>
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Simulação aproximada. Valores oficiais são confirmados pelo banco após análise.
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
        {label}
      </label>
      {hint && (
        <div className="mb-2 text-[11px]" style={{ color: "var(--torres-muted)" }}>
          💡 {hint}
        </div>
      )}
      {children}
    </div>
  );
}

function Row({ icon, label, value, destaque }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-sm ${destaque ? "rounded-lg bg-[color:var(--torres-indigo)]/5 px-3 -mx-1 my-1" : ""}`}>
      <span className="inline-flex items-center gap-1.5" style={{ color: "var(--torres-muted)" }}>
        {icon}
        {label}
      </span>
      <span className="serif font-semibold text-right" style={{ color: destaque ? "var(--torres-indigo-deep)" : "var(--torres-ink)" }}>
        {value}
      </span>
    </div>
  );
}
