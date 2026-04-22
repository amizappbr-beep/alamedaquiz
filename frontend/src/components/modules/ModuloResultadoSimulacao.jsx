import React from "react";
import { useJourney } from "../../context/JourneyContext";
import { formatBRL } from "../../lib/tabelaVendas";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Calculator,
  Sparkles,
  MessageCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";

export default function ModuloResultadoSimulacao() {
  const { simulacao, goTo } = useJourney();
  const raw = simulacao?._raw;
  const aprovado = raw?.aprovado;

  if (!raw) {
    return (
      <section
        data-testid="modulo-resultado-simulacao"
        className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-[color:var(--torres-cream)] px-6"
      >
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--torres-muted)" }}>
            Nenhuma simulação encontrada.
          </p>
          <button
            onClick={() => goTo("simulador")}
            className="btn-primary-torres mt-4 inline-flex items-center gap-2"
          >
            Simular agora
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="modulo-resultado-simulacao"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1100px]">
        {/* Status hero */}
        <div className="fade-up">
          {aprovado ? (
            <div
              data-testid="resultado-aprovado"
              className="flex flex-col gap-5 rounded-3xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-white p-8 sm:flex-row sm:items-center sm:p-10"
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#059669", color: "#fff" }}
              >
                <CheckCircle2 className="h-9 w-9" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-emerald-700">
                  🎉 Pré-qualificado
                </div>
                <h1 className="serif mt-1 text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: "var(--torres-ink)" }}>
                  Parabéns! Seu perfil se encaixa.
                </h1>
                <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--torres-muted)" }}>
                  Com a renda informada e seus recursos próprios, você tem
                  capacidade para esta compra. Vamos dar o próximo passo e
                  garantir sua unidade antes que ela seja reservada por outro
                  cliente?
                </p>
              </div>
            </div>
          ) : (
            <div
              data-testid="resultado-apoio"
              className="flex flex-col gap-5 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-8 sm:flex-row sm:items-center sm:p-10"
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: "#d97706", color: "#fff" }}
              >
                <AlertCircle className="h-9 w-9" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-amber-800">
                  Quase lá
                </div>
                <h1 className="serif mt-1 text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: "var(--torres-ink)" }}>
                  Vamos encontrar o caminho juntos.
                </h1>
                <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--torres-muted)" }}>
                  Nosso especialista pode ajustar prazo, entrada ou indicar
                  outra unidade com parcela que caiba no seu bolso.
                </p>
                {raw.razoes?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs" style={{ color: "var(--torres-ink)" }}>
                    {raw.razoes.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span>•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Breakdown */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]" data-testid="resultado-breakdown">
          <div className="rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 sm:p-8">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Detalhes da proposta
            </div>
            <h2 className="serif mt-2 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Casa {raw.unidade?.numero} — {raw.unidade?.nome}
            </h2>
            <div className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
              Faixa {raw.faixa?.nome} • taxa {(raw.taxa_aa * 100).toFixed(2)}% a.a.
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <LineItem
                titulo={`Sinal — ${raw.parcelas_sinal}x de ${formatBRL(raw.parcela_sinal)}`}
                subtitulo={`Total ${formatBRL(raw.sinal_total)} (13%)`}
                icon="💳"
              />
              <LineItem
                titulo={`Complemento até chaves — ${raw.meses_complemento}x de ${formatBRL(raw.parcela_complemento)}`}
                subtitulo={`Total ${formatBRL(raw.complemento_ate_chaves)} (7% aprox.)`}
                icon="🔑"
              />
              <LineItem
                titulo={`Financiamento bancário — ${raw.prazo_meses}x de ${formatBRL(raw.parcela_bancaria)}`}
                subtitulo={`Valor financiado: ${formatBRL(raw.valor_financiado)}`}
                icon="🏦"
                destaque
              />
              {raw.residual > 0 && (
                <LineItem
                  titulo={`Residual pós-chaves — 20x de ${formatBRL(raw.parcela_residual)}`}
                  subtitulo={`Total ${formatBRL(raw.residual)}`}
                  icon="📆"
                />
              )}
            </div>

            <div className="mt-6 space-y-3 rounded-2xl border border-[color:var(--torres-line)] p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                  Valor do imóvel
                </span>
                <span className="serif text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
                  {formatBRL(raw.valor_imovel)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                  Parcela bancária
                </span>
                <span className="serif text-lg font-semibold" style={{ color: aprovado ? "#059669" : "#d97706" }}>
                  {formatBRL(raw.parcela_bancaria)}/mês
                </span>
              </div>
            </div>
          </div>

          {/* Call to action lateral */}
          <aside className="rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 sm:p-8">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
              Próximo passo
            </div>
            {aprovado ? (
              <>
                <h3 className="serif mt-2 text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
                  Vamos dar o próximo passo?
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
                  Só 7 unidades disponíveis no Alameda 500. Garanta a sua agora
                  com uma conversa direta ou uma visita presencial.
                </p>
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => goTo("imediato")}
                    data-testid="resultado-imediato-btn"
                    className="btn-primary-torres group inline-flex w-full items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Reservar agora pelo WhatsApp
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => goTo("agendamento")}
                    data-testid="resultado-agendar-btn"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--torres-indigo)] bg-white px-5 py-3 text-sm font-semibold transition-all hover:bg-[color:var(--torres-indigo)]/5"
                    style={{ color: "var(--torres-indigo)" }}
                  >
                    <Calendar className="h-4 w-4" />
                    Agendar visita
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="serif mt-2 text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
                  Fale com um especialista.
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
                  Podemos ajustar o cenário — prazo maior, parcelas do sinal,
                  FGTS, ou outra unidade — pra fechar no seu bolso.
                </p>
                <div className="mt-5 space-y-2">
                  <button
                    onClick={() => goTo("imediato")}
                    data-testid="resultado-falar-especialista-btn"
                    className="btn-primary-torres group inline-flex w-full items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Falar com especialista
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => goTo("simulador")}
                    data-testid="resultado-simular-novamente-btn"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-[color:var(--torres-indigo)]"
                    style={{ color: "var(--torres-ink)" }}
                  >
                    <Calculator className="h-4 w-4" />
                    Simular outro cenário
                  </button>
                </div>
              </>
            )}
            <button
              onClick={() => goTo("hub")}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-colors"
              style={{ color: "var(--torres-muted)" }}
            >
              <RotateCcw className="h-3 w-3" />
              Voltar ao hub
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}

function LineItem({ titulo, subtitulo, icon, destaque }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 ${
        destaque ? "border-[color:var(--torres-indigo)]/30 bg-[color:var(--torres-indigo)]/5" : "border-[color:var(--torres-line)]"
      }`}
    >
      <div className="text-xl">{icon}</div>
      <div>
        <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
          {titulo}
        </div>
        <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
          {subtitulo}
        </div>
      </div>
    </div>
  );
}
