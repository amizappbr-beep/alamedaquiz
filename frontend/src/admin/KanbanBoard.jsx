import React from "react";
import LeadCard from "./LeadCard";

/**
 * Kanban board (6 columns) with HTML5 drag-and-drop + dropdown fallback.
 */
export default function KanbanBoard({
  columns,
  leadsByStatus,
  onOpenLead,
  onStatusChange,
  search,
  setSearch,
  filterTemp,
  setFilterTemp,
}) {
  return (
    <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-6 sm:px-10" data-testid="admin-kanban-board">
      {/* Filters bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Buscar por nome ou WhatsApp…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="admin-search-input"
            className="w-full min-w-[260px] rounded-full border border-[color:var(--torres-line)] bg-white px-4 py-2 text-sm outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/15 sm:w-auto"
          />
          <div className="flex items-center gap-1" data-testid="admin-temp-filter">
            {[
              { id: "", label: "Todas" },
              { id: "quente", label: "Compatível" },
              { id: "morno", label: "Análise" },
              { id: "frio", label: "Explorando" },
            ].map((t) => (
              <button
                key={t.id || "all"}
                onClick={() => setFilterTemp(t.id)}
                data-testid={`admin-temp-${t.id || "all"}`}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all ${
                  filterTemp === t.id
                    ? "bg-[color:var(--torres-indigo)] text-white"
                    : "bg-white text-[color:var(--torres-ink)] border border-[color:var(--torres-line)] hover:border-[color:var(--torres-indigo)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {columns.map((col) => {
          const items = leadsByStatus[col.id] || [];
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              data-testid={`kanban-col-${col.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                e.currentTarget.classList.add("kanban-col-over");
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove("kanban-col-over")}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove("kanban-col-over");
                const leadId = e.dataTransfer.getData("text/plain");
                if (leadId) onStatusChange(leadId, col.id);
              }}
              className="flex min-h-[300px] flex-col rounded-2xl border border-[color:var(--torres-line)] bg-[color:var(--torres-cream)]/60 p-3 transition-colors"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md"
                    style={{ backgroundColor: col.bg, color: col.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="serif text-sm font-semibold" style={{ color: "var(--torres-ink)" }}>
                    {col.label}
                  </div>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                  style={{ backgroundColor: col.bg, color: col.color }}
                  data-testid={`kanban-col-${col.id}-count`}
                >
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2" data-testid={`kanban-col-${col.id}-items`}>
                {items.length === 0 && (
                  <div
                    className="rounded-xl border border-dashed border-[color:var(--torres-line)] py-8 text-center text-[11px]"
                    style={{ color: "var(--torres-muted)" }}
                  >
                    Arraste um lead aqui
                  </div>
                )}
                {items.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onOpen={onOpenLead}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
