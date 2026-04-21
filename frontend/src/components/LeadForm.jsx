import React, { useState } from "react";
import { ArrowRight, Shield, Loader2 } from "lucide-react";

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function LeadForm({ onSubmit, submitting }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    if (digits.length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    setError("");
    onSubmit({ name: name.trim(), phone: phone.trim() });
  };

  return (
    <section
      data-testid="lead-form-screen"
      className="relative flex min-h-screen w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-xl fade-up">
        <div
          className="text-[11px] uppercase tracking-[0.22em]"
          style={{ color: "var(--torres-indigo)" }}
        >
          Quase lá
        </div>
        <h2
          className="serif mt-3 text-3xl font-semibold leading-tight sm:text-4xl"
          style={{ color: "var(--torres-ink)" }}
        >
          Onde devemos enviar o seu resultado?
        </h2>
        <p
          className="mt-3 text-base"
          style={{ color: "var(--torres-muted)" }}
        >
          Analisamos suas respostas e, se você se encaixar no perfil, um
          especialista da Torres Engenharia fala com você no WhatsApp.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4"
          data-testid="lead-form"
        >
          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--torres-muted)" }}
            >
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como podemos te chamar?"
              data-testid="lead-name-input"
              className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em]"
              style={{ color: "var(--torres-muted)" }}
            >
              WhatsApp (com DDD)
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(27) 99999-9999"
              data-testid="lead-phone-input"
              className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
            />
          </div>

          {error && (
            <div
              data-testid="lead-form-error"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            data-testid="lead-submit-btn"
            className="btn-primary-torres group mt-2 inline-flex w-full items-center justify-center gap-3 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analisando seu perfil...
              </>
            ) : (
              <>
                Ver meu resultado
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div
            className="mt-4 flex items-start gap-2 text-xs"
            style={{ color: "var(--torres-muted)" }}
          >
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Seus dados são usados apenas para o atendimento. Sem spam, sem
              compartilhamento.
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
