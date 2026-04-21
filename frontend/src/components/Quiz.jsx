import React, { useState } from "react";
import { QUIZ_QUESTIONS } from "../lib/quizData";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

export default function Quiz({ onComplete, onBack }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qid]: { value, label, weight } }

  const question = QUIZ_QUESTIONS[current];
  const progressPct = Math.round(((current + 1) / QUIZ_QUESTIONS.length) * 100);
  const selected = answers[question.id];

  const selectOption = (opt) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { value: opt.value, label: opt.label, weight: opt.weight },
    }));
  };

  const goNext = () => {
    if (!selected) return;
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onComplete(answers);
    }
  };

  const goPrev = () => {
    if (current === 0) {
      onBack();
    } else {
      setCurrent((c) => c - 1);
    }
  };

  return (
    <section
      data-testid="quiz-screen"
      className="relative flex min-h-screen w-full items-center justify-center bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-2xl">
        {/* Top bar: progress */}
        <div className="mb-10" data-testid="quiz-progress">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={goPrev}
                data-testid="quiz-back-btn"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--torres-line)] transition-colors hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
                aria-label="Voltar"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--torres-muted)" }}
              >
                {question.label} • Pergunta {current + 1} de {QUIZ_QUESTIONS.length}
              </div>
            </div>
            <div
              className="serif text-sm font-semibold tabular-nums"
              style={{ color: "var(--torres-indigo)" }}
              data-testid="quiz-progress-percent"
            >
              {progressPct}%
            </div>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div key={question.id} className="slide-in-right">
          <h2
            data-testid="quiz-question-title"
            className="serif text-3xl font-semibold leading-tight sm:text-4xl"
            style={{ color: "var(--torres-ink)" }}
          >
            {question.prompt}
          </h2>

          <div className="mt-8 flex flex-col gap-3" data-testid="quiz-options">
            {question.options.map((opt) => {
              const isSelected = selected?.value === opt.value;
              return (
                <button
                  key={opt.value}
                  data-testid={`quiz-option-${opt.value}`}
                  onClick={() => selectOption(opt)}
                  className={`quiz-option flex items-center justify-between ${
                    isSelected ? "selected" : ""
                  }`}
                >
                  <span
                    className="text-base font-medium sm:text-lg"
                    style={{ color: "var(--torres-ink)" }}
                  >
                    {opt.label}
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                      isSelected
                        ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)]"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <div className="mt-10 flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--torres-muted)" }}
            >
              Suas respostas ajudam o corretor a te atender melhor.
            </span>
            <button
              onClick={goNext}
              disabled={!selected}
              data-testid="quiz-next-btn"
              className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                selected
                  ? "btn-primary-torres"
                  : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
              }`}
            >
              {current === QUIZ_QUESTIONS.length - 1 ? "Ver meu resultado" : "Continuar"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
