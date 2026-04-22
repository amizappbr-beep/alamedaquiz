import React, { useEffect, useState } from "react";
import { useJourney } from "../../context/JourneyContext";
import {
  QUIZ_QUESTIONS,
  QUIZ_BLOCOS,
  gerarInsights,
  getQuestionsByBloco,
} from "../../lib/quizData";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";

export default function ModuloPerfil() {
  const { markModuloVisitado, goTo, setQuizAnswer, quiz_answers, classification } =
    useJourney();
  const [current, setCurrent] = useState(0); // index global 0..11
  const [showInsight, setShowInsight] = useState(false); // true após bloco 1

  useEffect(() => {
    markModuloVisitado("perfil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      goTo("hub");
    }
  };

  const back = () => {
    if (showInsight) {
      setShowInsight(false);
      return;
    }
    if (current === 0) goTo("hub");
    else setCurrent((c) => c - 1);
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
              {isLast ? (classification ? `Perfil: ${classification}` : "Ver meu perfil") : isEndOfBloco1 ? "Ver insight parcial" : "Próxima"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
