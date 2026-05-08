import React, { useEffect } from "react";
import { useJourney } from "../../context/JourneyContext";
import {
  BOOK_PAGES,
  getBookPage,
  isBrokerUnlocked,
} from "../../lib/bookPages";
import { Home as HomeIcon, MessageCircle, Lock } from "lucide-react";

/**
 * Header fixo do Book: trilha de progresso + botão "voltar à capa" + botão
 * "Falar com corretor" (desabilitado até a 3ª página).
 */
export default function BookHeader() {
  const { stage, modulos_visitados, goTo } = useJourney();
  const currentPage = getBookPage(stage);
  const brokerOk = isBrokerUnlocked(modulos_visitados);

  // Tooltip controlado para o botão de corretor desabilitado
  const [showLockTip, setShowLockTip] = React.useState(false);
  const tipTimerRef = React.useRef(null);
  useEffect(() => () => clearTimeout(tipTimerRef.current), []);

  const handleBrokerClick = () => {
    if (brokerOk) {
      goTo("corretor");
      return;
    }
    setShowLockTip(true);
    clearTimeout(tipTimerRef.current);
    tipTimerRef.current = setTimeout(() => setShowLockTip(false), 3500);
  };

  return (
    <header
      data-testid="book-header"
      className="sticky top-0 z-30 border-b border-[color:var(--torres-line)] bg-white/85 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
        {/* Esquerda: voltar à capa */}
        <button
          onClick={() => goTo("hub")}
          data-testid="book-home-btn"
          className="group inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all hover:border-[color:var(--torres-indigo)] hover:bg-[color:var(--torres-indigo)]/5"
          style={{ color: "var(--torres-ink)" }}
          aria-label="Voltar à capa"
        >
          <HomeIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Capa</span>
        </button>

        {/* Centro: trilha de progresso */}
        <div className="hidden flex-1 items-center justify-center gap-1 sm:flex" data-testid="book-progress">
          {BOOK_PAGES.map((p) => {
            const isCurrent = p.stage === stage;
            const isVisited =
              p.stage === "hub" ||
              modulos_visitados.includes(p.stage) ||
              p.stage === stage;
            return (
              <button
                key={p.stage}
                onClick={() => goTo(p.stage)}
                data-testid={`book-progress-dot-${p.number}`}
                className="group relative flex h-7 items-center justify-center"
                aria-label={`Página ${p.number}: ${p.label}`}
              >
                <span
                  className={`block rounded-full transition-all ${
                    isCurrent
                      ? "h-2 w-7 bg-[color:var(--torres-indigo)]"
                      : isVisited
                      ? "h-1.5 w-3 bg-[color:var(--torres-indigo)]/55"
                      : "h-1.5 w-3 bg-[color:var(--torres-line)]"
                  }`}
                />
                {/* tooltip on hover */}
                <span className="pointer-events-none absolute top-full mt-1 whitespace-nowrap rounded-md bg-[color:var(--torres-ink)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {p.number}/{BOOK_PAGES.length} · {p.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile: contador "X/Y" */}
        <div className="flex flex-1 justify-center text-[11px] font-semibold uppercase tracking-[0.22em] sm:hidden" style={{ color: "var(--torres-muted)" }}>
          {currentPage.number}/{BOOK_PAGES.length} · {currentPage.label}
        </div>

        {/* Direita: botão Falar com corretor */}
        <div className="relative">
          <button
            onClick={handleBrokerClick}
            data-testid="book-broker-btn"
            data-broker-unlocked={brokerOk ? "true" : "false"}
            className={`group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all sm:px-4 sm:py-2 sm:text-xs ${
              brokerOk
                ? "bg-emerald-600 text-white shadow-[0_6px_18px_-6px_rgba(16,185,129,0.55)] hover:bg-emerald-700"
                : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
            }`}
            aria-label={brokerOk ? "Falar com o corretor" : "Corretor desbloqueado após a etapa 3"}
          >
            {brokerOk ? (
              <MessageCircle className="h-3.5 w-3.5" />
            ) : (
              <Lock className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {brokerOk ? "Falar com corretor" : "Corretor"}
            </span>
            <span className="sm:hidden">Corretor</span>
          </button>
          {showLockTip && !brokerOk && (
            <div
              data-testid="book-broker-lock-tooltip"
              className="absolute right-0 top-full z-40 mt-2 w-[260px] rounded-xl border border-[color:var(--torres-line)] bg-[color:var(--torres-ink)] p-3 text-left text-xs leading-relaxed text-white shadow-[0_16px_40px_-16px_rgba(31,34,51,0.5)]"
            >
              <div className="mb-1 font-semibold">🔒 Quase lá!</div>
              Conheça o empreendimento e escolha sua casa ideal — então o corretor fica disponível pra conversar com você.
            </div>
          )}
        </div>
      </div>

      {/* Mobile progress bar (slim) */}
      <div className="block h-[2px] w-full bg-[color:var(--torres-line)] sm:hidden" data-testid="book-progress-bar-mobile">
        <div
          className="h-full bg-[color:var(--torres-indigo)] transition-all duration-500"
          style={{
            width: `${(currentPage.number / BOOK_PAGES.length) * 100}%`,
          }}
        />
      </div>
    </header>
  );
}
