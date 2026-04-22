import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAdmin } from "./AdminContext";
import { KANBAN_COLUMNS } from "./constants";
import MetricsHeader from "./MetricsHeader";
import KanbanBoard from "./KanbanBoard";
import LeadDetailDrawer from "./LeadDetailDrawer";
import { Loader2 } from "lucide-react";

const POLL_INTERVAL_MS = 30_000; // re-fetch leads every 30s

export default function AdminDashboard() {
  const { axiosAdmin, logout } = useAdmin();
  const [leads, setLeads] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTemp, setFilterTemp] = useState("");
  const [openLeadId, setOpenLeadId] = useState(null);

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
      <KanbanBoard
        columns={KANBAN_COLUMNS}
        leadsByStatus={leadsByStatus}
        onOpenLead={(l) => setOpenLeadId(l.id)}
        onStatusChange={handleStatusChange}
        search={search}
        setSearch={setSearch}
        filterTemp={filterTemp}
        setFilterTemp={setFilterTemp}
      />
      {openLeadId && (
        <LeadDetailDrawer
          leadId={openLeadId}
          onClose={() => setOpenLeadId(null)}
          onStatusChanged={(id, next) => {
            setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: next } : l)));
            axiosAdmin.get("/admin/metrics").then((r) => setMetrics(r.data)).catch(() => {});
          }}
        />
      )}
    </div>
  );
}
