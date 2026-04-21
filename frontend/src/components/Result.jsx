import React from "react";
import { GALLERY_ITEMS } from "../lib/assets";
import { RESULT_COPY, buildWhatsappUrl } from "../lib/quizData";
import { ArrowRight, CheckCircle2, Flame, Snowflake, ThermometerSun, RotateCcw, MapPin } from "lucide-react";

const ICON_BY_CLASS = {
  quente: Flame,
  morno: ThermometerSun,
  frio: Snowflake,
};

export default function Result({ classification, name, onRestart }) {
  const copy = RESULT_COPY[classification];
  const Icon = ICON_BY_CLASS[classification];
  const wa = buildWhatsappUrl({ name, classification });

  return (
    <section
      data-testid="result-screen"
      className="relative min-h-screen w-full bg-[color:var(--torres-cream)] px-6 py-12 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Hero card */}
        <div className="fade-up grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                borderColor: "rgba(100,113,162,0.25)",
                backgroundColor: "rgba(100,113,162,0.06)",
                color: "var(--torres-indigo)",
              }}
              data-testid="result-eyebrow"
            >
              <Icon className="h-3.5 w-3.5" />
              {copy.eyebrow}
            </div>

            <h1
              data-testid="result-title"
              className="serif mt-5 text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-[60px]"
              style={{ color: "var(--torres-ink)" }}
            >
              {name ? `${name.split(" ")[0]}, ` : ""}
              {copy.title}
            </h1>

            <p
              data-testid="result-description"
              className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--torres-muted)" }}
            >
              {copy.description}
            </p>

            {/* Scarcity callout */}
            <div
              className="mt-8 rounded-2xl border p-5 sm:p-6"
              style={{
                borderColor: "rgba(180,83,9,0.2)",
                backgroundColor: "#FFF7EA",
              }}
              data-testid="scarcity-callout"
            >
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#F59E0B", color: "#fff" }}
                >
                  !
                </div>
                <div>
                  <div
                    className="serif text-base font-semibold sm:text-lg"
                    style={{ color: "#8a4a0a" }}
                  >
                    Atenção: apenas 12 unidades disponíveis.
                  </div>
                  <div
                    className="mt-1 text-sm"
                    style={{ color: "#a86a2b" }}
                  >
                    O Residencial Alameda 500 está em fase de alta procura.
                    Garantir prioridade no atendimento é o próximo passo.
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="whatsapp-cta"
                className="btn-primary-torres group inline-flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                  <path d="M20.52 3.48A11.93 11.93 0 0012.02 0C5.4 0 .02 5.38.02 12a11.9 11.9 0 001.6 5.98L0 24l6.2-1.62A11.95 11.95 0 0012.02 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.5-8.52zM12.02 21.8a9.78 9.78 0 01-4.98-1.36l-.36-.21-3.68.96.98-3.58-.23-.37A9.78 9.78 0 012.22 12c0-5.4 4.4-9.8 9.8-9.8 2.62 0 5.08 1.02 6.93 2.87a9.73 9.73 0 012.87 6.93c0 5.4-4.4 9.8-9.8 9.8zm5.63-7.33c-.31-.15-1.83-.9-2.12-1-.28-.11-.49-.15-.7.15s-.8 1-.98 1.2c-.18.2-.36.23-.67.08-.31-.16-1.3-.48-2.48-1.53a9.3 9.3 0 01-1.72-2.13c-.18-.31-.02-.48.14-.64.14-.14.31-.36.46-.54.15-.18.2-.31.31-.52.1-.2.05-.39-.03-.54-.08-.15-.7-1.7-.96-2.32-.25-.6-.51-.52-.7-.53l-.6-.01c-.2 0-.52.08-.8.39s-1.05 1.03-1.05 2.5c0 1.47 1.08 2.89 1.23 3.09.15.2 2.12 3.24 5.14 4.54.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.83-.75 2.09-1.47.26-.72.26-1.33.18-1.46-.08-.13-.28-.2-.59-.36z" />
                </svg>
                {copy.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
              <button
                onClick={onRestart}
                data-testid="restart-btn"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-6 py-3 text-sm font-semibold transition-all hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Refazer o quiz
              </button>
            </div>
          </div>

          {/* Summary card */}
          <aside className="fade-up fade-up-delay-2">
            <div className="sticky top-8 overflow-hidden rounded-3xl border border-[color:var(--torres-line)] bg-white shadow-[0_30px_80px_-30px_rgba(100,113,162,0.3)]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={GALLERY_ITEMS[4].src}
                  alt="Residencial Alameda 500"
                  className="h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(31,34,46,0.78) 100%)",
                  }}
                />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <div className="text-[10px] uppercase tracking-[0.24em] opacity-80">
                    Torres Engenharia
                  </div>
                  <div className="serif text-xl font-semibold">
                    Residencial Alameda 500
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                    <MapPin className="h-3 w-3" />
                    Alterosas, Serra — ES
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                <div
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  O que você leva
                </div>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {[
                    "Casas Duplex de 63 a 79 m²",
                    "2 Quartos + Área Gourmet com churrasqueira",
                    "Quintal privativo e varanda",
                    "Vaga de estacionamento exclusiva",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2"
                      style={{ color: "var(--torres-ink)" }}
                    >
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: "var(--torres-indigo)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* Gallery */}
        <div className="mt-20 fade-up fade-up-delay-3">
          <div className="flex items-end justify-between">
            <div>
              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--torres-indigo)" }}
              >
                Conheça o empreendimento
              </div>
              <h2
                className="serif mt-2 text-3xl font-semibold sm:text-4xl"
                style={{ color: "var(--torres-ink)" }}
              >
                Imagens reais do projeto
              </h2>
            </div>
          </div>

          <div
            className="gallery-scroll mt-8 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
            data-testid="gallery"
          >
            {GALLERY_ITEMS.map((item, idx) => (
              <figure
                key={idx}
                className="snap-start shrink-0 overflow-hidden rounded-2xl border border-[color:var(--torres-line)] bg-white"
                style={{ width: "min(78vw, 420px)" }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <figcaption className="px-5 py-4">
                  <div
                    className="serif text-base font-semibold"
                    style={{ color: "var(--torres-ink)" }}
                  >
                    {item.title}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--torres-muted)" }}
                  >
                    {item.subtitle}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-20 border-t pt-8 text-center text-xs"
          style={{
            borderColor: "var(--torres-line)",
            color: "var(--torres-muted)",
          }}
        >
          © {new Date().getFullYear()} Torres Engenharia • Residencial Alameda 500 • Alterosas, Serra — ES
        </div>
      </div>
    </section>
  );
}
