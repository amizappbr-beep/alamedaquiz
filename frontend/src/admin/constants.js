// Constantes compartilhadas do admin
import {
  PlusCircle,
  PhoneCall,
  Calendar,
  Handshake,
  Trophy,
  XCircle,
} from "lucide-react";

export const KANBAN_COLUMNS = [
  {
    id: "novo",
    label: "Novo",
    icon: PlusCircle,
    color: "#6471a2",
    bg: "rgba(100,113,162,0.08)",
  },
  {
    id: "contatado",
    label: "Contatado",
    icon: PhoneCall,
    color: "#0ea5e9",
    bg: "rgba(14,165,233,0.08)",
  },
  {
    id: "agendado",
    label: "Agendado",
    icon: Calendar,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.08)",
  },
  {
    id: "negociacao",
    label: "Em Negociação",
    icon: Handshake,
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
  },
  {
    id: "ganho",
    label: "Ganho",
    icon: Trophy,
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
  },
  {
    id: "perdido",
    label: "Perdido",
    icon: XCircle,
    color: "#737373",
    bg: "rgba(115,115,115,0.08)",
  },
];

export const TEMP_LABEL = {
  quente: { text: "Perfil Compatível", dot: "#059669", pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  morno: { text: "Em Análise", dot: "#d97706", pill: "bg-amber-50 text-amber-800 border-amber-200" },
  frio: { text: "Explorando", dot: "#64748b", pill: "bg-slate-50 text-slate-700 border-slate-200" },
};

export const CASA_LABEL = {
  "1_12": "Premium (1 e 12)",
  "6_7": "Família (6 e 7)",
  "2_a_11": "Essencial (2–11)",
};

export const MODULO_LABEL = {
  empreendimento: "Empreendimento",
  casas: "Casas",
  perfil: "Perfil",
  simulador: "Simulador",
  diferenciais: "Diferenciais",
  localizacao: "Localização",
  corretor: "Corretor",
};

export function formatBRL(v) {
  if (v == null || isNaN(v)) return "—";
  try {
    return `R$ ${Number(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  } catch {
    return `R$ ${Math.round(v)}`;
  }
}

export function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatRelative(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `${min} min atrás`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h atrás`;
    const days = Math.floor(h / 24);
    if (days < 7) return `${days}d atrás`;
    return formatDate(iso);
  } catch {
    return "";
  }
}
