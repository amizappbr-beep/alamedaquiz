import React from "react";
import { useJourney } from "../../context/JourneyContext";
import {
  BOOK_PAGES,
  getBookPage,
  getNextStage,
  getPrevStage,
} from "../../lib/bookPages";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

/**
 * Footer fixo do Book: ← Anterior | Próxima etapa →
 * Ao avançar, registra a visita do módulo atual e dispara um toast de
 * recompensa com os pontos ganhos.
 */
export default function BookFooter() {
  const { stage, goTo, markModuloVisitado, modulos_visitados } = useJourney();

  const current = getBookPage(stage);
  const nextStage = getNextStage(stage);
  const prevStage = getPrevStage(stage);

  if (!nextStage && !prevStage) return null; // capa não tem prev, última não tem next; mas raríssimo

  const handleNext = () => {
    // marca o módulo atual como visitado (exceto a capa)
    if (current.stage !== "hub") {
      const wasVisited = modulos_visitados.includes(current.stage);
      markModuloVisitado(current.stage);
      if (!wasVisited && current.rewardPts) {
        toast.success(
          `Etapa ${current.number} concluída · +${current.rewardPts} pontos`,
          {
            description: current.unlocksBroker
              ? "🔓 Corretor liberado — agora você pode falar quando quiser."
              : `Próxima: ${getBookPage(nextStage).label}`,
            duration: 3200,
          }
        );
      }
    }
    goTo(nextStage);
  };

  const handlePrev = () => {
    if (prevStage) goTo(prevStage);
  };

  const nextPage = nextStage ? getBookPage(nextStage) : null;

  return (
    <nav
      data-testid="book-footer"
      className="sticky bottom-0 z-30 border-t border-[color:var(--torres-line)] bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
        {/* Anterior — discreto */}
        <button
          onClick={handlePrev}
          disabled={!prevStage}
          data-testid="book-prev-btn"
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all sm:px-4 sm:text-xs ${
            prevStage
              ? "border border-[color:var(--torres-line)] bg-white hover:border-[color:var(--torres-indigo)]"
              : "cursor-not-allowed opacity-30"
          }`}
          style={{ color: "var(--torres-ink)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Indicador de página (centro) */}
        <div className="hidden text-[11px] uppercase tracking-[0.22em] sm:block" style={{ color: "var(--torres-muted)" }}>
          Página {current.number} de {BOOK_PAGES.length}
        </div>

        {/* Próximo — ATAQUE PRINCIPAL */}
        {nextStage ? (
          <button
            onClick={handleNext}
            data-testid="book-next-btn"
            className="btn-primary-torres group relative inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm"
          >
            <span>{current.nextLabel || `Ir para ${nextPage?.label}`}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700"
            data-testid="book-end-marker"
          >
            ✓ Você chegou ao fim do book
          </span>
        )}
      </div>
    </nav>
  );
}
