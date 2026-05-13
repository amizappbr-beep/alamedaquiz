import React from "react";
import { useJourney } from "../../context/JourneyContext";
import {
  BOOK_PAGES,
  getBookPage,
  getNextStage,
  getPrevStage,
} from "../../lib/bookPages";
import { ArrowLeft, ArrowRight, Hand } from "lucide-react";
import { toast } from "sonner";

/**
 * Footer fixo do Book: ← Anterior | Próxima etapa →
 * Ao avançar, registra a visita do módulo atual e dispara um toast de
 * recompensa com os pontos ganhos.
 *
 * O botão "Próximo" recebe atenção visual (pulso + seta animada) nas
 * primeiras páginas para acostumar o usuário com o formato livro digital
 * — um padrão ainda incomum no mercado imobiliário.
 */
export default function BookFooter() {
  const { stage, goTo, markModuloVisitado, modulos_visitados } = useJourney();

  const current = getBookPage(stage);
  const nextStage = getNextStage(stage);
  const prevStage = getPrevStage(stage);

  if (!nextStage && !prevStage) return null; // capa não tem prev, última não tem next; mas raríssimo

  const nextPage = nextStage ? getBookPage(nextStage) : null;
  // A próxima página desbloqueia o corretor? (i.e., a página atual é a
  // anterior ao gatilho de unlocksBroker — atualmente "empreendimento").
  const nextUnlocksBroker = !!nextPage?.unlocksBroker;
  // Mostrar pulso + dica visual nas 2 primeiras páginas para acostumar
  // o usuário ao formato "livro digital".
  const isEarlyPage = current.number <= 2;

  const handleNext = () => {
    // marca o módulo atual como visitado (exceto a capa)
    if (current.stage !== "hub") {
      const wasVisited = modulos_visitados.includes(current.stage);
      markModuloVisitado(current.stage);
      if (!wasVisited && current.rewardPts) {
        let description;
        if (current.unlocksBroker) {
          description = "🔓 Corretor liberado — agora você pode falar quando quiser.";
        } else if (nextUnlocksBroker) {
          // Antes de virar a página que libera o corretor
          description = `🔓 Você poderá acionar seu corretor assim que virar a próxima página · Próxima: ${nextPage.label}`;
        } else {
          description = `Próxima: ${nextPage.label}`;
        }
        toast.success(
          `Etapa ${current.number} concluída · +${current.rewardPts} pontos`,
          {
            description,
            duration: nextUnlocksBroker ? 4200 : 3200,
          }
        );
      }
    }
    goTo(nextStage);
  };

  const handlePrev = () => {
    if (prevStage) goTo(prevStage);
  };

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
          <div className="relative flex flex-col items-end gap-1 sm:items-stretch">
            {/* Dica "vire a página" — só nas 2 primeiras páginas */}
            {isEarlyPage && (
              <div
                data-testid="book-next-hint"
                className="book-next-hint pointer-events-none flex items-center justify-end gap-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ color: "var(--torres-indigo)" }}
              >
                <Hand className="h-3 w-3" />
                Vire a página
              </div>
            )}
            <button
              onClick={handleNext}
              data-testid="book-next-btn"
              className={`btn-primary-torres group relative inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm ${
                isEarlyPage ? "book-next-attention" : ""
              }`}
            >
              <span>{current.nextLabel || `Ir para ${nextPage?.label}`}</span>
              <ArrowRight className="book-next-arrow h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
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
