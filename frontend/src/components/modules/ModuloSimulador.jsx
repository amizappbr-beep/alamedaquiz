import React, { useEffect, useState } from "react";
import axios from "axios";
import { useJourney } from "../../context/JourneyContext";
import { UNIDADES, PRECO_MODELO, formatBRL, resumoDisponibilidade } from "../../lib/tabelaVendas";
import { CASA_MODELOS } from "../../lib/conteudo";
import {
  Calculator,
  ArrowRight,
  Info,
  Loader2,
  TrendingUp,
  Home,
  Percent,
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
    markModuloVisitado,
    goTo,
    setSimulacao,
    quiz_answers,
    casa_preferida,
  } = useJourney();

  const [unidadeNumero, setUnidadeNumero] = useState(null);
  const [renda, setRenda] = useState("");
  const [entrada, setEntrada] = useState("");
  const [fgts, setFgts] = useState("");
  const [prazo, setPrazo] = useState(360);
  const [parcelasSinal, setParcelasSinal] = useState(3);
  const [residual, setResidual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    markModuloVisitado("simulador");
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
    unidadeNumero && parseNum(renda) > 0 && parseNum(entrada) + parseNum(fgts) > 0;

  const submit = async (e) => {
    e.preventDefault();
    if (!podeSimular) {
      setError("Preencha unidade, renda e pelo menos entrada ou FGTS.");
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

            {/* Entrada + FGTS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="3. Entrada disponível (R$)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={entrada}
                  onChange={(e) => setEntrada(formatBRLInput(e.target.value))}
                  placeholder="Ex: 30.000"
                  data-testid="simulador-entrada"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </Field>
              <Field label="4. FGTS disponível (R$)">
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

            {/* Prazo + parcelas sinal */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="5. Prazo do financiamento">
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
              <Field label="6. Parcelas do sinal (13%)">
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
          </div>

          {/* Right: preview card */}
          <aside>
            <div className="sticky top-20 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6">
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Resumo da compra
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
                  <Row icon={<Percent className="h-3.5 w-3.5" />} label="Sinal (13%)" value={formatBRL(unidadeSel.preco * 0.13)} />
                  <Row icon={<Percent className="h-3.5 w-3.5" />} label="Pago até chaves (20%)" value={formatBRL(unidadeSel.preco * 0.2)} />
                  <Row icon={<Percent className="h-3.5 w-3.5" />} label="Financiado banco (80%)" value={formatBRL(unidadeSel.preco * 0.8)} />
                </>
              ) : (
                <div className="mt-3 text-sm" style={{ color: "var(--torres-muted)" }}>
                  Escolha uma unidade acima para ver o resumo.
                </div>
              )}
              <div className="mt-6 flex items-start gap-2 rounded-xl bg-[color:var(--torres-indigo)]/5 p-3 text-xs" style={{ color: "var(--torres-indigo-deep)" }}>
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Simulação aproximada. Valores oficiais são confirmados pelo banco após análise de crédito.
              </div>
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="inline-flex items-center gap-1.5" style={{ color: "var(--torres-muted)" }}>
        {icon}
        {label}
      </span>
      <span className="serif font-semibold" style={{ color: "var(--torres-ink)" }}>
        {value}
      </span>
    </div>
  );
}
