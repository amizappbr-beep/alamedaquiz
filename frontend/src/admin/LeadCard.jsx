import React, { useState } from "react";
import { KANBAN_COLUMNS, TEMP_LABEL, CASA_LABEL, formatRelative } from "./constants";
import { computeSlaStatus, SLA_LABEL } from "./channels";
import BrokerAvatar from "./BrokerAvatar";
import {
  Flame,
  Phone,
  Home as HomeIcon,
  Calculator,
  Calendar,
  Zap,
  Bell,
  MoreVertical,
  AlertTriangle,
  Clock,
} from "lucide-react";

/**
 * A single lead card, draggable + with status dropdown fallback (mobile).
 */
export default function LeadCard({ lead, onOpen, onStatusChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const temp = TEMP_LABEL[lead.temperatura] || TEMP_LABEL.frio;
  const slaState = computeSlaStatus(lead);
  const sla = SLA_LABEL[slaState];
  const ownerBroker = lead.owner_broker_id
    ? { id: lead.owner_broker_id, name: lead.owner_broker_name }
    : null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("text/plain", lead.id);
    e.dataTransfer.effectAllowed = "move";
    // visual cue on drag
    e.currentTarget.classList.add("opacity-40");
  };
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("opacity-40");
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onOpen(lead)}
      data-testid={`lead-card-${lead.id}`}
      className={`group cursor-pointer rounded-2xl border bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-10px_rgba(100,113,162,0.3)] ${
        slaState === "breached"
          ? "border-red-300 hover:border-red-400"
          : slaState === "warn"
          ? "border-amber-300 hover:border-amber-400"
          : "border-[color:var(--torres-line)] hover:border-[color:var(--torres-indigo)]"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: temp.dot }}
              aria-hidden
            />
            <div className="serif truncate text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
              {lead.name || <span className="italic text-[color:var(--torres-muted)]">(sem nome)</span>}
            </div>
          </div>
          {lead.phone && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--torres-muted)" }}>
              <Phone className="h-3 w-3" />
              {lead.phone}
            </div>
          )}
        </div>

        {/* Status menu (mobile-friendly dropdown fallback) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            data-testid={`lead-card-menu-${lead.id}`}
            className="rounded-md p-1 text-[color:var(--torres-muted)] transition-colors hover:bg-[color:var(--torres-line)] hover:text-[color:var(--torres-ink)]"
            aria-label="Mudar status"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div
                className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-[color:var(--torres-line)] bg-white shadow-[0_16px_40px_-16px_rgba(100,113,162,0.4)]"
                onClick={(e) => e.stopPropagation()}
                data-testid={`lead-card-menu-items-${lead.id}`}
              >
                <div className="border-b border-[color:var(--torres-line)] px-3 py-1.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                  Mover para
                </div>
                {KANBAN_COLUMNS.map((col) => {
                  const Icon = col.icon;
                  const active = col.id === (lead.status || "novo");
                  return (
                    <button
                      key={col.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!active) onStatusChange(lead.id, col.id);
                        setMenuOpen(false);
                      }}
                      data-testid={`lead-card-${lead.id}-move-${col.id}`}
                      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        active ? "bg-[color:var(--torres-line)] font-semibold" : "hover:bg-slate-50"
                      }`}
                      style={{ color: col.color }}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* badges row */}
      <div className="mt-2 flex flex-wrap items-center gap-1">
        {lead.lead_score >= 90 && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700" data-testid={`lead-card-${lead.id}-hot`}>
            <Flame className="h-2.5 w-2.5" />
            {lead.lead_score}
          </span>
        )}
        {lead.lead_score < 90 && (
          <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${temp.pill}`}>
            {lead.lead_score}
          </span>
        )}
        {lead.solicita_atendimento_imediato && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
            <Zap className="h-2.5 w-2.5" />
            Imediato
          </span>
        )}
        {lead.agendamento && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
            <Calendar className="h-2.5 w-2.5" />
            Visita
          </span>
        )}
        {lead.casa_preferida && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
            <HomeIcon className="h-2.5 w-2.5" />
            {CASA_LABEL[lead.casa_preferida]?.split(" ")[0]}
          </span>
        )}
        {lead.simulacao?.renda_bruta > 0 && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
            <Calculator className="h-2.5 w-2.5" />
            Simulou
          </span>
        )}
        {lead.nutricao_warehouse && (
          <span
            data-testid={`lead-card-${lead.id}-warehouse`}
            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700"
          >
            <Bell className="h-2.5 w-2.5" />
            Nutrição
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px]" style={{ color: "var(--torres-muted)" }}>
        <div className="flex items-center gap-1.5">
          <BrokerAvatar broker={ownerBroker} size="sm" title={ownerBroker ? `Atribuído a ${ownerBroker.name}` : "Sem dono — disponível no pool"} />
          <span className="truncate" data-testid={`lead-card-${lead.id}-owner`}>
            {ownerBroker ? ownerBroker.name?.split(" ")[0] : "Sem dono"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {slaState !== "ok" && (
            <span
              data-testid={`lead-card-${lead.id}-sla-${slaState}`}
              className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sla.bg}`}
              title={
                slaState === "breached"
                  ? "SLA estourado — contate este lead com prioridade."
                  : "Atenção — SLA próximo do limite."
              }
            >
              {slaState === "breached" ? (
                <AlertTriangle className="h-2.5 w-2.5" />
              ) : (
                <Clock className="h-2.5 w-2.5" />
              )}
              {sla.text}
            </span>
          )}
          <span>{formatRelative(lead.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
