import React, { useState } from "react";
import { useJourney } from "../../context/JourneyContext";
import {
  QUIZ_QUESTIONS,
  QUIZ_BLOCOS,
  gerarInsights,
  getQuestionsByBloco,
} from "../../lib/quizData";
import { getPrevStage } from "../../lib/bookPages";
import { ArrowLeft, ArrowRight, Check, Sparkles, Shield, Lock } from "lucide-react";

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ModuloPerfil() {
  const {
    goTo,
    setQuizAnswer,
    quiz_answers,
    markModuloVisitado,
    name: ctxName,
    phone: ctxPhone,
    setContato,
  } = useJourney();
  const [current, setCurrent] = useState(0); // index global 0..11
  const [showInsight, setShowInsight] = useState(false); // true após bloco 1

  // Captura de identidade — substitui o antigo Gate. Aparece SOMENTE
  // quando o usuário ainda não preencheu nome+WhatsApp (ex: chegou
  // diretamente pelo book sem passar por outro fluxo).
  const identityDone =
    !!(ctxName && ctxName.trim()) &&
    !!ctxPhone &&
    ctxPhone.replace(/\D/g, "").length >= 10;
  const [showIdentity, setShowIdentity] = useState(!identityDone);
  const [idName, setIdName] = useState(ctxName || "");
  const [idPhone, setIdPhone] = useState(ctxPhone || "");
  const [idError, setIdError] = useState("");

  const submitIdentity = (e) => {
    e.preventDefault();
    if (!idName.trim()) return setIdError("Informe seu nome.");
    if (idPhone.replace(/\D/g, "").length < 10)
      return setIdError("Informe um WhatsApp válido com DDD.");
    setIdError("");
    setContato({ name: idName.trim(), phone: idPhone.trim() });
    setShowIdentity(false);
  };

  const bloco1 = getQuestionsByBloco(1);
  const totalQ = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[current];
  const progressPct = Math.round(((current + 1) / totalQ) * 100);
  const selected = quiz_answers[question.id];
  const isLast = current === totalQ - 1;
  const isEndOfBloco1 = current === bloco1.length - 1;

  const choose = (opt) =>
    setQuizAnswer(question.id, {
      value: opt.value,
      label: opt.label,
      weight: opt.weight,
    });

  const next = () => {
    if (!selected) return;
    if (isEndOfBloco1 && !showInsight) {
      setShowInsight(true);
      return;
    }
    if (!isLast) {
      setCurrent((c) => c + 1);
    } else {
      // Conclui o quiz: registra o módulo (pra liberar broker e somar score)
      // e avança pra próxima página do Book.
      markModuloVisitado("perfil");
      goTo("simulador");
    }
  };

  const back = () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }
    if (current === 0) {
      // Volta para o capítulo anterior do book (Localização) em vez da Capa.
      const prev = getPrevStage("perfil");
      goTo(prev || "hub");
    } else {
      setCurrent((c) => c - 1);
    }
  };

  // Tela de insight entre blocos
  if (showInsight) {
    const insights = gerarInsights(quiz_answers);
    return (
      <section
        data-testid="perfil-insight-screen"
        className="flex min-h-[calc(100vh-60px)] items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
      >
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={back}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--torres-line)] transition-colors hover:border-[color:var(--torres-indigo)]"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
              Insight parcial
            </div>
          </div>

          <div className="fade-up">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-indigo)]/30 bg-[color:var(--torres-indigo)]/5 px-3 py-1.5 text-[11px] font-semibold"
              style={{ color: "var(--torres-indigo-deep)" }}
            >
              <Sparkles className="h-3 w-3" />
              Analisamos suas primeiras respostas
            </div>
            <h2 className="serif mt-4 text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: "var(--torres-ink)" }}>
              Já estamos entendendo seu perfil.
            </h2>
            <p className="mt-2 text-base" style={{ color: "var(--torres-muted)" }}>
              Mais 6 perguntas rápidas pra montar a proposta ideal — inclui
              renda, FGTS e situação familiar.
            </p>

            {insights.length > 0 ? (
              <div className="mt-6 space-y-3" data-testid="perfil-insights-list">
                {insights.slice(0, 4).map((ins, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4"
                    data-testid={`insight-${idx}`}
                  >
                    <div className="text-2xl">{ins.icon}</div>
                    <div>
                      <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                        {ins.titulo}
                      </div>
                      <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                        {ins.descricao}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="mt-6 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4 text-sm"
                style={{ color: "var(--torres-muted)" }}
              >
                Siga respondendo para desbloquear mais insights sobre seu perfil.
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => {
                  setShowInsight(false);
                  setCurrent((c) => c + 1);
                }}
                data-testid="perfil-insight-next-btn"
                className="btn-primary-torres group inline-flex items-center gap-2"
              >
                Continuar pro bloco 2
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Captura inline de identidade — substitui o antigo Gate da Capa.
  // Aparece como passo 0 do Quiz quando o usuário ainda não preencheu
  // contato em nenhum lugar.
  if (showIdentity) {
    return (
      <section
        data-testid="modulo-perfil-identidade"
        className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
      >
        <div className="mx-auto w-full max-w-xl">
          <div className="fade-up">
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
              style={{
                borderColor: "rgba(100,113,162,0.3)",
                backgroundColor: "rgba(100,113,162,0.05)",
                color: "var(--torres-indigo-deep)",
              }}
            >
              <Sparkles className="h-3 w-3" />
              Quase lá — vamos personalizar
            </div>
            <h1
              className="serif mt-4 text-3xl font-semibold leading-tight sm:text-4xl"
              style={{ color: "var(--torres-ink)" }}
            >
              Antes do quiz, em qual nome posso te chamar?
            </h1>
            <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
              A partir daqui o atendimento começa a ser personalizado pelo seu
              perfil. Em 12 perguntas rápidas a gente entende seu momento e
              prepara a melhor proposta — no seu nome.
            </p>

            <form
              onSubmit={submitIdentity}
              data-testid="perfil-identidade-form"
              className="mt-7 space-y-4"
            >
              <div>
                <label
                  className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  Seu nome
                </label>
                <input
                  type="text"
                  value={idName}
                  onChange={(e) => setIdName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  data-testid="perfil-identidade-nome"
                  autoFocus
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  WhatsApp
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={idPhone}
                  onChange={(e) => setIdPhone(formatPhone(e.target.value))}
                  placeholder="(27) 99999-9999"
                  data-testid="perfil-identidade-whatsapp"
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3.5 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
                />
                <div
                  className="mt-1.5 flex items-center gap-1.5 text-[11px]"
                  style={{ color: "var(--torres-muted)" }}
                >
                  <Lock className="h-3 w-3" />
                  Usado só para retomar sua jornada e atendimento.
                </div>
              </div>

              {idError && (
                <div
                  data-testid="perfil-identidade-error"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
                >
                  {idError}
                </div>
              )}

              <button
                type="submit"
                data-testid="perfil-identidade-submit"
                className="btn-primary-torres group inline-flex w-full items-center justify-center gap-3"
              >
                Começar o quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div
                className="flex items-start gap-2 pt-1 text-xs"
                style={{ color: "var(--torres-muted)" }}
              >
                <Shield className="mt-0.5 h-3 w-3 shrink-0" />
                Seus dados são usados apenas para atendimento. Sem spam, sem
                compartilhamento.
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="modulo-perfil"
      className="flex min-h-[calc(100vh-60px)] w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-10" data-testid="perfil-progress">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={back}
                data-testid="perfil-back-btn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--torres-line)] transition-colors hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                {QUIZ_BLOCOS[question.bloco - 1].titulo} • {question.label} • {current + 1}/{totalQ}
              </div>
            </div>
            <div className="serif text-sm font-semibold tabular-nums" style={{ color: "var(--torres-indigo)" }}>
              {progressPct}%
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div key={question.id} className="slide-in-right">
          <h2 className="serif text-3xl font-semibold leading-tight sm:text-4xl" style={{ color: "var(--torres-ink)" }}>
            {question.prompt}
          </h2>
          <div className="mt-8 flex flex-col gap-3">
            {question.options.map((opt) => {
              const isSel = selected?.value === opt.value;
              return (
                <button
                  key={opt.value}
                  data-testid={`perfil-option-${opt.value}`}
                  onClick={() => choose(opt)}
                  className={`quiz-option flex items-center justify-between ${isSel ? "selected" : ""}`}
                >
                  <span className="text-base font-medium sm:text-lg" style={{ color: "var(--torres-ink)" }}>
                    {opt.label}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSel ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white" : "border-[color:var(--torres-line)]"
                    }`}
                  >
                    {isSel && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 flex items-center justify-end">
            <button
              onClick={next}
              disabled={!selected}
              data-testid="perfil-next-btn"
              className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                selected ? "btn-primary-torres" : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
              }`}
            >
              {isLast ? "Simular meu financiamento" : isEndOfBloco1 ? "Ver insight parcial" : "Próxima"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
