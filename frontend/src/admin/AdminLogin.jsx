import React, { useState } from "react";
import { useAdmin } from "./AdminContext";
import { Lock, Loader2, AlertCircle } from "lucide-react";

function formatApiError(detail) {
  if (detail == null) return "Erro ao fazer login.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).join(" ");
  }
  return String(detail);
}

export default function AdminLogin() {
  const { login } = useAdmin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (ex) {
      setErr(formatApiError(ex.response?.data?.detail) || ex.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      data-testid="admin-login"
      className="flex min-h-screen items-center justify-center bg-[color:var(--torres-cream)] px-6"
    >
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-[color:var(--torres-line)] bg-white p-8 shadow-[0_20px_60px_-30px_rgba(100,113,162,0.35)]">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "var(--torres-indigo)", color: "#fff" }}
            >
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Torres Engenharia
              </div>
              <div className="serif text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
                Admin · Alameda 500
              </div>
            </div>
          </div>

          <h1 className="serif mt-8 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
            Acesse seu painel
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--torres-muted)" }}>
            Entre com suas credenciais para ver os leads capturados.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" data-testid="admin-login-form">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                data-testid="admin-login-email"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="admin-login-password"
                className="w-full rounded-xl border border-[color:var(--torres-line)] bg-white px-4 py-3 text-base outline-none transition-all focus:border-[color:var(--torres-indigo)] focus:ring-2 focus:ring-[color:var(--torres-indigo)]/20"
              />
            </div>

            {err && (
              <div
                data-testid="admin-login-error"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              data-testid="admin-login-submit"
              className="btn-primary-torres group inline-flex w-full items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
        <div className="mt-4 text-center text-xs" style={{ color: "var(--torres-muted)" }}>
          Acesso restrito · Torres Engenharia
        </div>
      </div>
    </div>
  );
}
