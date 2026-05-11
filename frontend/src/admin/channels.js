// Channel and SLA constants for Release 2 (Sales Channels + Ownership + SLA)

export const CHANNELS = [
  { id: "direto", label: "Direto", color: "#6471a2", bg: "rgba(100,113,162,0.08)" },
  { id: "indicacao", label: "Indicação", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
  { id: "imobiliaria", label: "Imobiliária", color: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
  { id: "campanha", label: "Campanha", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
];

export const CHANNEL_LABEL = CHANNELS.reduce(
  (acc, c) => ({ ...acc, [c.id]: c.label }),
  {}
);

/**
 * Compute SLA status for a lead based on its kanban status + timestamps.
 * Returns: 'ok' | 'warn' | 'breached'
 *
 * Rules:
 * - status='novo' and created_at older than 60min => breached (red)
 *   between 30min and 60min => warn (amber)
 * - status='contatado' and updated_at older than 24h => breached
 *   between 12h and 24h => warn
 * - other statuses => 'ok'
 */
export function computeSlaStatus(lead) {
  if (!lead) return "ok";
  const status = lead.status || "novo";
  const now = Date.now();
  const createdAt = lead.created_at ? new Date(lead.created_at).getTime() : now;
  const updatedAt = lead.updated_at ? new Date(lead.updated_at).getTime() : createdAt;

  if (status === "novo") {
    const diffMin = (now - createdAt) / 60000;
    if (diffMin >= 60) return "breached";
    if (diffMin >= 30) return "warn";
    return "ok";
  }
  if (status === "contatado") {
    const diffH = (now - updatedAt) / 3600000;
    if (diffH >= 24) return "breached";
    if (diffH >= 12) return "warn";
    return "ok";
  }
  return "ok";
}

export const SLA_LABEL = {
  ok: { text: "No prazo", color: "#059669", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  warn: { text: "Atenção", color: "#d97706", bg: "bg-amber-50 text-amber-800 border-amber-200" },
  breached: { text: "Atrasado", color: "#dc2626", bg: "bg-red-50 text-red-700 border-red-200" },
};

/**
 * Two-letter initials from a broker name (or generic fallback).
 */
export function getInitials(name) {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic color from broker id/name for avatar background.
 */
export function colorFromString(s) {
  if (!s) return "#94a3b8";
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  const palette = [
    "#6471a2", "#0ea5e9", "#8b5cf6", "#059669",
    "#d97706", "#dc2626", "#0891b2", "#7c3aed",
  ];
  return palette[Math.abs(hash) % palette.length];
}
