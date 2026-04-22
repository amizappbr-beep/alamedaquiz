import React from "react";
import { useJourney } from "../context/JourneyContext";
import { ArrowRight, Calendar, Zap } from "lucide-react";

/**
 * Card de CTA usado ao final de cada módulo.
 * Mostra o próximo passo recomendado (primário) + opções colaterais
 * "Agendar visita" e "Falar agora pelo WhatsApp".
 */
export default function ModuleFooterCTA({
  titulo,
  descricao,
  primary,
  testId,
}) {
  const { goTo } = useJourney();
  return (
    <div
      className="mt-12 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 sm:p-8"
      data-testid={testId || "module-footer-cta"}
    >
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className="serif text-xl font-semibold"
            style={{ color: "var(--torres-ink)" }}
          >
            {titulo}
          </div>
          {descricao && (
            <div
              className="mt-1 text-sm"
              style={{ color: "var(--torres-muted)" }}
            >
              {descricao}
            </div>
          )}
        </div>
        <button
          onClick={primary.onClick}
          data-testid={primary.testId}
          className="btn-primary-torres group inline-flex items-center gap-2 whitespace-nowrap"
        >
          {primary.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="mt-6 border-t border-[color:var(--torres-line)] pt-5">
        <div
          className="mb-3 text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "var(--torres-muted)" }}
        >
          Ou, se preferir, fale direto com um corretor
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            onClick={() => goTo("imediato")}
            data-testid={`${testId || "module-footer"}-imediato-btn`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
          >
            <Zap className="h-4 w-4" />
            Falar agora pelo WhatsApp
          </button>
          <button
            onClick={() => goTo("agendamento")}
            data-testid={`${testId || "module-footer"}-agendar-btn`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--torres-indigo)] bg-white px-5 py-2.5 text-sm font-semibold transition-all hover:bg-[color:var(--torres-indigo)]/5"
            style={{ color: "var(--torres-indigo)" }}
          >
            <Calendar className="h-4 w-4" />
            Agendar atendimento
          </button>
        </div>
      </div>
    </div>
  );
}
