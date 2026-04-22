import React, { useState } from "react";
import { useJourney } from "../context/JourneyContext";
import { ALAMEDA_IMAGES } from "../lib/assets";
import { ArrowRight, Shield, Lock, Sparkles, MapPin } from "lucide-react";

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Gate() {
  const { setRegistered, setContato, setOpportunityOptIn } = useJourney();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [optIn, setOptIn] = useState(true);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Informe seu nome.");
    if (phone.replace(/\D/g, "").length < 10)
      return setError("Informe um WhatsApp válido com DDD.");
    setError("");
    setContato({ name: name.trim(), phone: phone.trim() });
    setOpportunityOptIn(optIn);
    setRegistered(true);
  };

  return (
    <section
      data-testid="gate-screen"
      className="relative min-h-screen w-full overflow-hidden bg-[color:var(--torres-cream)]"
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 lg:grid-cols-[1fr_1.05fr] lg:min-h-screen">
        {/* LEFT — image */}
        <div className="relative order-2 min-h-[40vh] overflow-hidden lg:order-1 lg:min-h-screen">
          <img
            src={ALAMEDA_IMAGES.fachadaDia}
            alt="Residencial Alameda 500"
            className="ken-burns h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(47,54,84,0.25) 0%, rgba(27,31,46,0.55) 100%)",
            }}
          />
          <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-10 sm:left-10">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] opacity-90">
              <MapPin className="h-3 w-3" />
              Alterosas, Serra — ES
            </div>
            <div className="serif mt-2 text-2xl font-semibold sm:text-3xl">
              Residencial Alameda 500
            </div>
            <div className="mt-1 max-w-md text-sm opacity-85">
              12 casas duplex. Sem condomínio. Imagina você vivendo aqui?
            </div>
          </div>
        </div>

        {/* RIGHT — form */}
        <div className="relative order-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:order-2 lg:px-16 lg:py-14">
          <div className="fade-up max-w-lg">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border"
                style={{
                  borderColor: "rgba(100,113,162,0.35)",
                  backgroundColor: "rgba(100,113,162,0.06)",
                  color: "var(--torres-indigo)",
                }}
              >
                <span className="serif text-lg font-semibold">A</span>
              </div>
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  Torres Engenharia
                </div>
                <div className="serif text-base font-semibold" style={{ color: "var(--torres-indigo-deep)" }}>
                  Alameda 500 • Concierge Digital
                </div>
              </div>
            </div>

            <h1
              className="serif fade-up fade-up-delay-1 mt-10 text-4xl font-semibold leading-[1.08] sm:text-5xl"
              style={{ color: "var(--torres-ink)" }}
            >
              Uma experiência{" "}
              <span className="italic" style={{ color: "var(--torres-indigo)" }}>
                exclusiva
              </span>{" "}
              sobre seu próximo lar.
            </h1>
            <p
              className="fade-up fade-up-delay-2 mt-4 text-base leading-relaxed"
              style={{ color: "var(--torres-muted)" }}
            >
              Em poucos minutos você explora cada ambiente, descobre qual das{" "}
              <strong>12 casas</strong> combina com seu momento e simula sua
              proposta — no seu ritmo, sem pressão comercial.
            </p>

            <div className="fade-up fade-up-delay-3 mt-6 flex items-center gap-2 text-xs" style={{ color: "var(--torres-muted)" }}>
              <Lock className="h-3.5 w-3.5" />
              Acesso liberado após uma breve apresentação.
            </div>

            <form
              onSubmit={submit}
              data-testid="gate-form"
              className="fade-up fade-up-delay-3 mt-6 space-y-4"
            >
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  Como podemos te chamar?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  data-testid="gate-nome"
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  Seu WhatsApp
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(27) 99999-9999"
                  data-testid="gate-whatsapp"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[color:var(--torres-line)] bg-white p-4 transition-colors hover:border-[color:var(--torres-indigo)]/60">
                <input
                  type="checkbox"
                  checked={optIn}
                  onChange={(e) => setOptIn(e.target.checked)}
                  data-testid="gate-opportunity-optin"
                  className="mt-0.5 h-4 w-4 accent-[color:var(--torres-indigo)]"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                    <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--torres-indigo)" }} />
                    Quero ser avisado de oportunidades especiais
                  </div>
                  <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                    Unidades com condição diferenciada, lançamentos e eventos exclusivos — só pra quem optou.
                  </div>
                </div>
              </label>

              {error && (
                <div
                  data-testid="gate-error"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                data-testid="gate-submit-btn"
                className="btn-primary-torres group inline-flex w-full items-center justify-center gap-3"
              >
                Liberar experiência
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-start gap-2 pt-1 text-xs" style={{ color: "var(--torres-muted)" }}>
                <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                Seus dados são usados apenas para atendimento. Sem spam, sem compartilhamento.
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
