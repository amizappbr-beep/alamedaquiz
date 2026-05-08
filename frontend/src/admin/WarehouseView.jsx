import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "./AdminContext";
import LeadDetailDrawer from "./LeadDetailDrawer";
import { TEMP_LABEL, formatRelative } from "./constants";
import {
  Bell,
  Sparkles,
  Filter,
  X as XIcon,
  Phone,
  Loader2,
  Target,
  TrendingUp,
} from "lucide-react";

const FAIXA_ITEMS = [
  { id: "300k", label: "R$ 300 mil", short: "300k", color: "#0ea5e9" },
  { id: "350k", label: "R$ 350 mil", short: "350k", color: "#6471a2" },
  { id: "400k", label: "R$ 400 mil", short: "400k", color: "#8b5cf6" },
  { id: "450k", label: "R$ 450 mil", short: "450k", color: "#d97706" },
  { id: "500k", label: "R$ 500 mil+", short: "500k", color: "#059669" },
];

const MOMENTO_ITEMS = [
  { id: "0-3m", label: "0-3 meses" },
  { id: "3-6m", label: "3-6 meses" },
  { id: "6-12m", label: "6-12 meses" },
  { id: "12m+", label: "12m+" },
  { id: "sem_pressa", label: "Sem pressa" },
];

const REGIAO_ITEMS = [
  { id: "serra", label: "Serra" },
  { id: "vitoria", label: "Vitória" },
  { id: "vila_velha", label: "Vila Velha" },
  { id: "qualquer", label: "Qualquer" },
];

const TIPO_ITEMS = [
  { id: "casa", label: "Casa" },
  { id: "apartamento", label: "Apartamento" },
  { id: "qualquer", label: "Tanto faz" },
];

