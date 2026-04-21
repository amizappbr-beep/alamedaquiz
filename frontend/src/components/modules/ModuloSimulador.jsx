import React, { useEffect } from "react";
import { useJourney } from "../../context/JourneyContext";
import { Calculator, ArrowRight, Lock } from "lucide-react";

export default function ModuloSimulador() {
  const { markModuloVisitado, goTo } = useJourney();

  useEffect(() => {
    markModuloVisitado("simulador");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      data-testid="modulo-simulador"
      className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-xl text-center fade-up">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: "rgba(100,113,162,0.1)" }}
        >
          <Calculator className="h-8 w-8" style={{ color: "var(--torres-indigo)" }} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
          Módulo 4 • Simulador
        </div>
        <h1
          className="serif mt-3 text-3xl font-semibold leading-tight sm:text-4xl"
          style={{ color: "var(--torres-ink)" }}
        >
          Simulador de financiamento MCMV / Caixa
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
          Chegando na próxima fase: calcule sua parcela estimada com as regras
          oficiais do programa Minha Casa Minha Vida e SBPE. Use sua renda,
          FGTS e entrada — saiba em qual faixa você se encaixa.
        </p>

        <div
          className="mt-8 flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800"
          data-testid="simulador-em-breve"
        >
          <Lock className="h-3.5 w-3.5" />
          Em breve — Fase 2 da plataforma
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => goTo("corretor")}
            data-testid="simulador-corretor-btn"
            className="btn-primary-torres group inline-flex items-center gap-2"
          >
            Falar com corretor pra simular
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => goTo("hub")}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-[color:var(--torres-indigo)]"
          >
            Voltar ao hub
          </button>
        </div>
      </div>
    </section>
  );
}
