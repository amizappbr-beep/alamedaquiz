import React, { useEffect } from "react";
import { useJourney } from "../../context/JourneyContext";
import { DIFERENCIAIS } from "../../lib/conteudo";
import * as LucideIcons from "lucide-react";
import ModuleFooterCTA from "../ModuleFooterCTA";

export default function ModuloDiferenciais() {
  const { markModuloVisitado, goTo } = useJourney();

  useEffect(() => {
    markModuloVisitado("diferenciais");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      data-testid="modulo-diferenciais"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="fade-up max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
            Módulo 5 • Diferenciais
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--torres-ink)" }}>
            10 motivos pra escolher o Alameda 500.
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
            Cada detalhe foi pensado pra melhorar seu dia a dia — da economia
            de condomínio à previsão para ar-split.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="diferenciais-grid">
          {DIFERENCIAIS.map((d, idx) => {
            const Icon = LucideIcons[d.icon] || LucideIcons.Sparkles;
            return (
              <div
                key={d.id}
                data-testid={`diferencial-${d.id}`}
                className="group relative overflow-hidden rounded-2xl border border-[color:var(--torres-line)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[color:var(--torres-indigo)]/60 hover:shadow-[0_20px_40px_-24px_rgba(100,113,162,0.45)] fade-up"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: "rgba(100,113,162,0.08)",
                    color: "var(--torres-indigo)",
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="serif mt-4 text-lg font-semibold leading-snug" style={{ color: "var(--torres-ink)" }}>
                  {d.titulo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--torres-muted)" }}>
                  {d.descricao}
                </p>
              </div>
            );
          })}
        </div>

        <ModuleFooterCTA
          testId="diferenciais-footer-cta"
          titulo="Gostou? Agora é decidir quando conversar com o corretor."
          descricao="Atendimento imediato pelo WhatsApp ou visita agendada no seu horário."
          primary={{
            label: "Falar com corretor",
            onClick: () => goTo("corretor"),
            testId: "diferenciais-next-btn",
          }}
        />
      </div>
    </section>
  );
}
