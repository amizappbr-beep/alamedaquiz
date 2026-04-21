import React, { useMemo, useState } from "react";
import axios from "axios";
import { useJourney } from "../../context/JourneyContext";
import { ArrowLeft, ArrowRight, Loader2, Calendar, MapPin, Video, Home as HomeIcon } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FORMATOS = [
  { id: "decorado", label: "No apto decorado", icon: HomeIcon, descricao: "Stand de vendas" },
  { id: "imovel", label: "Visita ao imóvel", icon: MapPin, descricao: "No Alameda 500" },
  { id: "videochamada", label: "Videochamada", icon: Video, descricao: "De onde você estiver" },
];

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function getDatesNext14Days() {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    out.push(d);
  }
  return out;
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const HORARIOS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

export default function ModuloAgendamento() {
  const {
    name: ctxName,
    phone: ctxPhone,
    setContato,
    setAgendamento,
    goTo,
    modulos_visitados,
    quiz_answers,
    classification,
    casa_preferida,
    simulacao,
    tempoTotalSegundos,
    interacoes,
  } = useJourney();

  const [name, setName] = useState(ctxName || "");
  const [phone, setPhone] = useState(ctxPhone || "");
  const [formato, setFormato] = useState("decorado");
  const [selectedDate, setSelectedDate] = useState(null); // Date
  const [selectedHour, setSelectedHour] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const dates = useMemo(() => getDatesNext14Days(), []);

  const toIsoDate = (d) => {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const canSubmit = name.trim() && phone.replace(/\D/g, "").length >= 10 && selectedDate && selectedHour && formato;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setError("Preencha nome, WhatsApp, data e horário.");
      return;
    }
    setError("");
    setSubmitting(true);

    const agendamento = {
      data: toIsoDate(selectedDate),
      horario: selectedHour,
      formato,
      observacao: observacao || null,
    };

    setContato({ name: name.trim(), phone: phone.trim() });
    setAgendamento(agendamento);

    const quizArr = Object.entries(quiz_answers).map(([qid, a]) => ({
      question_id: qid,
      question: qid,
      answer: a?.label || "",
    }));

    try {
      await axios.post(`${API}/leads`, {
        name: name.trim(),
        phone: phone.trim(),
        modulos_visitados,
        quiz_answers: quizArr,
        classification,
        casa_preferida,
        simulacao,
        agendamento,
        solicita_atendimento_imediato: false,
        interacoes,
        tempo_total_segundos: tempoTotalSegundos,
      });
      goTo("obrigado");
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Não conseguimos registrar seu agendamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      data-testid="modulo-agendamento"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-10 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1000px]">
        <button
          onClick={() => goTo("corretor")}
          data-testid="agendamento-back-btn"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-[color:var(--torres-indigo)]"
          style={{ color: "var(--torres-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="fade-up">
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
            Agendar atendimento
          </div>
          <h1 className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl" style={{ color: "var(--torres-ink)" }}>
            Quando e como quer ser atendido?
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--torres-muted)" }}>
            Escolha o formato, dia e horário. Confirmação imediata.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 space-y-8" data-testid="agendamento-form">
          {/* Formato */}
          <fieldset>
            <legend className="mb-3 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              1. Formato
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FORMATOS.map((f) => {
                const Icon = f.icon;
                const isSel = formato === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    data-testid={`formato-${f.id}`}
                    onClick={() => setFormato(f.id)}
                    className={`flex items-start gap-3 rounded-2xl border bg-white p-4 text-left transition-all ${
                      isSel
                        ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)]/5"
                        : "border-[color:var(--torres-line)] hover:border-[color:var(--torres-indigo)]/60"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: isSel ? "var(--torres-indigo)" : "rgba(100,113,162,0.08)",
                        color: isSel ? "#fff" : "var(--torres-indigo)",
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                        {f.label}
                      </div>
                      <div className="text-xs" style={{ color: "var(--torres-muted)" }}>
                        {f.descricao}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Data */}
          <fieldset>
            <legend className="mb-3 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              2. Data
            </legend>
            <div className="gallery-scroll flex gap-2 overflow-x-auto pb-2" data-testid="agendamento-datas">
              {dates.map((d) => {
                const isSel = selectedDate && toIsoDate(d) === toIsoDate(selectedDate);
                return (
                  <button
                    key={toIsoDate(d)}
                    type="button"
                    data-testid={`data-${toIsoDate(d)}`}
                    onClick={() => setSelectedDate(d)}
                    className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-3 text-center transition-all ${
                      isSel
                        ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)] bg-white hover:border-[color:var(--torres-indigo)]/60"
                    }`}
                    style={{ minWidth: 68 }}
                  >
                    <span className={`text-[10px] uppercase tracking-wider ${isSel ? "text-white/80" : ""}`} style={!isSel ? { color: "var(--torres-muted)" } : {}}>
                      {WEEK_DAYS[d.getDay()]}
                    </span>
                    <span className={`serif text-xl font-semibold ${isSel ? "text-white" : ""}`} style={!isSel ? { color: "var(--torres-ink)" } : {}}>
                      {d.getDate()}
                    </span>
                    <span className={`text-[10px] ${isSel ? "text-white/80" : ""}`} style={!isSel ? { color: "var(--torres-muted)" } : {}}>
                      {MONTHS[d.getMonth()]}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Horário */}
          <fieldset>
            <legend className="mb-3 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              3. Horário
            </legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" data-testid="agendamento-horarios">
              {HORARIOS.map((h) => {
                const isSel = selectedHour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    data-testid={`horario-${h}`}
                    onClick={() => setSelectedHour(h)}
                    className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                      isSel
                        ? "border-[color:var(--torres-indigo)] bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]/60"
                    }`}
                  >
                    {h}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Contato */}
          <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                data-testid="agendamento-nome"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
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
                data-testid="agendamento-whatsapp"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Observação (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Algo que o corretor deva saber antes?"
                data-testid="agendamento-observacao"
                rows={3}
                className="w-full resize-none rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </div>
          </fieldset>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" data-testid="agendamento-error">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs" style={{ color: "var(--torres-muted)" }}>
              <Calendar className="h-3.5 w-3.5" />
              {selectedDate && selectedHour
                ? `${selectedDate.toLocaleDateString("pt-BR")} às ${selectedHour}`
                : "Selecione data e horário"}
            </div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              data-testid="agendamento-submit-btn"
              className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                canSubmit && !submitting
                  ? "btn-primary-torres"
                  : "cursor-not-allowed bg-[color:var(--torres-line)] text-[color:var(--torres-muted)]"
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirmando...
                </>
              ) : (
                <>
                  Confirmar agendamento
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
