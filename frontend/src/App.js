import React, { useLayoutEffect } from "react";
import "@/App.css";
import { Toaster } from "sonner";
import { JourneyProvider, useJourney } from "./context/JourneyContext";
import Header from "./components/Header";
import Hub from "./components/Hub";
import ModuloEmpreendimento from "./components/modules/ModuloEmpreendimento";
import ModuloCasas from "./components/modules/ModuloCasas";
import ModuloPerfil from "./components/modules/ModuloPerfil";
import ModuloSimulador from "./components/modules/ModuloSimulador";
import ModuloResultadoSimulacao from "./components/modules/ModuloResultadoSimulacao";
import ModuloDiferenciais from "./components/modules/ModuloDiferenciais";
import ModuloCorretor from "./components/modules/ModuloCorretor";
import ModuloAgendamento from "./components/modules/ModuloAgendamento";
import ModuloImediato from "./components/modules/ModuloImediato";
import ModuloObrigado from "./components/modules/ModuloObrigado";
import ModuloLocalizacao from "./components/modules/ModuloLocalizacao";
import Gate from "./components/Gate";
import AdminApp from "./admin/AdminApp";

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
  if (!registered) return <Gate />;
  switch (stage) {
    case "empreendimento":
      return <ModuloEmpreendimento />;
    case "casas":
      return <ModuloCasas />;
    case "perfil":
      return <ModuloPerfil />;
    case "simulador":
      return <ModuloSimulador />;
    case "resultado_simulacao":
      return <ModuloResultadoSimulacao />;
    case "diferenciais":
      return <ModuloDiferenciais />;
    case "localizacao":
      return <ModuloLocalizacao />;
    case "corretor":
      return <ModuloCorretor />;
    case "agendamento":
      return <ModuloAgendamento />;
    case "imediato":
      return <ModuloImediato />;
    case "obrigado":
      return <ModuloObrigado />;
    case "hub":
    default:
      return <Hub />;
  }
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
  const { registered } = useJourney();
  return (
    <>
      {registered && <Header />}
      <Router />
    </>
  );
}
