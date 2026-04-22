import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { classifyAnswers } from "../lib/quizData";

const JourneyContext = createContext(null);

const STORAGE_KEY = "alameda500_journey_v1";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

const INITIAL = {
  stage: "hub",
  modulos_visitados: [],
  quiz_answers: {},
  casa_preferida: null,
  simulacao: null,
  agendamento: null,
  solicita_atendimento_imediato: false,
  interacoes: [],
  imagens_vistas: [],
  startedAt: Date.now(),
  name: "",
  phone: "",
  registered: false,
  opportunityOptIn: false,
};

export function JourneyProvider({ children }) {
  const [state, setState] = useState(() => readStorage() || INITIAL);
  const [tick, setTick] = useState(0);

  // Persist
  useEffect(() => {
    writeStorage(state);
  }, [state]);

  // Timer — força rerender a cada 10s pra atualizar score com tempo
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(id);
  }, []);

  const tempoTotalSegundos = Math.floor((Date.now() - state.startedAt) / 1000);

  const classification = useMemo(() => {
    if (Object.keys(state.quiz_answers).length < 6) return null;
    return classifyAnswers(state.quiz_answers);
  }, [state.quiz_answers]);

  const leadScore = useMemo(() => {
    let score = 0;
    const mods = new Set(state.modulos_visitados);
    if (mods.has("empreendimento")) score += 10;
    if (mods.has("casas") && state.casa_preferida) score += 15;
    if (mods.has("diferenciais")) score += 5;
    if (mods.has("perfil") && classification) {
      score +=
        classification === "quente" ? 30 : classification === "morno" ? 20 : 10;
    }
    if (mods.has("simulador") && state.simulacao?.renda_bruta) score += 25;
    if (state.agendamento) score += 40;
    if (state.solicita_atendimento_imediato) score += 50;
    const tempoPts = Math.min(20, Math.floor(tempoTotalSegundos / 30) * 5);
    score += tempoPts;
    return Math.min(150, score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.modulos_visitados,
    state.casa_preferida,
    state.simulacao,
    state.agendamento,
    state.solicita_atendimento_imediato,
    classification,
    tick,
  ]);

  const temperatura =
    leadScore >= 90 ? "quente" : leadScore >= 45 ? "morno" : "frio";

  // Actions
  const goTo = (stage) => {
    setState((s) => ({ ...s, stage }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const markModuloVisitado = (moduloId) =>
    setState((s) => ({
      ...s,
      modulos_visitados: s.modulos_visitados.includes(moduloId)
        ? s.modulos_visitados
        : [...s.modulos_visitados, moduloId],
      interacoes: [
        ...s.interacoes,
        { tipo: "modulo_visitado", modulo: moduloId, timestamp: new Date().toISOString() },
      ],
    }));

  const setQuizAnswer = (questionId, option) =>
    setState((s) => ({
      ...s,
      quiz_answers: { ...s.quiz_answers, [questionId]: option },
    }));

  const setCasaPreferida = (casaId) =>
    setState((s) => ({
      ...s,
      casa_preferida: casaId,
      interacoes: [
        ...s.interacoes,
        { tipo: "casa_escolhida", detalhe: { casa_id: casaId }, timestamp: new Date().toISOString() },
      ],
    }));

  const setSimulacao = (sim) =>
    setState((s) => ({ ...s, simulacao: sim }));

  const setAgendamento = (ag) =>
    setState((s) => ({
      ...s,
      agendamento: ag,
      interacoes: [
        ...s.interacoes,
        { tipo: "agendamento", detalhe: ag, timestamp: new Date().toISOString() },
      ],
    }));

  const setAtendimentoImediato = (val) =>
    setState((s) => ({ ...s, solicita_atendimento_imediato: val }));

  const setContato = ({ name, phone }) =>
    setState((s) => ({ ...s, name, phone }));

  const setRegistered = (val) => setState((s) => ({ ...s, registered: val }));
  const setOpportunityOptIn = (val) => setState((s) => ({ ...s, opportunityOptIn: val }));

  const markImagemVista = (idx) =>
    setState((s) => ({
      ...s,
      imagens_vistas: s.imagens_vistas.includes(idx)
        ? s.imagens_vistas
        : [...s.imagens_vistas, idx],
    }));

  const addInteracao = (tipo, detalhe) =>
    setState((s) => ({
      ...s,
      interacoes: [
        ...s.interacoes,
        { tipo, detalhe, timestamp: new Date().toISOString() },
      ],
    }));

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setState({ ...INITIAL, startedAt: Date.now() });
  };

  const value = {
    ...state,
    classification,
    leadScore,
    temperatura,
    tempoTotalSegundos,
    goTo,
    markModuloVisitado,
    setQuizAnswer,
    setCasaPreferida,
    setSimulacao,
    setAgendamento,
    setAtendimentoImediato,
    setContato,
    setRegistered,
    setOpportunityOptIn,
    markImagemVista,
    addInteracao,
    reset,
  };

  return (
    <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>
  );
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) throw new Error("useJourney must be inside JourneyProvider");
  return ctx;
}
