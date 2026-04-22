import React from "react";
import { useJourney } from "../context/JourneyContext";
import { MODULOS } from "../lib/conteudo";
import { gerarInsights } from "../lib/quizData";
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
  TrendingUp,
  Zap,
} from "lucide-react";
import { ALAMEDA_IMAGES } from "../lib/assets";

const ICON_MAP = { Building2, Home, UserRound, Calculator, Sparkles, MessageCircle, MapPin };

export default function Hub() {
  const {
    goTo,
    modulos_visitados,
    leadScore,
    temperatura,
    casa_preferida,
    classification,
    quiz_answers,
    simulacao,
  } = useJourney();

  const corretorHabilitado = modulos_visitados.length >= 2;
  const insights = gerarInsights(quiz_answers).slice(0, 3);

  return (
    <section
      data-testid="hub-screen"
      className="relative min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)]"
    >
      {/* Hero */}
      <div className="relative isolate overflow-hidden border-b border-[color:var(--torres-line)]">
        <div className="absolute inset-0 z-0">
          <img src={ALAMEDA_IMAGES.fachadaPrincipalNoturna} alt="" className="h-full w-full object-cover" />
          {/* Dark overlay for readability + soft gradient into cream at the bottom */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(20,22,34,0.72) 0%, rgba(20,22,34,0.55) 45%, rgba(20,22,34,0.25) 100%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{
              background:
                "linear-gradient(180deg, rgba(251,250,252,0) 0%, var(--torres-cream) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1320px] px-6 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
          <div className="fade-up flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/90">
            <MapPin className="h-3 w-3" />
            Alterosas, Serra — ES
          </div>
          <h1 className="fade-up fade-up-delay-1 serif mt-3 max-w-3xl text-4xl font-semibold leading-[1.04] text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] sm:text-5xl lg:text-[60px]">
            Bem-vindo ao{" "}
            <span className="italic" style={{ color: "#c7cfe8" }}>
              Alameda 500
            </span>
            . Explore do seu jeito.
          </h1>
          <p className="fade-up fade-up-delay-2 mt-5 max-w-2xl text-base text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)] sm:text-lg">
            Uma jornada interativa pra você conhecer cada detalhe, descobrir
            qual casa combina com você e só falar com um corretor quando
            estiver pronto. Sem pressão, no seu ritmo.
          </p>

          <div className="fade-up fade-up-delay-3 mt-8 flex flex-wrap items-center gap-2">
            {modulos_visitados.length > 0 && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
                style={{ borderColor: "#a7f3d0", backgroundColor: "#ecfdf5", color: "#047857" }}
              >
                <Check className="h-3 w-3" />
                {modulos_visitados.length} módulo{modulos_visitados.length > 1 ? "s" : ""} concluído{modulos_visitados.length > 1 ? "s" : ""}
              </span>
            )}
            {casa_preferida && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                <Home className="h-3 w-3" />
                Casa escolhida
              </span>
            )}
            {classification && (
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold capitalize" style={{ borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", backdropFilter: "blur(8px)" }}>
                <UserRound className="h-3 w-3" />
                Perfil {classification}
              </span>
            )}
            {simulacao?.aprovado === true && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                Pré-qualificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Módulos */}
      <div className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-16 lg:py-16">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Sua jornada
            </div>
            <h2 className="serif mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--torres-ink)" }}>
              Sugerimos seguir nesta ordem:
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
              Cada etapa prepara você melhor para a próxima — mas você escolhe por onde começar.
            </p>
          </div>
          <button
            onClick={() => {
              if (corretorHabilitado) goTo("corretor");
              else goTo("empreendimento");
            }}
            data-testid="hub-shortcut-corretor"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-indigo)] bg-white px-4 py-2.5 text-xs font-semibold transition-all hover:bg-[color:var(--torres-indigo)] hover:text-white"
            style={{ color: "var(--torres-indigo)" }}
          >
            <Zap className="h-3.5 w-3.5" />
            Prefiro falar com o corretor agora
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="hub-grid">
          {MODULOS.map((m, idx) => {
            const Icon = ICON_MAP[m.icon] || Home;
            const visitado = modulos_visitados.includes(m.id);
            const bloqueado = m.isFinal && !corretorHabilitado;
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
                    : "hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(100,113,162,0.4)]"
                } ${
                  visitado
                    ? "border-emerald-300 shadow-[0_0_0_1px_#a7f3d0_inset]"
                    : "border-[color:var(--torres-line)] hover:border-[color:var(--torres-indigo)]"
                }`}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex items-center gap-3">
                    {m.ordem && !m.isFinal && (
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: visitado ? "#059669" : "var(--torres-indigo)",
                          color: "#fff",
                        }}
                      >
                        {m.ordem}
                      </div>
                    )}
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: visitado ? "#d1fae5" : "rgba(100,113,162,0.08)",
                        color: visitado ? "#047857" : "var(--torres-indigo)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  {visitado && (
                    <span
                      data-testid={`hub-module-${m.id}-concluido`}
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                      Concluído
                    </span>
                  )}
                  {bloqueado && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--torres-line)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[color:var(--torres-muted)]">
                      <Lock className="h-3 w-3" />
                      Bloqueado
                    </span>
                  )}
                </div>

                <h3 className="serif mt-5 text-xl font-semibold leading-snug" style={{ color: "var(--torres-ink)" }}>
                  {m.titulo}
                </h3>
                <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
                  {m.descricao}
                </p>

                <div
                  className="mt-5 flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: visitado ? "#047857" : "var(--torres-indigo)" }}
                >
                  {m.isFinal ? "Escolher tipo de atendimento" : visitado ? "Revisitar" : "Começar"}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Insights (aparecem quando o usuário já respondeu parte do quiz) */}
        {insights.length > 0 && (
          <div
            className="mt-10 rounded-3xl border border-[color:var(--torres-indigo)]/20 bg-gradient-to-br from-[color:var(--torres-indigo)]/5 to-white p-6 sm:p-8"
            data-testid="hub-insights"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
              <Sparkles className="h-3 w-3" />
              Insights sobre seu perfil
            </div>
            <h3 className="serif mt-2 text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              O que já sabemos sobre você
            </h3>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  data-testid={`hub-insight-${idx}`}
                  className="flex items-start gap-3 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4"
                >
                  <div className="text-2xl">{ins.icon}</div>
                  <div>
                    <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                      {ins.titulo}
                    </div>
                    <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                      {ins.descricao}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score bar */}
        <div
          className="mt-8 flex flex-col gap-2 rounded-2xl border border-[color:var(--torres-line)] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
          data-testid="hub-score-hint"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Seu engajamento
            </div>
            <div className="serif mt-1 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              {leadScore}{" "}
              <span className="text-sm font-medium" style={{ color: "var(--torres-muted)" }}>
                / 150 •{" "}
                {temperatura === "quente"
                  ? "Perfil compatível com o produto"
                  : temperatura === "morno"
                  ? "Perfil em análise"
                  : "Explorando opções"}
              </span>
            </div>
          </div>
          <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
            Quanto mais você explora, melhor conseguimos te atender.
          </div>
        </div>
      </div>
    </section>
  );
}
