import React, { useLayoutEffect } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import { JourneyProvider, useJourney } from "./context/JourneyContext";
import Hub from "./components/Hub";
import ModuloEmpreendimento from "./components/modules/ModuloEmpreendimento";
import ModuloCasas from "./components/modules/ModuloCasas";
import ModuloPerfil from "./components/modules/ModuloPerfil";
import ModuloSimulador from "./components/modules/ModuloSimulador";
import ModuloResultadoSimulacao from "./components/modules/ModuloResultadoSimulacao";
import ModuloCorretor from "./components/modules/ModuloCorretor";
import ModuloAgendamento from "./components/modules/ModuloAgendamento";
import ModuloImediato from "./components/modules/ModuloImediato";
import ModuloObrigado from "./components/modules/ModuloObrigado";
import ModuloLocalizacao from "./components/modules/ModuloLocalizacao";
import AdminApp from "./admin/AdminApp";
import BookLayout from "./components/book/BookLayout";

// Robust scroll-to-top for every stage transition.
// Handles mobile quirks: iOS Safari rubber-band, Android Chrome URL bar,
// and apps where scroll container is <html>, <body>, or nested containers.
function useScrollTopOnStageChange(stage, registered) {
  useLayoutEffect(() => {
    const reset = () => {
      try {
        // Instant (not smooth) — smooth breaks on iOS when the DOM changes.
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } catch (_) {
        window.scrollTo(0, 0);
      }
      if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };
    // Fire synchronously before paint, then again after paint for iOS Safari,
    // and once more on next tick to catch late layout shifts (image loading etc).
    reset();
    const raf1 = requestAnimationFrame(() => {
      reset();
      const raf2 = requestAnimationFrame(reset);
      // store raf2 on raf1 for cleanup
      // eslint-disable-next-line no-param-reassign
      reset._raf2 = raf2;
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (reset._raf2) cancelAnimationFrame(reset._raf2);
    };
  }, [stage, registered]);
}

function Router() {
  const { stage, registered } = useJourney();
  useScrollTopOnStageChange(stage, registered);
  // Sincroniza document.title com o capítulo atual — facilita análise
  // de funil em Hotjar/GA4 onde cada URL ganha título legível.
  useLayoutEffect(() => {
    const titles = {
      hub: "Alameda 500 · Capa",
      empreendimento: "Alameda 500 · O empreendimento",
      casas: "Alameda 500 · Sua casa ideal",
      localizacao: "Alameda 500 · Localização",
      perfil: "Alameda 500 · Seu perfil",
      simulador: "Alameda 500 · Simulação",
      resultado_simulacao: "Alameda 500 · Resultado da simulação",
      corretor: "Alameda 500 · Falar com corretor",
      agendamento: "Alameda 500 · Agendar visita",
      imediato: "Alameda 500 · Falar agora",
      obrigado: "Alameda 500 · Obrigado",
    };
    if (typeof document !== "undefined") {
      document.title = titles[stage] || "Alameda 500 · Concierge Digital";
    }
  }, [stage]);
  // Gate removido da entrada — captura agora acontece contextualmente
  // no Quiz (Perfil) e no Corretor. A Capa é aberta livre para reduzir
  // evasão na primeira impressão.

  // Stages que NÃO entram no Book chrome (header/footer):
  //  - "hub" tem hero próprio em tela cheia (a "capa")
  //  - "imediato" / "agendamento" / "obrigado" são fluxos de saída
  //  - "resultado_simulacao" é tela de checkout-like
  const fullScreenStages = new Set([
    "hub",
    "imediato",
    "agendamento",
    "obrigado",
    "resultado_simulacao",
  ]);

  let content;
  switch (stage) {
    case "empreendimento":
      content = <ModuloEmpreendimento />;
      break;
    case "casas":
      content = <ModuloCasas />;
      break;
    case "perfil":
      content = <ModuloPerfil />;
      break;
    case "simulador":
      content = <ModuloSimulador />;
      break;
    case "resultado_simulacao":
      content = <ModuloResultadoSimulacao />;
      break;
    case "localizacao":
      content = <ModuloLocalizacao />;
      break;
    case "corretor":
      content = <ModuloCorretor />;
      break;
    case "agendamento":
      content = <ModuloAgendamento />;
      break;
    case "imediato":
      content = <ModuloImediato />;
      break;
    case "obrigado":
      content = <ModuloObrigado />;
      break;
    case "hub":
    default:
      content = <Hub />;
  }

  if (fullScreenStages.has(stage)) {
    // Capa e fluxos de saída sem o chrome do Book
    return content;
  }
  // Quiz e Simulador têm fluxo interno próprio (perguntas/forms passo-a-passo).
  // Mantemos o BookHeader (trilha + botão Corretor) mas escondemos o
  // BookFooter pra evitar dois conjuntos de botões "Anterior/Próximo"
  // competindo na mesma tela.
  const noFooterStages = new Set(["perfil", "simulador"]);
  return (
    <BookLayout hideFooter={noFooterStages.has(stage)} fadeKey={stage}>{content}</BookLayout>
  );
}

export default function App() {
  // Admin/CRM route — bypasses the public journey entirely.
  // Multiple aliases so it works even if a browser extension blocks the
  // word "admin" in URLs (uBlock, Adblock, corporate proxies, etc).
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    const isAdmin =
      path.startsWith("/admin") ||
      path.startsWith("/crm") ||
      path.startsWith("/torres-admin") ||
      path.startsWith("/torres-crm") ||
      path.startsWith("/painel");
    if (isAdmin) {
      return (
        <div className="App" data-testid="app-root-admin">
          <AdminApp />
        </div>
      );
    }
  }
  return (
    <div className="App" data-testid="app-root">
      <JourneyProvider>
        <Toaster position="top-center" richColors />
        <InnerApp />
      </JourneyProvider>
    </div>
  );
}

function InnerApp() {
  return <Router />;
}
