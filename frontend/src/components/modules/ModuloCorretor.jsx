import React, { useEffect } from "react";
import { useJourney } from "../../context/JourneyContext";
import { Zap, Calendar, ArrowRight } from "lucide-react";

export default function ModuloCorretor() {
  const { markModuloVisitado, goTo, leadScore, temperatura } = useJourney();

  useEffect(() => {
    markModuloVisitado("corretor");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      data-testid="modulo-corretor"
      className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="fade-up text-center">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
            Módulo 6 • Atendimento
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--torres-ink)" }}>
            Como prefere ser atendido?
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
            Seu score atual é <strong style={{ color: "var(--torres-indigo)" }}>{leadScore}/150</strong> ({temperatura}). Quanto maior, mais prioridade no atendimento.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <button
            onClick={() => goTo("imediato")}
            data-testid="corretor-imediato-btn"
            className="group relative flex h-full flex-col items-start overflow-hidden rounded-3xl border-2 border-[color:var(--torres-indigo)] bg-white p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_-20px_rgba(100,113,162,0.55)] fade-up"
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "var(--torres-indigo)", color: "#fff" }}
            >
              <Zap className="h-6 w-6" />
            </div>
            <div
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Online agora
            </div>
            <h3 className="serif mt-3 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Atendimento imediato
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
              Fale agora mesmo pelo WhatsApp com a equipe. Tempo médio de
              resposta: menos de 2 minutos.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs" style={{ color: "var(--torres-ink)" }}>
              <li>✓ Resposta em minutos</li>
              <li>✓ Seu perfil e escolhas já compartilhados</li>
              <li>✓ Respostas objetivas sobre a unidade</li>
            </ul>
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              style={{ backgroundColor: "var(--torres-indigo)", color: "#fff" }}
            >
              Falar agora
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          <button
            onClick={() => goTo("agendamento")}
            data-testid="corretor-agendar-btn"
            className="group relative flex h-full flex-col items-start overflow-hidden rounded-3xl border border-[color:var(--torres-line)] bg-white p-8 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--torres-indigo)] hover:shadow-[0_30px_60px_-20px_rgba(100,113,162,0.45)] fade-up"
            style={{ animationDelay: "80ms" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "rgba(100,113,162,0.1)", color: "var(--torres-indigo)" }}
            >
              <Calendar className="h-6 w-6" />
            </div>
            <div className="mt-4 inline-flex items-center rounded-full bg-[color:var(--torres-line)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--torres-ink)" }}>
              Seu horário, seu jeito
            </div>
            <h3 className="serif mt-3 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Agendar atendimento
            </h3>
            <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
              Escolha dia, horário e formato: no decorado, visita ao imóvel ou
              videochamada. Flexibilidade total.
            </p>
            <ul className="mt-4 space-y-1.5 text-xs" style={{ color: "var(--torres-ink)" }}>
              <li>✓ 3 formatos disponíveis</li>
              <li>✓ Você escolhe data e hora</li>
              <li>✓ Confirmação imediata</li>
            </ul>
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-indigo)] px-4 py-2 text-sm font-semibold"
              style={{ color: "var(--torres-indigo)" }}
            >
              Agendar
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
