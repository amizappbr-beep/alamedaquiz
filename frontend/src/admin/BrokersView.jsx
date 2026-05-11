import React, { useCallback, useEffect, useState } from "react";
import { useAdmin } from "./AdminContext";
import { CHANNELS } from "./channels";
import BrokerAvatar from "./BrokerAvatar";
import {
  Users,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  Phone,
  Mail,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Brokers (Corretores) management — Release 2 of the Torres CRM.
 * - List with leads_count (round-robin weighting)
 * - Create new broker (name, phone, email, channel)
 * - Toggle active/inactive
 * - Delete (unassigns leads automatically server-side)
 */
export default function BrokersView() {
  const { axiosAdmin } = useAdmin();
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const fetchBrokers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosAdmin.get("/admin/brokers");
      setBrokers(data);
    } finally {
      setLoading(false);
    }
  }, [axiosAdmin]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const handleToggleActive = async (broker) => {
    try {
      const { data } = await axiosAdmin.patch(`/admin/brokers/${broker.id}`, {
        active: !broker.active,
      });
      setBrokers((prev) => prev.map((b) => (b.id === broker.id ? data : b)));
      toast.success(
        data.active
          ? `${broker.name} reativado.`
          : `${broker.name} desativado — não receberá novos leads.`
      );
    } catch {
      toast.error("Falha ao atualizar corretor.");
    }
  };

  const handleDelete = async (broker) => {
    if (
      !window.confirm(
        `Remover ${broker.name}?\nLeads atribuídos a esse corretor ficarão sem dono.`
      )
    )
      return;
    try {
      await axiosAdmin.delete(`/admin/brokers/${broker.id}`);
      setBrokers((prev) => prev.filter((b) => b.id !== broker.id));
      toast.success(`${broker.name} removido.`);
    } catch {
      toast.error("Falha ao remover.");
    }
  };

  const totalAtivos = brokers.filter((b) => b.active).length;
  const totalLeads = brokers.reduce((acc, b) => acc + (b.leads_count || 0), 0);

  return (
    <div
      data-testid="brokers-view"
      className="mx-auto max-w-[1600px] px-6 pb-12 pt-6 sm:px-10"
    >
      {/* Toolbar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div
            className="text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--torres-muted)" }}
          >
            Equipe comercial · Canais de venda
          </div>
          <h2
            className="serif text-xl font-semibold"
            style={{ color: "var(--torres-ink)" }}
          >
            Corretores ({totalAtivos} ativos · {totalLeads} leads atribuídos)
          </h2>
        </div>
        <button
          onClick={() => setFormOpen(true)}
          data-testid="brokers-new-btn"
          className="btn-primary-torres inline-flex items-center gap-2 px-5 py-2.5 text-xs"
        >
          <Plus className="h-4 w-4" />
          Novo corretor
        </button>
      </div>

      {/* Round-robin explainer */}
      <div
        className="mb-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4 text-xs"
        style={{ color: "var(--torres-ink)" }}
      >
        <strong className="text-emerald-700">Distribuição automática:</strong>{" "}
        leads com perfil compatível (score ≥ 90) ou que pedem atendimento
        imediato são distribuídos por round-robin entre os corretores ativos.
        Quem tem menos leads recebe o próximo.
      </div>

      {/* Brokers list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[color:var(--torres-indigo)]" />
        </div>
      ) : brokers.length === 0 ? (
        <EmptyState onCreate={() => setFormOpen(true)} />
      ) : (
        <div
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          data-testid="brokers-list"
        >
          {brokers.map((broker) => (
            <BrokerCard
              key={broker.id}
              broker={broker}
              onToggle={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <BrokerForm
          onClose={() => setFormOpen(false)}
          onCreated={(b) => {
            setBrokers((prev) => [...prev, b]);
            setFormOpen(false);
            toast.success(`${b.name} adicionado à equipe.`);
          }}
          creating={creating}
          setCreating={setCreating}
        />
      )}
    </div>
  );
}

function BrokerCard({ broker, onToggle, onDelete }) {
  const channel = CHANNELS.find((c) => c.id === broker.channel) || CHANNELS[0];
  return (
    <div
      data-testid={`broker-card-${broker.id}`}
      className={`rounded-2xl border bg-white p-4 transition-all ${
        broker.active
          ? "border-[color:var(--torres-line)]"
          : "border-dashed border-slate-300 opacity-70"
      }`}
    >
      <div className="flex items-start gap-3">
        <BrokerAvatar broker={broker} size="lg" />
        <div className="min-w-0 flex-1">
          <div
            className="serif truncate text-sm font-semibold"
            style={{ color: "var(--torres-ink)" }}
          >
            {broker.name}
          </div>
          <span
            className="mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: channel.bg, color: channel.color }}
          >
            {channel.label}
          </span>
        </div>
        <div className="text-right">
          <div
            className="serif text-2xl font-bold tabular-nums"
            style={{ color: "var(--torres-ink)" }}
            data-testid={`broker-leads-count-${broker.id}`}
          >
            {broker.leads_count || 0}
          </div>
          <div
            className="text-[9px] uppercase tracking-wider"
            style={{ color: "var(--torres-muted)" }}
          >
            leads
          </div>
        </div>
      </div>

      <div className="mt-3 space-y-1 text-xs" style={{ color: "var(--torres-muted)" }}>
        {broker.phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            {broker.phone}
          </div>
        )}
        {broker.email && (
          <div className="flex items-center gap-1.5 truncate">
            <Mail className="h-3 w-3 shrink-0" />
            <span className="truncate">{broker.email}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => onToggle(broker)}
          data-testid={`broker-toggle-${broker.id}`}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
            broker.active
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          }`}
        >
          {broker.active ? (
            <>
              <PowerOff className="h-3 w-3" />
              Pausar
            </>
          ) : (
            <>
              <Power className="h-3 w-3" />
              Reativar
            </>
          )}
        </button>
        <button
          onClick={() => onDelete(broker)}
          data-testid={`broker-delete-${broker.id}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
          Remover
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div
      data-testid="brokers-empty"
      className="rounded-3xl border border-dashed border-[color:var(--torres-line)] bg-white p-12 text-center"
    >
      <Users
        className="mx-auto h-10 w-10"
        style={{ color: "var(--torres-muted)" }}
      />
      <h3
        className="serif mt-3 text-lg font-semibold"
        style={{ color: "var(--torres-ink)" }}
      >
        Cadastre os corretores da Torres
      </h3>
      <p
        className="mx-auto mt-2 max-w-md text-sm"
        style={{ color: "var(--torres-muted)" }}
      >
        A partir do primeiro corretor cadastrado, os leads quentes que chegarem
        serão distribuídos automaticamente por round-robin. Sem corretores
        cadastrados, todos os leads ficam no pool comum para retirada manual.
      </p>
      <button
        onClick={onCreate}
        data-testid="brokers-empty-cta"
        className="btn-primary-torres mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-xs"
      >
        <Plus className="h-4 w-4" />
        Adicionar corretor
      </button>
    </div>
  );
}

function BrokerForm({ onClose, onCreated, creating, setCreating }) {
  const { axiosAdmin } = useAdmin();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [channel, setChannel] = useState("direto");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const { data } = await axiosAdmin.post("/admin/brokers", {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        channel,
      });
      onCreated(data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Falha ao criar corretor.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        data-testid="brokers-form-overlay"
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 shadow-2xl"
        data-testid="brokers-form"
      >
        <div className="flex items-center justify-between">
          <h3
            className="serif text-lg font-semibold"
            style={{ color: "var(--torres-ink)" }}
          >
            Novo corretor
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--torres-line)] text-[color:var(--torres-muted)] hover:border-[color:var(--torres-indigo)] hover:text-[color:var(--torres-indigo)]"
            data-testid="brokers-form-close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Nome*">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex.: Ana Silva"
              data-testid="brokers-form-name"
              className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(27) 99999-9999"
                data-testid="brokers-form-phone"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@torres.com.br"
                data-testid="brokers-form-email"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15"
              />
            </Field>
          </div>
          <Field label="Canal de origem">
            <div className="flex flex-wrap gap-2" data-testid="brokers-form-channel">
              {CHANNELS.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  data-testid={`brokers-form-channel-${c.id}`}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all ${
                    channel === c.id
                      ? "border-transparent text-white shadow-sm"
                      : "bg-white hover:bg-slate-50"
                  }`}
                  style={
                    channel === c.id
                      ? { backgroundColor: c.color }
                      : { borderColor: c.color, color: c.color }
                  }
                >
                  {channel === c.id && <Check className="h-3 w-3" />}
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[color:var(--torres-line)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--torres-ink)] hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || !name.trim()}
              data-testid="brokers-form-submit"
              className="btn-primary-torres inline-flex items-center gap-2 px-5 py-2 text-xs disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span
        className="mb-1 block text-[10px] uppercase tracking-[0.22em]"
        style={{ color: "var(--torres-muted)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
