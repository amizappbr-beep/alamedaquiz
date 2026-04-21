import React from "react";
import { useJourney } from "../context/JourneyContext";
import { Flame, ThermometerSun, Snowflake, Home, ArrowLeft } from "lucide-react";

const TEMP_ICON = { quente: Flame, morno: ThermometerSun, frio: Snowflake };
const TEMP_COLOR = {
  quente: "#c24a1e",
  morno: "#8a6a2b",
  frio: "#6471A2",
};

export default function Header() {
  const { stage, goTo, modulos_visitados, leadScore, temperatura } = useJourney();
  const TempIcon = TEMP_ICON[temperatura] || Snowflake;

  const canGoBackToHub = stage !== "hub" && stage !== "obrigado";

  return (
    <header
      data-testid="journey-header"
      className="sticky top-0 z-40 border-b border-[color:var(--torres-line)] bg-[color:var(--torres-cream)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: brand / back */}
        <div className="flex items-center gap-3">
          {canGoBackToHub ? (
            <button
              onClick={() => goTo("hub")}
              data-testid="header-back-hub"
              className="flex h-9 items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-3 text-xs font-semibold transition-colors hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar ao hub
            </button>
          ) : (
            <button
              onClick={() => goTo("hub")}
              className="flex items-center gap-2"
              data-testid="header-brand"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--torres-indigo)]/30"
                style={{ backgroundColor: "rgba(100,113,162,0.06)" }}
              >
                <Home className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
              </div>
              <div className="leading-tight text-left">
                <div
                  className="text-[9px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  Torres Engenharia
                </div>
                <div
                  className="serif text-sm font-semibold"
                  style={{ color: "var(--torres-indigo-deep)" }}
                >
                  Alameda 500
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Right: score + progress */}
        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold sm:flex"
            data-testid="header-modulos"
          >
            <span style={{ color: "var(--torres-muted)" }}>Módulos</span>
            <span style={{ color: "var(--torres-indigo)" }}>
              {modulos_visitados.length}/6
            </span>
          </div>
          <div
            data-testid="header-score"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold"
            style={{
              backgroundColor: "rgba(100,113,162,0.08)",
              color: TEMP_COLOR[temperatura],
            }}
          >
            <TempIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Score</span>
            <span className="tabular-nums">{leadScore}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
