import React from "react";
import { useJourney } from "../../context/JourneyContext";
import { CASA_MODELOS } from "../../lib/conteudo";
import { CheckCircle2, Calendar, Zap, RotateCcw, ArrowRight } from "lucide-react";
import { buildWhatsappUrl } from "../../lib/quizData";
import CertificadoExploracao from "../CertificadoExploracao";

export default function ModuloObrigado() {
  const {
    name,
    phone,
    agendamento,
    solicita_atendimento_imediato,
    leadScore,
    temperatura,
    classification,
    casa_preferida,
    modulos_visitados,
    quiz_answers,
    simulacao,
    reset,
  } = useJourney();

  const casa = CASA_MODELOS.find((c) => c.id === casa_preferida);
  const isImediato = solicita_atendimento_imediato;

  const wa = buildWhatsappUrl({
    name,
    phone,
    temperatura,
    score: leadScore,
    classification,
    casa: casa_preferida,
    agendamento,
    modulos: modulos_visitados,
    quiz_answers,
    simulacao,
    solicita_atendimento_imediato: isImediato,
  });

  const restart = () => {
    reset();
  };

  return (
    <section
      data-testid="modulo-obrigado"
      className="min-h-[calc(100vh-60px)] w-full bg-[color:var(--torres-cream)] px-6 py-12 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-3xl text-center">
        <div className="fade-up">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: "rgba(16,185,129,0.12)", color: "#059669" }}
          >
            <CheckCircle2 className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <div
            className="mt-6 text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--torres-indigo)" }}
          >
            {isImediato ? "WhatsApp aberto" : "Agendamento confirmado"}
          </div>
          <h1
            className="serif mt-3 text-3xl font-semibold leading-tight sm:text-5xl"
            style={{ color: "var(--torres-ink)" }}
          >
            {name ? `${name.split(" ")[0]}, ` : ""}
            seu lead foi registrado!
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base" style={{ color: "var(--torres-muted)" }}>
            {isImediato
              ? "Abrimos o WhatsApp com seu resumo. Em menos de 2 minutos um especialista te responde."
              : `Confirmamos sua visita ${
                  agendamento
                    ? `para ${new Date(agendamento.data + "T00:00:00").toLocaleDateString("pt-BR")} às ${agendamento.horario}`
                    : ""
                }. Você receberá lembrete no WhatsApp.`}
          </p>
        </div>

        {/* Summary card */}
        <div
          className="fade-up fade-up-delay-2 mt-10 rounded-3xl border border-[color:var(--torres-line)] bg-white p-6 text-left sm:p-8"
          data-testid="obrigado-resumo"
        >
          <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-muted)" }}>
            Resumo da sua jornada
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Engajamento" value={`${leadScore}/150`} subtitle={perfilLabel(temperatura)} />
            <Stat label="Módulos" value={`${modulos_visitados.length}/6`} subtitle="explorados" />
            <Stat
              label="Atendimento"
              value={isImediato ? "Imediato" : "Agendado"}
              subtitle={isImediato ? "WhatsApp" : agendamento?.formato}
              icon={isImediato ? <Zap className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
            />
          </div>
          {casa && (
            <div className="mt-6 rounded-2xl bg-[color:var(--torres-indigo)]/5 p-5">
              <div className="text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--torres-indigo)" }}>
                Casa de interesse
              </div>
              <div className="serif mt-1 text-lg font-semibold" style={{ color: "var(--torres-ink)" }}>
                Casa {casa.nome} — {casa.numeros}
              </div>
              <div className="text-sm" style={{ color: "var(--torres-muted)" }}>
                {casa.areaPrivativa} m² • {casa.quartos} quartos{casa.lavabo ? " + lavabo" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Certificate of Exploration — shareable keepsake */}
        <CertificadoExploracao
          name={name}
          modulosCount={modulos_visitados.length}
          temperatura={temperatura}
          casaId={casa_preferida}
          leadScore={leadScore}
        />

        {/* Actions */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {!isImediato && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="obrigado-whatsapp-cta"
              className="btn-primary-torres group inline-flex items-center gap-2"
            >
              Enviar meu resumo no WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          )}
          <button
            onClick={restart}
            data-testid="obrigado-restart-btn"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--torres-line)] bg-white px-5 py-3 text-sm font-semibold transition-all hover:border-[color:var(--torres-indigo)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Começar de novo
          </button>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, subtitle, icon }) {
  return (
    <div className="rounded-2xl border border-[color:var(--torres-line)] p-4">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider" style={{ color: "var(--torres-muted)" }}>
        {icon}
        {label}
      </div>
      <div className="serif mt-1 text-2xl font-semibold" style={{ color: "var(--torres-ink)" }}>
        {value}
      </div>
      <div className="text-xs capitalize" style={{ color: "var(--torres-muted)" }}>
        {subtitle}
      </div>
    </div>
  );
}

function perfilLabel(temperatura) {
  if (temperatura === "quente") return "Perfil compatível";
  if (temperatura === "morno") return "Perfil em análise";
  return "Preparando seu perfil";
}
