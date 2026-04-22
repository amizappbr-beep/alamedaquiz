import React, { useEffect, useState } from "react";
import { useAdmin } from "./AdminContext";
import {
  KANBAN_COLUMNS,
  TEMP_LABEL,
  CASA_LABEL,
  MODULO_LABEL,
  formatBRL,
  formatDate,
} from "./constants";
import {
  X,
  Phone,
  Mail,
  Loader2,
  MessageCircle,
  Send,
  Flame,
  Calendar,
  Zap,
  Calculator,
  Home as HomeIcon,
  Clock,
  User,
} from "lucide-react";

export default function LeadDetailDrawer({ leadId, onClose, onStatusChanged }) {
  const { axiosAdmin } = useAdmin();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const { data } = await axiosAdmin.get(`/admin/leads/${leadId}`);
        if (!cancelled) setLead(data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (leadId) run();
    return () => {
      cancelled = true;
    };
  }, [leadId, axiosAdmin]);

  const updateStatus = async (next) => {
    if (!lead || next === lead.status) return;
    setSavingStatus(true);
    try {
      await axiosAdmin.patch(`/admin/leads/${lead.id}/status`, { status: next });
      setLead((l) => ({ ...l, status: next }));
      onStatusChanged?.(lead.id, next);
    } finally {
      setSavingStatus(false);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const { data } = await axiosAdmin.post(`/admin/leads/${lead.id}/notes`, {
        text: noteText.trim(),
      });
      setLead((l) => ({ ...l, admin_notes: [...(l.admin_notes || []), data] }));
      setNoteText("");
    } finally {
      setSavingNote(false);
    }
  };

  const openWhatsapp = () => {
    if (!lead?.phone) return;
    const cleaned = lead.phone.replace(/\D/g, "");
    const withCountry = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    const greeting = lead.name ? `Olá ${lead.name},` : "Olá,";
    const msg = `${greeting} aqui é da Torres Engenharia sobre o seu interesse no Residencial Alameda 500. Posso te ajudar?`;
    window.open(`https://wa.me/${withCountry}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  };

  if (!leadId) return null;

  const temp = lead ? TEMP_LABEL[lead.temperatura] || TEMP_LABEL.frio : TEMP_LABEL.frio;
  const sim = lead?.simulacao;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm fade-up"
        onClick={onClose}
        data-testid="lead-drawer-overlay"
      />
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.3)]"
        data-testid="lead-drawer"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--torres-line)] p-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: temp.dot }} aria-hidden />
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                {temp.text}
              </div>
            </div>
            <div className="serif mt-1 truncate text-xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              {lead?.name || "(sem nome)"}
            </div>
          </div>
          <button
            onClick={onClose}
            data-testid="lead-drawer-close"
            className="ml-3 flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--torres-line)] text-[color:var(--torres-muted)] transition-colors hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading || !lead ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--torres-indigo)]" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            {/* Contact + quick actions */}
            <div className="rounded-2xl border border-[color:var(--torres-line)] bg-[color:var(--torres-cream)] p-4">
              {lead.phone && (
                <div className="flex items-center gap-2 text-sm" style={{ color: "var(--torres-ink)" }}>
                  <Phone className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
                  {lead.phone}
                </div>
              )}
              {lead.email && (
                <div className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--torres-ink)" }}>
                  <Mail className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
                  {lead.email}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={openWhatsapp}
                  disabled={!lead.phone}
                  data-testid="lead-drawer-whatsapp-btn"
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Abrir WhatsApp
                </button>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                  Criado em {formatDate(lead.created_at)}
                </div>
              </div>
            </div>

            {/* Kanban status switcher */}
            <div className="mt-5">
              <div className="mb-2 text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Status
              </div>
              <div className="flex flex-wrap gap-1.5" data-testid="lead-drawer-status-switcher">
                {KANBAN_COLUMNS.map((col) => {
                  const Icon = col.icon;
                  const active = col.id === lead.status;
                  return (
                    <button
                      key={col.id}
                      onClick={() => updateStatus(col.id)}
                      disabled={savingStatus}
                      data-testid={`lead-drawer-status-${col.id}`}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active ? "border-transparent text-white shadow-sm" : "bg-white hover:opacity-80"
                      }`}
                      style={
                        active
                          ? { backgroundColor: col.color }
                          : { borderColor: col.color, color: col.color }
                      }
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scoring */}
            <section className="mt-5 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
                <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                  Engajamento
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="serif text-3xl font-bold" style={{ color: "var(--torres-ink)" }}>
                  {lead.lead_score}
                </span>
                <span className="text-sm" style={{ color: "var(--torres-muted)" }}>
                  / 150 · {temp.text}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--torres-line)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (lead.lead_score / 150) * 100)}%`,
                    backgroundColor: temp.dot,
                  }}
                />
              </div>
            </section>

            {/* Journey */}
            <section className="mt-4 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4" data-testid="lead-drawer-journey">
              <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                Jornada explorada
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(lead.modulos_visitados || []).length === 0 && (
                  <span className="text-xs italic" style={{ color: "var(--torres-muted)" }}>
                    Nenhum módulo concluído ainda.
                  </span>
                )}
                {(lead.modulos_visitados || []).map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700"
                  >
                    {MODULO_LABEL[m] || m}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <InfoItem
                  icon={<HomeIcon className="h-3.5 w-3.5" />}
                  label="Casa preferida"
                  value={lead.casa_preferida ? CASA_LABEL[lead.casa_preferida] || lead.casa_preferida : "—"}
                />
                <InfoItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Tempo na página"
                  value={`${Math.round((lead.tempo_total_segundos || 0) / 60)} min`}
                />
                <InfoItem
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="Atend. imediato"
                  value={lead.solicita_atendimento_imediato ? "Sim" : "Não"}
                />
                <InfoItem
                  icon={<Calendar className="h-3.5 w-3.5" />}
                  label="Agendamento"
                  value={
                    lead.agendamento
                      ? `${lead.agendamento.data} ${lead.agendamento.horario} · ${lead.agendamento.formato}`
                      : "—"
                  }
                />
              </div>
            </section>

            {/* Quiz answers */}
            {lead.quiz_answers?.length > 0 && (
              <section className="mt-4 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4" data-testid="lead-drawer-quiz">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
                  <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                    Quiz ({lead.quiz_answers.length} respostas)
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1.5 text-[12px] sm:grid-cols-2">
                  {lead.quiz_answers.map((a) => (
                    <div
                      key={a.question_id}
                      className="rounded-lg border border-[color:var(--torres-line)] px-2.5 py-1.5"
                    >
                      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                        {a.question_id}
                      </div>
                      <div style={{ color: "var(--torres-ink)" }}>{a.answer}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Simulation */}
            {sim?.renda_bruta > 0 && (
              <section className="mt-4 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4" data-testid="lead-drawer-simulacao">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
                  <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                    Simulação financeira
                  </div>
                  {sim.aprovado === true && (
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      PRÉ-QUALIFICADO
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <InfoItem label="Unidade" value={`Casa ${sim.unidade_numero ?? "—"}`} />
                  <InfoItem label="Renda" value={formatBRL(sim.renda_bruta)} />
                  <InfoItem label="Entrada" value={formatBRL(sim.entrada)} />
                  <InfoItem label="FGTS" value={formatBRL(sim.fgts)} />
                  <InfoItem label="Prazo" value={`${sim.prazo_meses} meses`} />
                  <InfoItem label="Faixa" value={sim.faixa_mcmv || "—"} />
                  <InfoItem label="Parcela" value={formatBRL(sim.parcela_estimada)} />
                  <InfoItem label="Financiado" value={formatBRL(sim.valor_financiado)} />
                </div>
              </section>
            )}

            {/* Admin notes */}
            <section className="mt-4 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4">
              <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                Anotações do corretor
              </div>
              <div className="mt-3 space-y-2" data-testid="lead-drawer-notes-list">
                {(lead.admin_notes || []).length === 0 && (
                  <div className="text-xs italic" style={{ color: "var(--torres-muted)" }}>
                    Nenhuma anotação ainda.
                  </div>
                )}
                {(lead.admin_notes || []).map((n, idx) => (
                  <div key={idx} className="rounded-xl border border-[color:var(--torres-line)] bg-[color:var(--torres-cream)] p-3">
                    <div className="text-sm" style={{ color: "var(--torres-ink)" }}>
                      {n.text}
                    </div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                      {n.author} · {formatDate(n.created_at)}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={addNote} className="mt-3 flex items-start gap-2" data-testid="lead-drawer-note-form">
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Adicionar anotação…"
                  data-testid="lead-drawer-note-input"
                  className="flex-1 resize-none rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2 text-sm outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim() || savingNote}
                  data-testid="lead-drawer-note-submit"
                  className="btn-primary-torres inline-flex items-center gap-1.5 px-4 py-2.5 text-xs disabled:opacity-50"
                >
                  {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Salvar
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-[color:var(--torres-line)] px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold" style={{ color: "var(--torres-ink)" }}>
        {value}
      </div>
    </div>
  );
}
