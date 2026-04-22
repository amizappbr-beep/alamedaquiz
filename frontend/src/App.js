import React from "react";
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

function Router() {
  const { stage, registered } = useJourney();
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
