import React from "react";
import { ALAMEDA_IMAGES } from "../lib/assets";
import { ArrowRight, MapPin, Home, Clock } from "lucide-react";

export default function Intro({ onStart }) {
  return (
    <section
      data-testid="intro-screen"
      className="relative min-h-screen w-full overflow-hidden bg-[color:var(--torres-cream)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-0 lg:grid-cols-[1.05fr_1fr] lg:min-h-screen">
        {/* LEFT — editorial copy */}
        <div className="relative flex flex-col justify-between px-6 py-10 sm:px-10 lg:px-16 lg:py-14 noise-overlay">
          {/* Top brand row */}
          <div className="flex items-center justify-between fade-up">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--torres-indigo)]/30"
                style={{ backgroundColor: "rgba(100,113,162,0.06)" }}
              >
                <span
                  className="serif text-lg font-semibold"
                  style={{ color: "var(--torres-indigo)" }}
                >
                  A
                </span>
              </div>
              <div className="leading-tight">
                <div
                  className="text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  Torres Engenharia
                </div>
                <div
                  className="serif text-base font-semibold"
                  style={{ color: "var(--torres-indigo-deep)" }}
                >
                  Residencial Alameda 500
                </div>
              </div>
            </div>
            <div
              className="hidden items-center gap-2 text-xs font-medium sm:flex"
              style={{ color: "var(--torres-muted)" }}
            >
              <MapPin className="h-3.5 w-3.5" />
              Alterosas, Serra — ES
            </div>
          </div>

          {/* Main copy */}
          <div className="mt-16 lg:mt-0">
            <div
              className="scarcity-badge fade-up fade-up-delay-1 mb-6"
              data-testid="scarcity-badge-intro"
            >
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ backgroundColor: "#b45309" }}
              ></span>
              Apenas 12 unidades • Alta procura
            </div>

            <h1
              className="fade-up fade-up-delay-1 text-4xl font-semibold leading-[1.04] sm:text-5xl lg:text-[64px] lg:leading-[1.02]"
              style={{ color: "var(--torres-ink)" }}
            >
              Descubra se você pode
              <br />
              conquistar uma das{" "}
              <span
                className="italic"
                style={{ color: "var(--torres-indigo)" }}
              >
                12 casas
              </span>{" "}
              do Alameda 500.
            </h1>

            <p
              className="fade-up fade-up-delay-2 mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "var(--torres-muted)" }}
            >
              Responda 6 perguntas rápidas e veja, em menos de 2 minutos, se este
              imóvel faz sentido para o seu momento de vida.
            </p>

            <div className="fade-up fade-up-delay-3 mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <button
                data-testid="start-quiz-btn"
                onClick={onStart}
                className="btn-primary-torres group inline-flex items-center gap-3"
              >
                Quero descobrir agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <span
                className="text-xs font-medium tracking-wide"
                style={{ color: "var(--torres-muted)" }}
              >
                Leva menos de 2 minutos • Sem compromisso
              </span>
            </div>
          </div>

          {/* Bottom meta row */}
          <div className="fade-up fade-up-delay-4 mt-12 grid grid-cols-3 gap-4 border-t border-[color:var(--torres-line)] pt-6 lg:mt-0">
            <Meta
              icon={<Home className="h-4 w-4" />}
              title="Casas Duplex"
              subtitle="63 a 79 m²"
            />
            <Meta
              icon={<span className="serif text-base font-semibold">2Q</span>}
              title="2 Quartos"
              subtitle="+ Área Gourmet"
            />
            <Meta
              icon={<Clock className="h-4 w-4" />}
              title="Lançamento"
              subtitle="Alta procura"
            />
          </div>
        </div>

        {/* RIGHT — hero image */}
        <div className="relative min-h-[60vh] overflow-hidden lg:min-h-screen">
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={ALAMEDA_IMAGES.fachadaDia}
              alt="Residencial Alameda 500 — fachada"
              className="ken-burns h-full w-full object-cover"
              data-testid="hero-image"
            />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(100,113,162,0.25) 0%, rgba(47,54,84,0.35) 100%)",
            }}
          />
          {/* Floating caption */}
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-auto">
            <div className="glass-card fade-up fade-up-delay-3 inline-block max-w-md rounded-2xl px-5 py-4">
              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--torres-indigo-deep)" }}
              >
                Exterior • Fachada principal
              </div>
              <div
                className="serif mt-1 text-lg font-semibold"
                style={{ color: "var(--torres-ink)" }}
              >
                Design contemporâneo, feito pra viver.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(100,113,162,0.08)",
          color: "var(--torres-indigo)",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-xs font-semibold"
          style={{ color: "var(--torres-ink)" }}
        >
          {title}
        </div>
        <div
          className="text-[11px]"
          style={{ color: "var(--torres-muted)" }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  );
}
