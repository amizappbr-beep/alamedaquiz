import React, { useEffect, useState } from "react";
import { useJourney } from "../../context/JourneyContext";
import { QUIZ_QUESTIONS } from "../../lib/quizData";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function ModuloPerfil() {
  const { markModuloVisitado, goTo, setQuizAnswer, quiz_answers, classification } =
    useJourney();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    markModuloVisitado("perfil");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const question = QUIZ_QUESTIONS[current];
  const progressPct = Math.round(((current + 1) / QUIZ_QUESTIONS.length) * 100);
  const selected = quiz_answers[question.id];
  const isLast = current === QUIZ_QUESTIONS.length - 1;

  const choose = (opt) =>
    setQuizAnswer(question.id, {
      value: opt.value,
      label: opt.label,
      weight: opt.weight,
    });

  const next = () => {
    if (!selected) return;
    if (!isLast) setCurrent((c) => c + 1);
    else goTo("hub");
  };

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
                onClick={() => (current === 0 ? goTo("hub") : setCurrent((c) => c - 1))}
                data-testid="perfil-back-btn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--torres-line)] transition-colors hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Módulo 3 • {question.label} • {current + 1}/{QUIZ_QUESTIONS.length}
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
          <h2
            className="serif text-3xl font-semibold leading-tight sm:text-4xl"
            style={{ color: "var(--torres-ink)" }}
          >
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
                      isSel
                        ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)]"
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
                selected
                  ? "btn-primary-torres"
                  : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
              }`}
            >
              {isLast ? (classification ? `Perfil: ${classification}` : "Ver meu perfil") : "Próxima"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