export default function WarehouseView() {
  const { axiosAdmin } = useAdmin();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openLeadId, setOpenLeadId] = useState(null);

  const [faixa, setFaixa] = useState("");
  const [momento, setMomento] = useState("");
  const [regiao, setRegiao] = useState("");
  const [tipo, setTipo] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (faixa) params.faixa = faixa;
      if (momento) params.momento = momento;
      if (regiao) params.regiao = regiao;
      if (tipo) params.tipo = tipo;
      const { data } = await axiosAdmin.get("/admin/warehouse", { params });
      setData(data);
    } finally {
      setLoading(false);
    }
  }, [axiosAdmin, faixa, momento, regiao, tipo]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const totalAll = useMemo(() => {
    if (!data?.by_faixa) return 0;
    return Object.values(data.by_faixa).reduce((a, b) => a + b, 0);
  }, [data]);

  const hasFilters = faixa || momento || regiao || tipo;

  const clearFilters = () => {
    setFaixa("");
    setMomento("");
    setRegiao("");
    setTipo("");
  };

  return (
    <div data-testid="warehouse-view" className="mx-auto max-w-[1600px] px-6 py-8 sm:px-10">
      {/* Hero */}
      <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-6 sm:p-8" data-testid="warehouse-hero">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Lead Warehouse · Torres Engenharia
              </div>
              <h1 className="serif text-2xl font-semibold sm:text-3xl" style={{ color: "var(--torres-ink)" }}>
                {totalAll} {totalAll === 1 ? "lead em nutrição" : "leads em nutrição"}
              </h1>
              <p className="mt-1 max-w-xl text-sm" style={{ color: "var(--torres-muted)" }}>
                Pessoas que disseram "me avise quando lançar algo compatível". Use os filtros pra
                fazer match com um próximo lançamento e disparar campanhas segmentadas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de faixa — match automático visual */}
      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
          <h2 className="serif text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
            Match por faixa de interesse
          </h2>
          {momento || regiao || tipo ? (
            <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
              <Filter className="h-2.5 w-2.5" />
              Filtros ativos
            </span>
          ) : null}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" data-testid="warehouse-faixa-grid">
          {FAIXA_ITEMS.map((f) => {
            const count = data?.by_faixa?.[f.id] ?? 0;
            const active = faixa === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFaixa(active ? "" : f.id)}
                data-testid={`warehouse-faixa-card-${f.id}`}
                className={`group rounded-2xl border bg-white p-4 text-left transition-all hover:-translate-y-0.5 ${
                  active
                    ? "border-transparent shadow-[0_12px_30px_-12px_rgba(0,0,0,0.25)] ring-2 ring-offset-2"
                    : "border-[color:var(--torres-line)] hover:border-[color:var(--torres-indigo)]"
                }`}
                style={active ? { ringColor: f.color } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: f.color }}
                  >
                    {f.short}
                  </span>
                  <Sparkles className="h-3.5 w-3.5" style={{ color: f.color }} />
                </div>
                <div className="mt-3 serif text-3xl font-bold tabular-nums" style={{ color: "var(--torres-ink)" }}>
                  {count}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
                  {count === 1 ? "lead" : "leads"} esperando
                </div>
                <div className="mt-1 text-[12px]" style={{ color: "var(--torres-ink)" }}>
                  {f.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtros adicionais */}
      <div className="mt-6 rounded-2xl border border-[color:var(--torres-line)] bg-white p-4 sm:p-5" data-testid="warehouse-filters">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
            <span className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
              Refinar match
            </span>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              data-testid="warehouse-clear-filters"
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider hover:underline"
              style={{ color: "var(--torres-muted)" }}
            >
              <XIcon className="h-3 w-3" />
              Limpar tudo
            </button>
          )}
        </div>

        <div className="space-y-3">
          <FilterRow label="Momento de compra" testid="warehouse-filter-momento">
            {MOMENTO_ITEMS.map((m) => (
              <Pill key={m.id} active={momento === m.id} onClick={() => setMomento(momento === m.id ? "" : m.id)} testid={`warehouse-momento-${m.id}`}>
                {m.label}
                {data?.by_momento?.[m.id] ? <span className="ml-1 opacity-70">({data.by_momento[m.id]})</span> : null}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="Região preferida" testid="warehouse-filter-regiao">
            {REGIAO_ITEMS.map((r) => (
              <Pill key={r.id} active={regiao === r.id} onClick={() => setRegiao(regiao === r.id ? "" : r.id)} testid={`warehouse-regiao-${r.id}`}>
                {r.label}
                {data?.by_regiao?.[r.id] ? <span className="ml-1 opacity-70">({data.by_regiao[r.id]})</span> : null}
              </Pill>
            ))}
          </FilterRow>
          <FilterRow label="Tipo de imóvel" testid="warehouse-filter-tipo">
            {TIPO_ITEMS.map((t) => (
              <Pill key={t.id} active={tipo === t.id} onClick={() => setTipo(tipo === t.id ? "" : t.id)} testid={`warehouse-tipo-${t.id}`}>
                {t.label}
              </Pill>
            ))}
          </FilterRow>
        </div>
      </div>

      {/* Resultado */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" style={{ color: "var(--torres-indigo)" }} />
            <h2 className="serif text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
              {data?.total ?? 0} {data?.total === 1 ? "lead compatível" : "leads compatíveis"}
            </h2>
            {hasFilters && (
              <span className="text-xs" style={{ color: "var(--torres-muted)" }}>
                · com os filtros atuais
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[color:var(--torres-indigo)]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="warehouse-leads-list">
            {(data?.leads || []).length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-[color:var(--torres-line)] py-12 text-center text-sm" style={{ color: "var(--torres-muted)" }}>
                Nenhum lead com esse perfil ainda.
              </div>
            )}
            {(data?.leads || []).map((lead) => (
              <WarehouseLeadCard
                key={lead.id}
                lead={lead}
                onOpen={() => setOpenLeadId(lead.id)}
              />
            ))}
          </div>
        )}
      </div>

      {openLeadId && (
        <LeadDetailDrawer
          leadId={openLeadId}
          onClose={() => setOpenLeadId(null)}
          onStatusChanged={() => fetchAll()}
        />
      )}
    </div>
  );
}

function FilterRow({ label, testid, children }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center" data-testid={testid}>
      <div className="w-32 shrink-0 text-[10px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
        active
          ? "border-transparent bg-[color:var(--torres-indigo)] text-white"
          : "border-[color:var(--torres-line)] bg-white text-[color:var(--torres-ink)] hover:border-[color:var(--torres-indigo)]"
      }`}
    >
      {children}
    </button>
  );
}

function WarehouseLeadCard({ lead, onOpen }) {
  const temp = TEMP_LABEL[lead.temperatura] || TEMP_LABEL.frio;
  const nut = lead.nutricao_warehouse || {};
  return (
    <button
      onClick={onOpen}
      data-testid={`warehouse-lead-${lead.id}`}
      className="group rounded-2xl border border-[color:var(--torres-line)] bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_8px_24px_-10px_rgba(5,150,105,0.3)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: temp.dot }} />
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
      </div>

      <div className="mt-3 space-y-1.5">
        {nut.faixas_interesse?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {nut.faixas_interesse.map((f) => (
              <span key={f} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                {f}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]" style={{ color: "var(--torres-muted)" }}>
          {nut.momento_compra && <span>⏱ {nut.momento_compra}</span>}
          {nut.tipo_preferido && <span>🏠 {nut.tipo_preferido}</span>}
          {nut.regiao_preferida && <span>📍 {nut.regiao_preferida}</span>}
        </div>
        {nut.observacoes && (
          <div className="line-clamp-2 rounded-lg bg-[color:var(--torres-cream)] px-2 py-1 text-[11px] italic" style={{ color: "var(--torres-ink)" }}>
            "{nut.observacoes}"
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px]" style={{ color: "var(--torres-muted)" }}>
        <span>Score {lead.lead_score}/150</span>
        <span>{formatRelative(nut.captured_at || lead.created_at)}</span>
      </div>
    </button>
  );
}
