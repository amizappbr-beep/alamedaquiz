import React from "react";
import { useJourney } from "../context/JourneyContext";
import { MODULOS } from "../lib/conteudo";
import {
  ArrowRight,
  Building2,
  Home,
  UserRound,
  Calculator,
  Sparkles,
  MessageCircle,
  MapPin,
  Lock,
  Check,
} from "lucide-react";
import { ALAMEDA_IMAGES } from "../lib/assets";

const ICON_MAP = { Building2, Home, UserRound, Calculator, Sparkles, MessageCircle };

export default function Hub() {
  const {
    goTo,
    modulos_visitados,
    leadScore,
    temperatura,
    casa_preferida,
    classification,
  } = useJourney();

  const corretorHabilitado = modulos_visitados.length >= 2;

  return (
    <section
      data-testid="hub-screen"
      className="relative min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)]"
    >
      {/* Hero faixa */}
      <div className="relative overflow-hidden border-b border-[color:var(--torres-line)]">
        <div className="absolute inset-0 -z-10">
          <img
            src={ALAMEDA_IMAGES.fachadaDia}
            alt=""
            className="h-full w-full object-cover opacity-[0.18]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,250,252,0.4) 0%, var(--torres-cream) 100%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="fade-up flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--torres-indigo)" }}
          >
            <MapPin className="h-3 w-3" />
            Alterosas, Serra — ES
          </div>
          <h1
            className="fade-up fade-up-delay-1 serif mt-3 max-w-3xl text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-[60px]"
            style={{ color: "var(--torres-ink)" }}
          >
            Bem-vindo ao{" "}
            <span style={{ color: "var(--torres-indigo)" }} className="italic">
              Alameda 500
            </span>
            . Explore do seu jeito.
          </h1>
          <p
            className="fade-up fade-up-delay-2 mt-5 max-w-2xl text-base sm:text-lg"
            style={{ color: "var(--torres-muted)" }}
          >
            Uma jornada interativa para você conhecer cada detalhe, descobrir
            qual casa combina com você e só falar com um corretor quando estiver
            pronto. Sem pressão, no seu ritmo.
          </p>

          {/* Status pills */}
          <div className="fade-up fade-up-delay-3 mt-8 flex flex-wrap items-center gap-2">
            {modulos_visitados.length > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--torres-indigo)]/30 bg-white px-3 py-1.5 text-[11px] font-semibold"
                style={{ color: "var(--torres-indigo)" }}
              >
                <Check className="h-3 w-3" />
                {modulos_visitados.length} módulo
                {modulos_visitados.length > 1 ? "s" : ""} explorado
                {modulos_visitados.length > 1 ? "s" : ""}
              </span>
            )}
            {casa_preferida && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--torres-indigo)]/30 bg-white px-3 py-1.5 text-[11px] font-semibold" style={{ color: "var(--torres-indigo)" }}>
                <Home className="h-3 w-3" />
                Casa escolhida
              </span>
            )}
            {classification && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize"
                style={{
                  borderColor: "rgba(100,113,162,0.35)",
                  backgroundColor: "rgba(100,113,162,0.08)",
                  color: "var(--torres-indigo-deep)",
                }}
              >
                <UserRound className="h-3 w-3" />
                Perfil {classification}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--torres-muted)" }}
            >
              Sua jornada
            </div>
            <h2
              className="serif mt-2 text-2xl font-semibold sm:text-3xl"
              style={{ color: "var(--torres-ink)" }}
            >
              Por onde quer começar?
            </h2>
          </div>
          {!corretorHabilitado && (
            <div
              className="hidden rounded-full border border-[color:var(--torres-line)] bg-white px-3 py-1.5 text-[11px] sm:block"
              style={{ color: "var(--torres-muted)" }}
            >
              Explore 2 módulos pra liberar "Falar com corretor"
            </div>
          )}
        </div>

        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="hub-grid"
        >
          {MODULOS.map((m, idx) => {
            const Icon = ICON_MAP[m.icon] || Home;
            const visitado = modulos_visitados.includes(m.id);
            const bloqueado = m.isFinal && !corretorHabilitado;
            const isSimulador = m.id === "simulador";
            return (
              <button
                key={m.id}
                data-testid={`hub-module-${m.id}`}
                onClick={() => {
                  if (bloqueado) return;
                  goTo(m.id);
                }}
                disabled={bloqueado}
                className={`group relative flex flex-col items-start overflow-hidden rounded-2xl border bg-white p-6 text-left transition-all duration-300 fade-up ${
                  bloqueado
                    ? "cursor-not-allowed opacity-60"
                    : "hover:-translate-y-1 hover:border-[color:var(--torres-indigo)] hover:shadow-[0_20px_40px_-20px_rgba(100,113,162,0.4)]"
                } ${visitado ? "border-[color:var(--torres-indigo)]/40" : "border-[color:var(--torres-line)]"}`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                {/* Top row */}
                <div className="flex w-full items-start justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: "rgba(100,113,162,0.08)",
                      color: "var(--torres-indigo)",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {visitado && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-[color:var(--torres-indigo)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--torres-indigo)" }}
                    >
                      <Check className="h-3 w-3" />
                      Visitado
                    </span>
                  )}
                  {isSimulador && m.badge && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                      {m.badge}
                    </span>
                  )}
                  {bloqueado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--torres-line)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--torres-muted)]">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                {/* Title + description */}
                <h3
                  className="serif mt-5 text-xl font-semibold leading-snug"
                  style={{ color: "var(--torres-ink)" }}
                >
                  {m.titulo}
                </h3>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--torres-muted)" }}
                >
                  {m.descricao}
                </p>

                {/* CTA row */}
                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--torres-indigo)" }}>
                  {m.isFinal ? "Escolher tipo de atendimento" : visitado ? "Revisitar" : "Começar"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Score hint */}
        <div
          className="mt-10 flex flex-col gap-2 rounded-2xl border border-[color:var(--torres-line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          data-testid="hub-score-hint"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Seu score de engajamento
            </div>
            <div className="serif mt-1 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              {leadScore}{" "}
              <span
                className="text-sm font-medium capitalize"
                style={{ color: "var(--torres-muted)" }}
              >
                / 150 • Lead {temperatura}
              </span>
            </div>
          </div>
          <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
            Quanto mais você explora, maior a prioridade no atendimento.
          </div>
        </div>
      </div>
    </section>
  );
}
