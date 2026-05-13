import React from "react";
import { useJourney } from "../context/JourneyContext";
import { ALAMEDA_IMAGES } from "../lib/assets";
import { BOOK_PAGES, isBrokerUnlocked } from "../lib/bookPages";
import { ArrowRight, Lock, Check, MapPin, RotateCcw } from "lucide-react";
import WarehouseCaptureCard from "./WarehouseCaptureCard";

/**
 * "Capa" do Book Alameda 500 — substitui o antigo Hub-grid.
 * O usuário não escolhe módulo aqui; ele simplesmente abre o livro e
 * cada página o leva à próxima na ordem certa.
 */
export default function Hub() {
  const { goTo, modulos_visitados, leadScore, name, reset } = useJourney();
  const brokerOk = isBrokerUnlocked(modulos_visitados);
  const firstName = (name || "").split(" ")[0];

  const handleReset = () => {
    if (
      window.confirm(
        "Tem certeza que quer reiniciar sua jornada? Todas as suas escolhas e simulações serão apagadas."
      )
    ) {
      reset();
    }
  };

  // Lista de páginas do book (skipping a própria capa pra mostrar como sumário)
  const summary = BOOK_PAGES.filter((p) => p.stage !== "hub");
  const totalContentPages = summary.length;
  const visitedCount = summary.filter(
    (p) => p.stage === "corretor" ? brokerOk : modulos_visitados.includes(p.stage)
  ).length;

  return (
    <section data-testid="hub-screen" className="relative">
      {/* HERO — capa imersiva */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={ALAMEDA_IMAGES.fachadaPrincipalNoturna}
            alt=""
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,18,32,0.55) 0%, rgba(15,18,32,0.78) 65%, rgba(246,244,238,1) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1320px] px-6 py-16 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
          <div className="max-w-[640px]">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/80">
              Torres Engenharia · Serra/ES
            </div>
            <h1 className="serif mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-[58px]">
              {firstName ? `${firstName}, sua próxima casa começa aqui.` : "Sua próxima casa começa aqui."}
            </h1>
            <p className="mt-5 max-w-[520px] text-base leading-relaxed text-white/85 sm:text-lg">
              Um livro digital interativo sobre o Residencial{" "}
              <span className="serif font-semibold">Alameda 500</span> — 12
              casas duplex, à 8 minutos de Vitória. Vire as páginas no seu
              ritmo. Em poucos minutos você descobre se faz sentido pra você.
            </p>

            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => goTo("empreendimento")}
                data-testid="hub-start-btn"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-15px_rgba(255,255,255,0.5)]"
                style={{ color: "var(--torres-ink)" }}
              >
                Começar minha experiência
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                ⏱ leva ~ 6 minutos
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/65">
              <MapPin className="h-3 w-3" />
              Rua São Paulo, 500 · Alterosas · Serra/ES
            </div>
          </div>
        </div>
      </div>

      {/* SUMÁRIO DO BOOK */}
      <div className="mx-auto max-w-[1320px] px-6 pb-16 pt-10 sm:px-10 sm:pt-14 lg:px-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
              Sumário
            </div>
            <h2 className="serif mt-1 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--torres-ink)" }}>
              {totalContentPages} capítulos para você descobrir
            </h2>
          </div>
          <div className="text-right" data-testid="hub-progress-summary">
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Concluídos
            </div>
            <div className="serif text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              {visitedCount}/{totalContentPages}
            </div>
          </div>
        </div>

        <ol className="space-y-3" data-testid="hub-book-summary">
          {summary.map((p) => {
            const visited =
              p.stage === "corretor" ? brokerOk : modulos_visitados.includes(p.stage);
            const isLocked = p.stage === "corretor" && !brokerOk;
            const Icon = p.icon;
            return (
              <li key={p.stage}>
                <button
                  onClick={() => {
                    if (!isLocked) goTo(p.stage);
                  }}
                  disabled={isLocked}
                  data-testid={`hub-toc-${p.stage}`}
                  className={`group relative flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-all sm:p-5 ${
                    isLocked
                      ? "cursor-not-allowed border-[color:var(--torres-line)] opacity-60"
                      : "border-[color:var(--torres-line)] hover:-translate-y-0.5 hover:border-[color:var(--torres-indigo)] hover:shadow-[0_12px_30px_-15px_rgba(100,113,162,0.35)]"
                  }`}
                >
                  {/* Número grande tipo capítulo */}
                  <div
                    className={`serif flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold sm:h-14 sm:w-14 sm:text-2xl ${
                      visited
                        ? "bg-[color:var(--torres-indigo)] text-white"
                        : "bg-[color:var(--torres-cream)] text-[color:var(--torres-indigo)]"
                    }`}
                  >
                    {visited ? <Check className="h-5 w-5" /> : `0${p.number - 1}`}
                  </div>
                  {/* Texto */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5" style={{ color: "var(--torres-muted)" }} />
                      <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                        Capítulo {p.number - 1}
                      </span>
                    </div>
                    <div className="serif mt-0.5 text-base font-semibold sm:text-lg" style={{ color: "var(--torres-ink)" }}>
                      {p.label}
                    </div>
                    <div className="text-xs sm:text-sm" style={{ color: "var(--torres-muted)" }}>
                      {p.title}
                    </div>
                  </div>
                  {/* Indicador */}
                  <div className="hidden sm:block">
                    {isLocked ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--torres-line)] px-3 py-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                        <Lock className="h-3 w-3" />
                        Após o capítulo 2
                      </div>
                    ) : visited ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] uppercase tracking-wider text-emerald-700">
                        <Check className="h-3 w-3" />
                        Concluído
                      </div>
                    ) : (
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--torres-indigo)" }} />
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Score discreto */}
        <div
          className="mt-8 flex flex-col items-start gap-1 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
          data-testid="hub-score-hint"
        >
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Engajamento
            </span>{" "}
            <span className="serif font-semibold" style={{ color: "var(--torres-ink)" }}>
              {leadScore}/150
            </span>
          </div>
          <span className="text-xs" style={{ color: "var(--torres-muted)" }}>
            Quanto mais páginas você descobre, melhor preparamos seu atendimento.
          </span>
        </div>

        {/* Lead Warehouse — captura sazonal/futura */}
        <div className="mt-8" data-testid="hub-warehouse-section">
          {/* Linha-âncora visualmente destacada para chamar atenção:
              "Esse não é o seu lar? A Torres tem mais." */}
          <div
            className="mb-3 flex items-center gap-3"
            aria-hidden
          >
            <div className="h-px flex-1 bg-[color:var(--torres-line)]" />
            <span
              className="text-[11px] uppercase tracking-[0.22em]"
              style={{ color: "var(--torres-indigo)" }}
            >
              ✦ Exclusivo para quem busca mais
            </span>
            <div className="h-px flex-1 bg-[color:var(--torres-line)]" />
          </div>
          <WarehouseCaptureCard
            source="capa"
            requireContact
            defaultOpen
            title="O Alameda 500 não é seu perfil? A Torres tem mais a caminho."
            subtitle="Cadastre-se para receber em primeira mão e com exclusividade lançamentos compatíveis com você — antes de chegarem ao mercado. Pode ser casa, apartamento ou em outra região."
          />
        </div>

        {/* Atalho discreto pro painel restrito + reset */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href="/painel.html"
            data-testid="hub-painel-link"
            className="text-[11px] uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline"
            style={{ color: "var(--torres-muted)" }}
          >
            Área restrita · Torres Engenharia
          </a>
          <button
            type="button"
            onClick={handleReset}
            data-testid="hub-reset-btn"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] underline-offset-4 transition-colors hover:underline"
            style={{ color: "var(--torres-muted)" }}
          >
            <RotateCcw className="h-3 w-3" />
            Reiniciar minha jornada
          </button>
        </div>
      </div>
    </section>
  );
}
