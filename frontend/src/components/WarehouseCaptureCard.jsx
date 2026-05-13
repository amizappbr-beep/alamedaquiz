import React, { useState } from "react";
import { useJourney } from "../context/JourneyContext";
import { toast } from "sonner";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FAIXAS = [
  { id: "300k", label: "Até R$ 300 mil" },
  { id: "350k", label: "R$ 350 mil" },
  { id: "400k", label: "R$ 400 mil" },
  { id: "450k", label: "R$ 450 mil" },
  { id: "500k", label: "R$ 500 mil ou mais" },
];

const MOMENTOS = [
  { id: "0-3m", label: "Nos próximos 3 meses" },
  { id: "3-6m", label: "Em 3 a 6 meses" },
  { id: "6-12m", label: "Daqui 6 a 12 meses" },
  { id: "12m+", label: "Mais de 1 ano" },
  { id: "sem_pressa", label: "Sem pressa, só de olho" },
];

const TIPOS = [
  { id: "casa", label: "Casa" },
  { id: "apartamento", label: "Apartamento" },
  { id: "qualquer", label: "Tanto faz" },
];

const REGIOES = [
  { id: "serra", label: "Serra" },
  { id: "vitoria", label: "Vitória" },
  { id: "vila_velha", label: "Vila Velha" },
  { id: "qualquer", label: "Qualquer" },
];

/**
 * Card "Me avise quando lançar..." — captura sinais de nutrição que
 * alimentarão o Lead Warehouse multi-empreendimento da Torres.
 *
 * Uso esperado em 2 pontos: rodapé da Capa do Book e tela de Obrigado.
 *
 * @param {"capa"|"obrigado"|"corretor"} source
 * @param {string} title — título principal customizável por contexto
 * @param {string} subtitle — descrição
 * @param {boolean} requireContact — pede nome+telefone se ainda não houver
 */
