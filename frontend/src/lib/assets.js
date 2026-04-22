// Project assets uploaded by client (Torres Engenharia / Alameda 500)

export const ALAMEDA_IMAGES = {
  // Fachadas
  fachadaDia:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/uei5m3ez_FACHADA%20INTERNA%20DIA%20%281%29.jpeg",
  fachadaDetalhes:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/5w4wfrha_FACHDA%20INTERNA%20DETALHES.jpeg",
  fachadaNoite:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/6vtzsb69_FACHADA%20INTERNA%20A%20NOITE.jpeg",
  fachadaNoiteDetalhes:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/al7t82c1_FACHADA%20INTERNA%20DETALHES%20A%20NOITE.jpeg",
  fachadaEntradaPrincipal: "/assets/fachada_entrada.jpg",
  estacionamentoTarde:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/1gdpajy3_ESTACIONAMENTO%20FINAL%20DE%20TARDE.jpeg",
  // Interiores
  sala:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/p6h3uhaz_SALA%20DE%20ESTAR.jpeg",
  cozinha:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/kn1grew1_COZINHA.jpeg",
  quarto:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/z1ojrtsz_QUARTO.jpeg",
  quintal:
    "https://customer-assets.emergentagent.com/job_alameda-quiz/artifacts/4utek6hx_QUINTAL.jpeg",
  // Master plan & plantas
  implantacao: "/assets/implantacao.jpg",
  plantaPremiumTerreo: "/assets/planta_premium_terreo.jpg",
  plantaFamiliaTerreo: "/assets/planta_familia_terreo.jpg",
  plantaFamiliaPiso2: "/assets/planta_familia_piso2.jpg",
  plantaEssencialTerreo: "/assets/planta_essencial_terreo.jpg",
  plantaEssencialPiso2: "/assets/planta_essencial_piso2.jpg",
};

export const GALLERY_ITEMS = [
  { src: ALAMEDA_IMAGES.fachadaEntradaPrincipal, title: "Fachada • Entrada principal", subtitle: "Portaria e acesso ao condomínio" },
  { src: ALAMEDA_IMAGES.fachadaDia, title: "Fachada diurna", subtitle: "Design contemporâneo" },
  { src: ALAMEDA_IMAGES.fachadaNoite, title: "Fachada à noite", subtitle: "Iluminação arquitetônica" },
  { src: ALAMEDA_IMAGES.sala, title: "Sala de estar", subtitle: "Integração sala + cozinha" },
  { src: ALAMEDA_IMAGES.cozinha, title: "Cozinha gourmet", subtitle: "Churrasqueira + varanda" },
  { src: ALAMEDA_IMAGES.quarto, title: "Suíte", subtitle: "Luz natural e privacidade" },
  { src: ALAMEDA_IMAGES.quintal, title: "Quintal privativo", subtitle: "Área gourmet ao ar livre" },
  { src: ALAMEDA_IMAGES.estacionamentoTarde, title: "Estacionamento", subtitle: "Área comum ao fim do dia" },
];

// Endereço / localização
export const ENDERECO = {
  rua: "Rua São Paulo, 500",
  bairro: "Alterosas",
  cidade: "Serra",
  uf: "ES",
  cep: "29163-000",
  completo: "Rua São Paulo, 500 — Alterosas, Serra/ES",
  // Google Maps embed + directions
  mapsQuery: "Rua São Paulo, 500, Alterosas, Serra, ES",
  mapsEmbed:
    "https://www.google.com/maps?q=Rua%20S%C3%A3o%20Paulo%2C%20500%2C%20Alterosas%2C%20Serra%2C%20ES&output=embed",
  mapsDirections:
    "https://www.google.com/maps/dir/?api=1&destination=" +
    encodeURIComponent("Rua São Paulo, 500, Alterosas, Serra, ES"),
};
