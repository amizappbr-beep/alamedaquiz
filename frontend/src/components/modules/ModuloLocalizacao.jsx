import React, { useEffect, useState } from "react";
import { useJourney } from "../../context/JourneyContext";
import { ENDERECO, ALAMEDA_IMAGES } from "../../lib/assets";
import { MapPin, Navigation, ArrowRight, ExternalLink, Map as MapIcon } from "lucide-react";

export default function ModuloLocalizacao() {
  const { markModuloVisitado, goTo } = useJourney();
  const [masterOpen, setMasterOpen] = useState(false);

  useEffect(() => {
    markModuloVisitado("localizacao");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      data-testid="modulo-localizacao"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="fade-up">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
            Módulo 6 • Localização
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--torres-ink)" }}>
            Onde fica o seu novo lar.
          </h1>
          <p className="mt-3 max-w-2xl text-base" style={{ color: "var(--torres-muted)" }}>
            Alterosas, uma das regiões mais valorizadas da Serra — com acesso
            rápido à Reta da Penha, BR-101 e comércio local.
          </p>
        </div>

        {/* Endereço + ações */}
        <div
          className="mt-8 grid grid-cols-1 gap-4 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr]"
          data-testid="localizacao-endereco"
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
              <MapPin className="h-3 w-3" />
              Endereço oficial
            </div>
            <div className="serif mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--torres-ink)" }}>
              {ENDERECO.rua}
            </div>
            <div className="text-base" style={{ color: "var(--torres-muted)" }}>
              {ENDERECO.bairro} • {ENDERECO.cidade}/{ENDERECO.uf}
            </div>
            {ENDERECO.cep && (
              <div className="mt-0.5 text-sm" style={{ color: "var(--torres-muted)" }}>
                CEP {ENDERECO.cep}
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-2 sm:flex-row lg:flex-col">
            <a
              href={ENDERECO.mapsDirections}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="localizacao-rota-btn"
              className="btn-primary-torres group inline-flex items-center justify-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Traçar rota até aqui
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO.mapsQuery)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="localizacao-maps-btn"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-[color:var(--torres-indigo)]"
            >
              <MapIcon className="h-4 w-4" />
              Abrir no Google Maps
            </a>
          </div>
        </div>

        {/* Google Maps iframe */}
        <div className="mt-6 overflow-hidden rounded-3xl border border-[color:var(--torres-line)] bg-white" data-testid="localizacao-mapa">
          <iframe
            title="Mapa Alameda 500"
            src={ENDERECO.mapsEmbed}
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Master plan */}
        <div className="mt-8 fade-up">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
                Implantação do empreendimento
              </div>
              <h2 className="serif mt-2 text-2xl font-semibold sm:text-3xl" style={{ color: "var(--torres-ink)" }}>
                Master plan
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
                As 12 casas e a distribuição no terreno. Toque para ampliar.
              </p>
            </div>
          </div>

          <button
            onClick={() => setMasterOpen(true)}
            data-testid="localizacao-masterplan-btn"
            className="group mt-5 block w-full overflow-hidden rounded-3xl border border-[color:var(--torres-line)] bg-white"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={ALAMEDA_IMAGES.implantacao}
                alt="Master plan — implantação"
                className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          </button>
        </div>

        {/* Next */}
        <div className="mt-10 flex flex-col items-start gap-4 rounded-3xl border border-[color:var(--torres-line)] bg-white p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="serif text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Vamos conversar sobre sua proposta?
            </div>
            <div className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
              Atendimento imediato pelo WhatsApp ou visita agendada no seu horário.
            </div>
          </div>
          <button
            onClick={() => goTo("corretor")}
            data-testid="localizacao-next-btn"
            className="btn-primary-torres group inline-flex items-center gap-2"
          >
            Falar com corretor
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {masterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setMasterOpen(false)}
          data-testid="masterplan-lightbox"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMasterOpen(false);
            }}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20"
            data-testid="masterplan-close"
          >
            ✕
          </button>
          <img
            src={ALAMEDA_IMAGES.implantacao}
            alt="Master plan"
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain"
          />
        </div>
      )}
    </section>
  );
}