export default function WarehouseCaptureCard({
  source = "capa",
  title = "Não é o momento certo? Sem problema.",
  subtitle = "Diga o que faz sentido pra você e a Torres te avisa quando lançar algo compatível.",
  requireContact = false,
  defaultOpen = false,
}) {
  const { name: ctxName, phone: ctxPhone } = useJourney();
  const [open, setOpen] = useState(defaultOpen);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [faixas, setFaixas] = useState([]);
  const [momento, setMomento] = useState("");
  const [tipo, setTipo] = useState("");
  const [regiao, setRegiao] = useState("");
  const [observacoes, setObservacoes] = useState("");
  // Quando não temos lead pré-existente (acesso direto à capa, sem Gate),
  // pedimos os dados mínimos.
  const [name, setName] = useState(ctxName || "");
  const [phone, setPhone] = useState(ctxPhone || "");

  const toggleFaixa = (id) =>
    setFaixas((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const canSubmit =
    faixas.length > 0 &&
    momento &&
    (!requireContact || (name.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10));

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // Tenta achar o lead_id do localStorage (criado pelo Gate antigo)
      // se não houver, o backend cria um novo.
      let leadId = null;
      try {
        const raw = localStorage.getItem("alameda500_journey_v1");
        if (raw) {
          const parsed = JSON.parse(raw);
          leadId = parsed?.lead_id || null;
        }
      } catch {
        /* ignore */
      }

      const payload = {
        lead_id: leadId,
        name: (name || ctxName || "").trim() || null,
        phone: (phone || ctxPhone || "").trim() || null,
        nutricao: {
          faixas_interesse: faixas,
          momento_compra: momento,
          tipo_preferido: tipo || null,
          regiao_preferida: regiao || null,
          observacoes: observacoes.trim() || null,
          source,
        },
      };
      const res = await fetch(`${API}/leads/nutricao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Não foi possível salvar.");
      }
      setSent(true);
      toast.success("Pronto! Vamos te avisar quando lançar algo compatível.", {
        description: "Você já está no nosso radar.",
        duration: 4000,
      });
    } catch (err) {
      toast.error(err.message || "Erro ao enviar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div
        data-testid={`warehouse-card-success-${source}`}
        className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 text-center"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check className="h-6 w-6" strokeWidth={2.5} />
        </div>
        <div className="serif mt-3 text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
          Você está no radar da Torres
        </div>
        <p className="mx-auto mt-1 max-w-md text-sm" style={{ color: "var(--torres-muted)" }}>
          Quando aparecer um empreendimento compatível com seu perfil, a gente te
          avisa pelo WhatsApp. Pode ficar tranquilo.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid={`warehouse-card-${source}`}
      className="overflow-hidden rounded-3xl border-2 border-[color:var(--torres-indigo)]/25 bg-gradient-to-br from-[color:var(--torres-indigo)]/8 via-white to-emerald-50/30 shadow-[0_18px_46px_-18px_rgba(100,113,162,0.35)]"
    >
      {/* Header — clicável para abrir o formulário */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        data-testid={`warehouse-card-toggle-${source}`}
        className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-[color:var(--torres-cream)]/40 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-md"
            style={{ backgroundColor: "var(--torres-indigo)", color: "#fff" }}
          >
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700"
                aria-hidden
              >
                <Sparkles className="h-2.5 w-2.5" />
                Acesso antecipado
              </span>
            </div>
            <div className="serif mt-1 text-base font-semibold sm:text-lg" style={{ color: "var(--torres-ink)" }}>
              {title}
            </div>
            <p className="mt-1 text-xs sm:text-sm" style={{ color: "var(--torres-muted)" }}>
              {subtitle}
            </p>
          </div>
        </div>
        <div className="shrink-0" style={{ color: "var(--torres-indigo)" }}>
          {open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {/* Formulário — colapsável */}
      {open && (
        <form
          onSubmit={submit}
          className="space-y-5 border-t border-[color:var(--torres-line)] px-5 py-6 sm:px-6"
          data-testid={`warehouse-form-${source}`}
        >
          {/* Faixas (múltipla) */}
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Qual valor cabe pra você? (pode marcar várias)
            </label>
            <div className="flex flex-wrap gap-2">
              {FAIXAS.map((f) => {
                const active = faixas.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFaixa(f.id)}
                    data-testid={`warehouse-faixa-${f.id}-${source}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-transparent bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]"
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Momento (single) */}
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Quando pretende dar o próximo passo?
            </label>
            <div className="flex flex-wrap gap-2">
              {MOMENTOS.map((m) => {
                const active = momento === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMomento(m.id)}
                    data-testid={`warehouse-momento-${m.id}-${source}`}
                    className={`rounded-full border px-3 py-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-transparent bg-[color:var(--torres-indigo)] text-white"
                        : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]"
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tipo + Região (lado a lado em desktop) */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Tipo de imóvel
              </label>
              <div className="flex flex-wrap gap-2">
                {TIPOS.map((t) => {
                  const active = tipo === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipo(t.id === tipo ? "" : t.id)}
                      data-testid={`warehouse-tipo-${t.id}-${source}`}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "border-transparent bg-[color:var(--torres-indigo)] text-white"
                          : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Região preferida
              </label>
              <div className="flex flex-wrap gap-2">
                {REGIOES.map((r) => {
                  const active = regiao === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRegiao(r.id === regiao ? "" : r.id)}
                      data-testid={`warehouse-regiao-${r.id}-${source}`}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                        active
                          ? "border-transparent bg-[color:var(--torres-indigo)] text-white"
                          : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]"
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Algo importante pra você? (opcional)
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={400}
              placeholder='Ex: "Preciso de quintal grande", "Tô esperando vender meu apto antes", "Só com vaga coberta"'
              data-testid={`warehouse-obs-${source}`}
              className="w-full resize-none rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
            />
          </div>

          {/* Contato — só pede se ainda não temos */}
          {requireContact && (
            <div className="grid grid-cols-1 gap-3 rounded-2xl bg-[color:var(--torres-cream)]/60 p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid={`warehouse-name-${source}`}
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="(27) 99999-9999"
                  data-testid={`warehouse-phone-${source}`}
                  className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            data-testid={`warehouse-submit-${source}`}
            className="btn-primary-torres group inline-flex w-full items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Quero ser avisado(a)
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
