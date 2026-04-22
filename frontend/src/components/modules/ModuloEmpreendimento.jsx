import React, { useEffect, useState, useCallback } from "react";
import { useJourney } from "../../context/JourneyContext";
import { GALLERY_ITEMS } from "../../lib/assets";
import { X, ArrowRight, ChevronLeft, ChevronRight, Check as CheckIcon } from "lucide-react";

export default function ModuloEmpreendimento() {
  const { markModuloVisitado, goTo, addInteracao, imagens_vistas, markImagemVista } = useJourney();
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    markModuloVisitado("empreendimento");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openImage = (item, idx) => {
    addInteracao("imagem_aberta", { titulo: item.title, index: idx });
    markImagemVista(idx);
    setLightboxIdx(idx);
  };

  const prev = useCallback(() => {
    setLightboxIdx((i) => {
      if (i === null) return null;
      const next = (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
      markImagemVista(next);
      return next;
    });
  }, [markImagemVista]);
  const next = useCallback(() => {
    setLightboxIdx((i) => {
      if (i === null) return null;
      const nxt = (i + 1) % GALLERY_ITEMS.length;
      markImagemVista(nxt);
      return nxt;
    });
  }, [markImagemVista]);

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") setLightboxIdx(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, prev, next]);

  const current = lightboxIdx !== null ? GALLERY_ITEMS[lightboxIdx] : null;

  return (
    <section
      data-testid="modulo-empreendimento"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="fade-up">
          <div
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--torres-indigo)" }}
          >
            Módulo 1 • Empreendimento
          </div>
          <h1
            className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl"
            style={{ color: "var(--torres-ink)" }}
          >
            Conheça cada espaço do Alameda 500.
          </h1>
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--torres-muted)" }}>
            Clique nas imagens para ampliar. Cada ambiente foi pensado pra
            oferecer conforto, praticidade e estilo.
          </p>
        </div>

        {/* Grid mosaico */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="galeria-grid">
          {GALLERY_ITEMS.map((item, idx) => {
            const visto = imagens_vistas.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => openImage(item, idx)}
                data-testid={`galeria-item-${idx}`}
                className={`group relative block overflow-hidden rounded-2xl border bg-white fade-up ${
                  visto ? "border-emerald-300" : "border-[color:var(--torres-line)]"
                }`}
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(27,31,46,0.7) 100%)",
                    }}
                  />
                  {visto && (
                    <div
                      data-testid={`galeria-item-${idx}-visto`}
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg"
                    >
                      <CheckIcon className="h-4 w-4" strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div className="p-4 text-left">
                  <div className="serif text-base font-semibold" style={{ color: "var(--torres-ink)" }}>
                    {item.title}
                  </div>
                  <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                    {item.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div
          className="mt-6 flex items-center gap-3 text-xs"
          style={{ color: "var(--torres-muted)" }}
          data-testid="galeria-progresso"
        >
          <div className="progress-track flex-1">
            <div
              className="progress-fill"
              style={{
                width: `${Math.round((imagens_vistas.length / GALLERY_ITEMS.length) * 100)}%`,
              }}
            />
          </div>
          <span className="shrink-0 font-semibold" style={{ color: imagens_vistas.length === GALLERY_ITEMS.length ? "#047857" : "var(--torres-indigo)" }}>
            {imagens_vistas.length}/{GALLERY_ITEMS.length} ambientes vistos
          </span>
        </div>

        {/* CTA próximo passo */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl border border-[color:var(--torres-line)] bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="serif text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Que tal descobrir qual das 3 plantas combina com você?
            </div>
            <div className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
              Te mostramos o modelo ideal em 30 segundos.
            </div>
          </div>
          <button
            onClick={() => goTo("casas")}
            data-testid="empreendimento-next-btn"
            className="btn-primary-torres group inline-flex items-center gap-2"
          >
            Escolher minha casa
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Lightbox with navigation */}
      {current && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 fade-up"
          onClick={() => setLightboxIdx(null)}
          data-testid="lightbox"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIdx(null);
            }}
            data-testid="lightbox-close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev/Next */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            data-testid="lightbox-prev"
            className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:scale-110 hover:bg-white/25 sm:left-6"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            data-testid="lightbox-next"
            className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-all hover:scale-110 hover:bg-white/25 sm:right-6"
            aria-label="Próxima"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative max-h-[90vh] max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={current.src}
              alt={current.title}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
            <div className="mt-3 text-center text-white">
              <div className="serif text-lg font-semibold">{current.title}</div>
              <div className="text-sm opacity-80">{current.subtitle}</div>
              <div className="mt-2 text-xs opacity-60">
                {lightboxIdx + 1} de {GALLERY_ITEMS.length} • use ← → ou toque nas setas
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
