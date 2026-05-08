import React, { useEffect, useRef } from "react";
import { KANBAN_COLUMNS } from "./constants";

/**
 * Play a short discreet sound when a hot lead arrives.
 * Generated via WebAudio (no asset needed).
 */
function playHotLeadChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    const notes = [880, 1174.66]; // A5, D6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.14);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.14 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.14);
      osc.stop(now + i * 0.14 + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch {
    // silent fallback
  }
}

export default function MetricsHeader({ metrics, onLogout, onRefresh, hotLeadsCount, notifyHot }) {
  const prevHotRef = useRef(hotLeadsCount);

  // chime + flash when hot leads count increases
  useEffect(() => {
    if (!notifyHot) {
      prevHotRef.current = hotLeadsCount;
      return;
    }
    if (hotLeadsCount > prevHotRef.current && prevHotRef.current >= 0) {
      playHotLeadChime();
    }
    prevHotRef.current = hotLeadsCount;
  }, [hotLeadsCount, notifyHot]);

  const kanban = metrics?.kanban || {};
  const temp = metrics?.temperatura || {};

  return (
    <div className="border-b border-[color:var(--torres-line)] bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-5 sm:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
              Torres Engenharia · Painel
            </div>
            <h1 className="serif text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
              Leads do Alameda 500
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              data-testid="admin-refresh-btn"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-4 py-2 text-xs font-semibold transition-colors hover:border-[color:var(--torres-indigo)]"
              style={{ color: "var(--torres-ink)" }}
            >
              Atualizar
            </button>
            <button
              onClick={onLogout}
              data-testid="admin-logout-btn"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-4 py-2 text-xs font-semibold transition-colors hover:border-red-300 hover:text-red-600"
              style={{ color: "var(--torres-ink)" }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Metric tiles */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8" data-testid="admin-metrics">
          <Tile label="Total" value={metrics?.total ?? "—"} />
          <Tile label="Últimos 7d" value={metrics?.ultimos_7d ?? "—"} />
          <Tile
            label="Perfil compatível"
            value={temp.quente ?? 0}
            color="#059669"
            pulse={hotLeadsCount > 0}
            testid="admin-metric-hot"
          />
          <Tile label="Em análise" value={temp.morno ?? 0} color="#d97706" />
          <Tile label="Explorando" value={temp.frio ?? 0} color="#64748b" />
          <Tile label="Agendados" value={metrics?.agendamentos ?? 0} />
          <Tile label="Simularam" value={metrics?.com_simulacao ?? 0} />
          <Tile
            label="Em nutrição"
            value={metrics?.em_nutricao ?? 0}
            color="#059669"
            testid="admin-metric-warehouse"
          />
          <Tile
            label="Score médio"
            value={metrics?.score_medio ?? "—"}
            suffix={metrics?.score_medio ? "/150" : ""}
          />
        </div>

        {/* Kanban distribution inline */}
        <div className="mt-4 flex flex-wrap gap-2" data-testid="admin-kanban-distribution">
          {KANBAN_COLUMNS.map((col) => {
            const Icon = col.icon;
            const count = kanban[col.id] || 0;
            return (
              <span
                key={col.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--torres-line)] bg-white px-2.5 py-1 text-[11px] font-semibold"
                style={{ color: col.color }}
              >
                <Icon className="h-3 w-3" />
                {col.label}
                <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={{ backgroundColor: col.bg }}>
                  {count}
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, suffix, color, pulse, testid }) {
  return (
    <div
      data-testid={testid}
      className={`rounded-2xl border border-[color:var(--torres-line)] bg-white p-3 ${pulse ? "ring-2 ring-emerald-400 hot-pulse" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
        {label}
      </div>
      <div
        className="serif mt-0.5 text-xl font-semibold tabular-nums"
        style={{ color: color || "var(--torres-ink)" }}
      >
        {value}
        {suffix && <span className="ml-1 text-xs font-medium" style={{ color: "var(--torres-muted)" }}>{suffix}</span>}
      </div>
    </div>
  );
}
