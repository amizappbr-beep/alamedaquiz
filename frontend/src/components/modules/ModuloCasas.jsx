import React, { useEffect, useState } from "react";
import { useJourney } from "../../context/JourneyContext";
import { CASA_MODELOS, sugerirCasa } from "../../lib/conteudo";
import { PRECO_MODELO, UNIDADES, formatBRL } from "../../lib/tabelaVendas";
import { Check, Sparkles, Ruler, Square, Bed, X } from "lucide-react";

export default function ModuloCasas() {
  const { goTo, setCasaPreferida, casa_preferida, quiz_answers } =
    useJourney();
  const sugestao = sugerirCasa(quiz_answers);
  const [plantaOpen, setPlantaOpen] = useState(null);

  return (
    <section
      data-testid="modulo-casas"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="fade-up">
          <div
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--torres-indigo)" }}
          >
            Módulo 2 • Plantas
          </div>
          <h1
            className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl"
            style={{ color: "var(--torres-ink)" }}
          >
            Qual casa combina com você?
          </h1>
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--torres-muted)" }}>
            São 3 modelos de planta, 12 unidades no total. Toque na que
            te interessa pra marcar como preferida.
          </p>
          {sugestao && (
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-indigo)]/30 bg-[color:var(--torres-indigo)]/5 px-4 py-2 text-sm font-semibold"
              style={{ color: "var(--torres-indigo-deep)" }}
              data-testid="casa-sugestao"
            >
              <Sparkles className="h-4 w-4" />
              Sugestão pelo seu perfil: Casa {sugestao.nome} ({sugestao.numeros})
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3" data-testid="casas-grid">
          {CASA_MODELOS.map((m, idx) => {
            const selected = casa_preferida === m.id;
            const isSugestao = sugestao?.id === m.id;
            const preco = PRECO_MODELO[m.id];
            const disponiveis = UNIDADES.filter(
              (u) => u.modelo === m.id && u.status === "disponivel"
            ).length;
            return (
              <button
                key={m.id}
                onClick={() => setCasaPreferida(m.id)}
                data-testid={`casa-card-${m.id}`}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white text-left transition-all duration-300 fade-up ${
                  selected
                    ? "border-[color:var(--torres-indigo)] shadow-[0_25px_60px_-25px_rgba(100,113,162,0.55)]"
                    : "border-[color:var(--torres-line)] hover:-translate-y-1 hover:border-[color:var(--torres-indigo)]/60"
                }`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={m.imagem}
                    alt={m.nome}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(27,31,46,0.8) 100%)",
                    }}
                  />
                  <div className="absolute bottom-4 left-5 right-5 text-white">
                    <div className="text-[10px] uppercase tracking-[0.22em] opacity-85">
                      {m.numeros}
                    </div>
                    <div className="serif text-2xl font-semibold">Casa {m.nome}</div>
                  </div>
                  {isSugestao && (
                    <div
                      className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ backgroundColor: "var(--torres-indigo)" }}
                    >
                      <Sparkles className="h-3 w-3" />
                      Ideal pra você
                    </div>
                  )}
                </div>

                {/* Price bar */}
                <div
                  className="flex items-baseline justify-between gap-3 border-b border-[color:var(--torres-line)] bg-[color:var(--torres-indigo)]/5 px-5 py-3"
                  data-testid={`casa-preco-${m.id}`}
                >
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                      A partir de
                    </div>
                    <div className="serif text-2xl font-bold tabular-nums" style={{ color: "var(--torres-indigo)" }}>
                      {formatBRL(preco)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        disponiveis > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${disponiveis > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                      {disponiveis > 0 ? `${disponiveis} disponível${disponiveis > 1 ? "is" : ""}` : "Indisponível"}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="serif text-base font-semibold" style={{ color: "var(--torres-ink)" }}>
                    {m.tagline}
                  </div>
                  <p className="mt-2 text-sm" style={{ color: "var(--torres-muted)" }}>
                    {m.descricao}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-y border-[color:var(--torres-line)] py-4">
                    <Metric icon={<Square className="h-3.5 w-3.5" />} label="Privativa" value={`${m.areaPrivativa} m²`} />
                    <Metric icon={<Ruler className="h-3.5 w-3.5" />} label="Construída" value={`${m.areaConstruida} m²`} />
                    <Metric icon={<Bed className="h-3.5 w-3.5" />} label="Quartos" value={`${m.quartos}Q ${m.lavabo ? "+ L" : ""}`} />
                  </div>

                  <ul className="mt-4 space-y-1.5 text-xs" style={{ color: "var(--torres-ink)" }}>
                    {m.destaques.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "var(--torres-indigo)" }} />
                        {d}
                      </li>
                    ))}
                  </ul>

                  {/* Plantas humanizadas */}
                  {m.plantas && m.plantas.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[color:var(--torres-line)]">
                      <div className="text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: "var(--torres-muted)" }}>
                        Planta humanizada
                      </div>
                      <div className="flex gap-2">
                        {m.plantas.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPlantaOpen({ casa: m.nome, ...p });
                            }}
                            data-testid={`casa-planta-${m.id}-${pIdx}`}
                            className="flex-1 cursor-pointer overflow-hidden rounded-lg border border-[color:var(--torres-line)] bg-white transition-all hover:border-[color:var(--torres-indigo)] hover:shadow-md"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--torres-cream)]">
                              <img
                                src={p.src}
                                alt={`Planta ${m.nome} ${p.label}`}
                                loading="lazy"
                                className="h-full w-full object-contain transition-transform duration-500 hover:scale-105"
                              />
                            </div>
                            <div className="px-2 py-1.5 text-center text-[10px] font-semibold" style={{ color: "var(--torres-ink)" }}>
                              {p.label}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-1.5 text-center text-[10px]" style={{ color: "var(--torres-muted)" }}>
                        Toque para ampliar
                      </div>
                    </div>
                  )}

                  <div
                    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition-all ${
                      selected
                        ? "bg-[color:var(--torres-indigo)] text-white"
                        : "border border-[color:var(--torres-line)] text-[color:var(--torres-ink)] group-hover:border-[color:var(--torres-indigo)] group-hover:text-[color:var(--torres-indigo)]"
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Marcada como preferida
                      </>
                    ) : (
                      <>Escolher esta casa</>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Planta lightbox */}
      {plantaOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPlantaOpen(null)}
          data-testid="planta-lightbox"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlantaOpen(null);
            }}
            data-testid="planta-lightbox-close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="max-h-[90vh] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={plantaOpen.src}
              alt={`Planta ${plantaOpen.casa} ${plantaOpen.label}`}
              className="max-h-[85vh] w-full rounded-xl bg-white object-contain p-2"
            />
            <div className="mt-3 text-center text-white">
              <div className="serif text-lg font-semibold">
                Casa {plantaOpen.casa} — {plantaOpen.label}
              </div>
              <div className="text-sm opacity-70">Planta humanizada</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
        {icon}
        {label}
      </div>
      <div className="mt-0.5 serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
        {value}
      </div>
    </div>
  );
}
