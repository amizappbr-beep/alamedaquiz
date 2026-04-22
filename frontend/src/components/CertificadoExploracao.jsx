import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { Download, Share2, Loader2, MapPin, CheckCircle2 } from "lucide-react";
import { ALAMEDA_IMAGES } from "../lib/assets";

const CASA_NOMES = {
  "1_12": "Premium · Casa 1 ou 12",
  "6_7": "Família · Casa 6 ou 7",
  "2_a_11": "Essencial · Casas 2–11",
};

function tempToText(temp) {
  if (temp === "quente") return "Perfil Compatível";
  if (temp === "morno") return "Perfil em Análise";
  return "Explorando Opções";
}

function todayBR() {
  const d = new Date();
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

/**
 * Certificate of Exploration — a visual card on screen that can also be
 * exported as a shareable PNG via html2canvas.
 */
export default function CertificadoExploracao({
  name,
  modulosCount,
  temperatura,
  casaId,
  leadScore,
}) {
  const cardRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const firstName = (name || "Explorador").split(" ")[0];
  const temperaturaText = tempToText(temperatura);
  const casaNome = casaId ? CASA_NOMES[casaId] : null;

  const download = async () => {
    if (!cardRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2, // retina-quality
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL("image/png");

      // Try the Web Share API (mobile) with a File — falls back to download link
      if (navigator.canShare) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], "alameda-500-certificado.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Meu certificado — Alameda 500",
              text: `Explorei ${modulosCount}/6 módulos do Residencial Alameda 500.`,
            });
            return;
          }
        } catch {
          // user cancelled or unsupported — fall through to download
        }
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `alameda-500-certificado-${firstName.toLowerCase()}.png`;
      link.click();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mt-10" data-testid="certificado-wrapper">
      <div className="mb-3 text-center">
        <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
          ✨ Um presente pra você
        </div>
        <h2 className="serif mt-1 text-xl font-semibold sm:text-2xl" style={{ color: "var(--torres-ink)" }}>
          Seu certificado de exploração
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs" style={{ color: "var(--torres-muted)" }}>
          Compartilhe no WhatsApp com quem você imagina morando aqui.
        </p>
      </div>

      {/* The card — must be offset-safe and self-contained for html2canvas */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          data-testid="certificado-card"
          className="certificado-card relative w-full max-w-[520px] overflow-hidden rounded-[28px] text-left"
          style={{
            aspectRatio: "4 / 5",
            background:
              "radial-gradient(120% 100% at 0% 0%, #2a2f45 0%, #1b1e2d 60%, #0f1220 100%)",
            boxShadow: "0 30px 80px -30px rgba(20,22,34,0.45)",
          }}
        >
          {/* Decorative background image */}
          <div
            className="absolute inset-x-0 top-0 h-[55%] opacity-50"
            style={{
              backgroundImage: `url(${ALAMEDA_IMAGES.fachadaPrincipalNoturna})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(180deg, rgba(15,18,32,0.25) 0%, rgba(15,18,32,0.85) 62%, rgba(15,18,32,1) 100%)",
            }}
          />
          {/* Decorative dashed border inside */}
          <div
            className="absolute inset-3 rounded-[22px] border border-dashed"
            style={{ borderColor: "rgba(199,207,232,0.25)" }}
            aria-hidden
          />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col p-7 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-[0.28em] text-white/70">
                  Torres Engenharia
                </div>
                <div className="serif text-lg font-semibold italic text-white">
                  Alameda 500
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-2.5 py-1 text-[9px] uppercase tracking-wider text-white/80 backdrop-blur">
                <CheckCircle2 className="h-3 w-3 text-emerald-300" />
                Certificado
              </div>
            </div>

            {/* Middle — hero block */}
            <div className="mt-auto">
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
                Este certificado reconhece que
              </div>
              <div
                className="serif mt-2 text-3xl font-semibold leading-tight text-white sm:text-[34px]"
                style={{ letterSpacing: "-0.5px" }}
              >
                {firstName}
              </div>
              <div
                className="mt-3 text-sm leading-relaxed text-white/85 sm:text-[15px]"
              >
                explorou{" "}
                <span className="serif font-semibold" style={{ color: "#c7cfe8" }}>
                  {modulosCount} {modulosCount === 1 ? "módulo" : "módulos"}
                </span>{" "}
                da experiência digital do Residencial Alameda 500 e está{" "}
                <span className="font-semibold text-emerald-300">pronto(a) para o próximo passo</span>.
              </div>

              {/* Stats row */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <Stat label="Engajamento" value={`${leadScore}/150`} sub={temperaturaText} />
                <Stat label="Módulos" value={`${modulosCount}/6`} sub="explorados" />
              </div>

              {casaNome && (
                <div
                  className="mt-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] backdrop-blur"
                  style={{ color: "rgba(255,255,255,0.9)" }}
                >
                  <span className="opacity-60">Casa de interesse: </span>
                  <span className="font-semibold">{casaNome}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/55">
                  Emitido em
                </div>
                <div className="text-[11px] font-semibold text-white">{todayBR()}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase tracking-[0.22em] text-white/55">
                  Localização
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-white">
                  <MapPin className="h-3 w-3" />
                  Alterosas · Serra/ES
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="mt-5 flex justify-center">
        <button
          onClick={download}
          disabled={generating}
          data-testid="certificado-download-btn"
          className="btn-primary-torres group inline-flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando imagem…
            </>
          ) : (
            <>
              {navigator.canShare ? <Share2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
              {navigator.canShare ? "Compartilhar certificado" : "Baixar como imagem"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur">
      <div className="text-[9px] uppercase tracking-wider text-white/55">{label}</div>
      <div className="serif text-lg font-semibold text-white">{value}</div>
      <div className="text-[10px] text-white/70">{sub}</div>
    </div>
  );
}
