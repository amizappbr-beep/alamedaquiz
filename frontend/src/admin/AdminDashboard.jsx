import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "./AdminContext";
import { KANBAN_COLUMNS } from "./constants";
import MetricsHeader from "./MetricsHeader";
import KanbanBoard from "./KanbanBoard";
import LeadDetailDrawer from "./LeadDetailDrawer";
import WarehouseView from "./WarehouseView";
import BrokersView from "./BrokersView";
import { Loader2, LayoutDashboard, Bell, Users } from "lucide-react";

const POLL_INTERVAL_MS = 30_000; // re-fetch leads every 30s

export default function AdminDashboard() {
  const { axiosAdmin, logout } = useAdmin();
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTemp, setFilterTemp] = useState("");
  const [openLeadId, setOpenLeadId] = useState(null);
  const [view, setView] = useState("pipeline"); // 'pipeline' | 'warehouse' | 'brokers'
  const [brokers, setBrokers] = useState([]);

  const fetchBrokers = useCallback(async () => {
    try {
      const { data } = await axiosAdmin.get("/admin/brokers");
      setBrokers(data);
    } catch {
      /* handled by interceptor */
    }
  }, [axiosAdmin]);

  useEffect(() => {
    fetchBrokers();
  }, [fetchBrokers]);

  const fetchAll = useCallback(
    async (withLoading = false) => {
      if (withLoading) setLoading(true);
      try {
        const params = {};
        if (filterTemp) params.temperatura = filterTemp;
        if (search.trim()) params.q = search.trim();
        const [leadsRes, metricsRes] = await Promise.all([
          axiosAdmin.get("/admin/leads", { params }),
          axiosAdmin.get("/admin/metrics"),
        ]);
        setLeads(leadsRes.data);
        setMetrics(metricsRes.data);
      } catch {
        // AdminContext interceptor handles 401 globally
      } finally {
        if (withLoading) setLoading(false);
      }
    },
    [axiosAdmin, filterTemp, search]
  );

  useEffect(() => {
    fetchAll(true);
  }, [fetchAll]);

  // Auto-refresh for new hot leads (background poll)
  useEffect(() => {
    const id = setInterval(() => fetchAll(false), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  const leadsByStatus = useMemo(() => {
    const map = {};
    for (const col of KANBAN_COLUMNS) map[col.id] = [];
    for (const lead of leads) {
      const st = lead.status || "novo";
      if (map[st]) map[st].push(lead);
      else map.novo.push(lead);
    }
    return map;
  }, [leads]);

  const hotLeadsCount = useMemo(
    () => leads.filter((l) => (l.temperatura === "quente" || l.lead_score >= 90) && (l.status || "novo") === "novo").length,
    [leads]
  );

  const handleStatusChange = useCallback(
    async (leadId, next) => {
      // optimistic
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: next } : l)));
      try {
        await axiosAdmin.patch(`/admin/leads/${leadId}/status`, { status: next });
        // Refresh metrics to update kanban counts
        const { data } = await axiosAdmin.get("/admin/metrics");
        setMetrics(data);
      } catch {
        // revert by refetch
        fetchAll(false);
      }
    },
    [axiosAdmin, fetchAll]
  );

  if (loading) {
    return (
      <div
        data-testid="admin-dashboard-loading"
        className="flex min-h-screen items-center justify-center bg-[color:var(--torres-cream)]"
      >
        <Loader2 className="h-6 w-6 animate-spin text-[color:var(--torres-indigo)]" />
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[color:var(--torres-cream)]">
      <MetricsHeader
        metrics={metrics}
        onLogout={logout}
        onRefresh={() => fetchAll(true)}
        hotLeadsCount={hotLeadsCount}
        notifyHot
      />

      {/* Tabs de navegação */}
      <div className="border-b border-[color:var(--torres-line)] bg-white">
        <div className="mx-auto flex max-w-[1600px] gap-1 px-6 sm:px-10" data-testid="admin-tabs">
          <TabButton
            active={view === "pipeline"}
            onClick={() => setView("pipeline")}
            testid="admin-tab-pipeline"
            icon={<LayoutDashboard className="h-3.5 w-3.5" />}
          >
            Pipeline
            <span className="ml-1.5 rounded-full bg-[color:var(--torres-line)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums" style={{ color: "var(--torres-muted)" }}>
              {metrics?.total ?? "—"}
            </span>
          </TabButton>
          <TabButton
            active={view === "warehouse"}
            onClick={() => setView("warehouse")}
            testid="admin-tab-warehouse"
            icon={<Bell className="h-3.5 w-3.5" />}
          >
            Lead Warehouse
            <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-emerald-700">
              {metrics?.em_nutricao ?? 0}
            </span>
          </TabButton>
          <TabButton
            active={view === "brokers"}
            onClick={() => setView("brokers")}
            testid="admin-tab-brokers"
            icon={<Users className="h-3.5 w-3.5" />}
          >
            Corretores
            <span className="ml-1.5 rounded-full bg-[color:var(--torres-line)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums" style={{ color: "var(--torres-muted)" }}>
              {metrics?.brokers_ativos ?? brokers.length}
            </span>
          </TabButton>
        </div>
      </div>

      {view === "pipeline" ? (
        <KanbanBoard
          columns={KANBAN_COLUMNS}
          leadsByStatus={leadsByStatus}
          onOpenLead={(l) => setOpenLeadId(l.id)}
          onStatusChange={handleStatusChange}
          search={search}
          setSearch={setSearch}
          filterTemp={filterTemp}
          setFilterTemp={setFilterTemp}
          brokers={brokers}
        />
      ) : view === "warehouse" ? (
        <WarehouseView />
      ) : (
        <BrokersView />
      )}

      {openLeadId && (
        <LeadDetailDrawer
          leadId={openLeadId}
          brokers={brokers}
          onClose={() => setOpenLeadId(null)}
          onStatusChanged={(id, next) => {
            setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
            axiosAdmin.get("/admin/metrics").then((r) => setMetrics(r.data)).catch(() => {});
          }}
          onOwnerChanged={(id, ownerId, ownerName) => {
            setLeads((prev) =>
              prev.map((l) =>
                l.id === id
                  ? { ...l, owner_broker_id: ownerId, owner_broker_name: ownerName }
                  : l
              )
            );
            // Brokers counts changed — refetch
            fetchBrokers();
          }}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, children, testid, icon }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
        active ? "text-[color:var(--torres-ink)]" : "text-[color:var(--torres-muted)] hover:text-[color:var(--torres-ink)]"
      }`}
    >
      {icon}
      {children}
      {active && (
        <span
          className="absolute inset-x-2 bottom-0 h-[2px] rounded-t-full"
          style={{ backgroundColor: "var(--torres-indigo)" }}
        />
      )}
    </button>
  );
}
