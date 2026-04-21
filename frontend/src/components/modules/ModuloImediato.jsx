import React, { useState } from "react";
import axios from "axios";
import { useJourney } from "../../context/JourneyContext";
import { ArrowLeft, ArrowRight, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsappUrl } from "../../lib/quizData";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ModuloImediato() {
  const {
    name: ctxName,
    phone: ctxPhone,
    setContato,
    setAtendimentoImediato,
    goTo,
    modulos_visitados,
    quiz_answers,
    classification,
    casa_preferida,
    simulacao,
    tempoTotalSegundos,
    interacoes,
    leadScore,
    temperatura,
  } = useJourney();

  const [name, setName] = useState(ctxName || "");
  const [phone, setPhone] = useState(ctxPhone || "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() && phone.replace(/\D/g, "").length >= 10;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Preencha nome e WhatsApp para continuar.");
      return;
    }
    setError("");
    setSubmitting(true);

    setContato({ name: name.trim(), phone: phone.trim() });
    setAtendimentoImediato(true);

    const quizArr = Object.entries(quiz_answers).map(([qid, a]) => ({
      question_id: qid,
      question: qid,
      answer: a?.label || "",
    }));

    let serverScore = leadScore;
    let serverTemp = temperatura;
    try {
      const resp = await axios.post(`${API}/leads`, {
        name: name.trim(),
        phone: phone.trim(),
        modulos_visitados,
        quiz_answers: quizArr,
        classification,
        casa_preferida,
        simulacao,
        agendamento: null,
        solicita_atendimento_imediato: true,
        interacoes,
        tempo_total_segundos: tempoTotalSegundos,
      });
      serverScore = resp.data?.lead_score ?? leadScore;
      serverTemp = resp.data?.temperatura ?? temperatura;

      // Redireciona ao WhatsApp com score oficial do servidor
      const wa = buildWhatsappUrl({
        name: name.trim(),
        temperatura: serverTemp,
        score: serverScore,
        casa: casa_preferida,
        modulos: modulos_visitados,
      });
      window.open(wa, "_blank", "noopener");
      goTo("obrigado");
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Não conseguimos registrar seu contato. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      data-testid="modulo-imediato"
      className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-xl">
        <button
          onClick={() => goTo("corretor")}
          data-testid="imediato-back-btn"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[color:var(--torres-indigo)]"
          style={{ color: "var(--torres-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="fade-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Online agora
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--torres-ink)" }}>
            Atendimento imediato pelo WhatsApp.
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
            Confirme seus dados e abriremos o WhatsApp com sua jornada já
            compartilhada. Tempo médio de resposta: menos de 2 min.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4" data-testid="imediato-form">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              data-testid="imediato-nome"
              className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              WhatsApp
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(27) 99999-9999"
              data-testid="imediato-whatsapp"
              className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" data-testid="imediato-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            data-testid="imediato-submit-btn"
            className={`group inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold transition-all ${
              canSubmit && !submitting ? "btn-primary-torres" : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Abrindo WhatsApp...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Abrir WhatsApp agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
