# PRD — Residencial Alameda 500 (Torres Engenharia)

## Original Problem Statement
Criar uma landing page interativa / concierge digital para o empreendimento "Residencial Alameda 500" (12 casas duplex, Alterosas, Serra/ES). Objetivo: filtrar e qualificar leads via jornada NÃO-linear onde o usuário explora o imóvel, vê opções de casas com plantas, responde quiz de perfil, simula financiamento (regras Caixa MCMV) e agenda visita ou fala com corretor.

**Idioma do produto:** PT-BR.
**Cliente final do dashboard:** corretor + incorporadora.
**Perfil do lead:** variado, porém com fração relevante de **baixa escolaridade** — UX deve ser intuitiva, linguagem natural, botões grandes, ajuda visível.

## Personas
1. **Lead "Explorador"** — quer conhecer casa/condomínio antes de falar com alguém. Entra pelo Hub, percorre módulos, decide quando acionar corretor.
2. **Lead "Decidido"** — vai direto "Falar com corretor" ou "Agendar visita".
3. **Lead "Inseguro com finanças"** — precisa da ajuda visível no simulador e dos textos descontraídos (ex: "Pode ser parcelado em 3x. Não precisa dos 20% já!").
4. **Corretor/Incorporadora** (Fase 3) — dashboard para ver leads, status, temperatura, jornada.

## Arquitetura
- **Frontend:** React SPA (single-page). Stage routing via `JourneyContext`.
- **Backend:** FastAPI + MongoDB (lead persistence, server-side scoring, simulation validation).
- **Assets:** `customer-assets.emergentagent.com` + `/assets/` (PDFs convertidos em JPEG via poppler).
- **Routing:** Todas as rotas prefixadas `/api`. Frontend usa `REACT_APP_BACKEND_URL`.
- **Integrações externas:** Google Maps iframe, WhatsApp (wa.me).

---

## Fases do projeto

### ✅ Fase 1 — Hub Interativo (CONCLUÍDO)
- Gate de captura (nome + WhatsApp + opt-in)
- Hub com 6 módulos + indicador de ordem sugerida
- Módulos: Empreendimento, Casas, Perfil (quiz 12 perguntas em 2 blocos), Simulador, Diferenciais, Localização
- Módulo Corretor (gatekeeper) → Imediato ou Agendamento
- Score + temperatura servidos pelo backend

### ✅ Fase 2 — Simulador financeiro (CONCLUÍDO)
- Regras MCMV (Faixas 1, 2, 3) + SBPE
- Sinal 13% parcelado em até 3x (não exige 20% à vista)
- Complemento 7% durante a obra (~15x)
- Financiamento 80% Tabela Price
- Residual opcional pós-chaves (20 meses)
- Espelho dinâmico da proposta em tempo real
- Validação servidor + frontend

### 🔴 Fase 3 — CRM Embutido ✅ (Release 1 + 2 CONCLUÍDOS)

**Release 1 (2026-02):**
- `/admin` com login (JWT custom, email+senha)
- Kanban: Novo → Contatado → Agendado → Em Negociação → Ganho/Perdido
- Detalhe do lead: perfil, quiz, simulação, módulos, timeline
- Filtros (temperatura, módulos completos, com simulação, agendou, etc.)
- Notificação visual/sonora para leads quentes
- Refatoração: separar rotas admin em router próprio
- Lead Warehouse (captura de nutrição multi-empreendimento)
- Certificado de exploração via html2canvas
- Refator UX para "Book Digital" paginado

**Release 2 (2026-02-11):**
- Brokers/Corretores entity + CRUD `/api/admin/brokers`
- Round-robin auto-assign de leads quentes (score ≥ 90 OU imediato OU agendamento)
- Ownership manual via `PATCH /api/admin/leads/{id}/owner` (idempotente, mantém counters)
- Canais de venda: `direto | indicacao | imobiliaria | campanha`
- SLA visual: badges Atrasado/Atenção no Kanban + métrica `sla_atrasados` no header
- Nova aba "Corretores" no admin com cards, toggle Pausar/Reativar, Remover (desatribui leads)
- Avatar circular com iniciais nos lead cards + dropdown de corretor no Lead Drawer

---

## Changelog (o que foi implementado, com datas)

### 2026-02-11 (sessão atual)
- **P0 fix — Quiz/Simulador resetando**: `BookLayout.jsx` usava `key={Math.random()}` no `<main>`, forçando remount a cada render do pai. Substituído por `key={fadeKey}` onde `fadeKey={stage}` é passado por App.js — agora o remount só ocorre quando troca de capítulo. Validado E2E: Quiz avança 1/12 → 2/12 → 3/12 corretamente.
- **CRM Release 2 — Sales Channels + Ownership**:
  - Backend: novo `routers/brokers.py` (CRUD + `pick_round_robin_broker` + counter helpers); `PATCH /admin/leads/{id}/owner` no admin router; filtros `?owner=` e `?channel=` em `/admin/leads`; novas métricas `sla_atrasados`, `brokers_ativos`, `leads_sem_dono` em `/admin/metrics`.
  - Frontend: aba "Corretores" no admin (`BrokersView.jsx`), `BrokerAvatar.jsx`, dropdown de corretor no Lead Drawer, badges de SLA visual (Atrasado/Atenção) nos lead cards, tiles "Sem dono" e "SLA atrasado" no header.
  - Lead model: campos novos `channel`, `owner_broker_id`, `owner_broker_name`.
  - Backend tests (testing agent): 17/17 PASS.

### 2026-02 Fork (sessão anterior)
- **Hero do Hub** ganhou imagem "FACHADA PRINCIPAL NOTURNA" com gradiente dark para legibilidade
- **Scroll-to-top** centralizado em `App.js` via `useLayoutEffect + requestAnimationFrame` duplo; funciona em iOS Safari e Android Chrome
- **`ModuleFooterCTA`** — componente compartilhado usado nos módulos Empreendimento, Casas, Diferenciais e Localização: CTA primário + "Ou fale direto com um corretor" (WhatsApp imediato OU Agendar)
- **Resultado da simulação** perdeu a linha "Valor final da compra (juros + principal)"
- **Mensagem WhatsApp** reescrita com todo contexto da jornada: perfil, casa, módulos explorados, quiz (momento + financeiro), simulação (sinal, complemento, financiamento, faixa MCMV), agendamento e contato
- **Agendamento** removeu formato "Apto decorado"; default passou para "Visita ao imóvel"; grid 2 colunas
- **Simulador ganhou 2 áreas de ajuda** para leads de baixa escolaridade: banner no topo ("Quer que a gente te ajude a preencher?") + card compacto pós-formulário ("Travou em algum campo? Sem problema.") — ambos levam ao atendimento imediato ou agendamento

### Iterações anteriores
- Conversão de 8 PDFs arquitetônicos em JPEGs via poppler-utils
- Galerias swipe mobile + lightbox com navegação
- Cards de casa com preço "A partir de"
- Master Plan integrado ao módulo Empreendimento
- Endereço completo + Google Maps embed + direções
- Numeração sequencial nos módulos do Hub
- Ajuste do simulador para 35 anos, sinal parcelável, entrada 13% (não 20%)

---

## Backlog / Prioridades

### P0 (todos concluídos na sessão atual)

### P1 — Próximas releases do CRM
- **Release 3 — Campanhas + Ações Sazonais**: mass dispatch via WhatsApp (Z-API/Twilio) ou Email para os leads do Warehouse, segmentado por faixa/momento/região
- **Release 4 — Propostas + Contratos + Assinatura Eletrônica** (Clicksign)
- **Release 5 — Analytics & ROI**: UTM tracking, VSO (Velocidade de Vendas Operacional), funil de conversão, dashboards por canal
- **Release 6 — Calendário unificado** (Google Calendar) + Pós-venda/NPS

### P1 — Melhorias gerais
- **Toast global "Posso te ajudar agora?"** após 90s de inatividade em qualquer módulo
- **Confirmação pós-agendamento pelo WhatsApp do próprio usuário** (fecha ciclo de confiança)
- **Multi-admin**: evoluir seed → registration de corretores admin (separado dos brokers/corretores comerciais); adicionar X-Forwarded-For no identifier do rate-limit
- **status_history.from**: hoje não persiste o valor anterior no PATCH status
- **Notificação ao corretor responsável**: quando lead é auto-atribuído, disparar WhatsApp/email pro broker dono

### P2
- Copy mais contextual nos CTAs "Próximo passo" por módulo
- Analytics mais ricos (timeline de leads/dia, split por etapa, funnel)
- Lazy load de imagens pesadas do lightbox
- CORS explícito (origins por env) caso migre para cookies httpOnly

---

## Testing status

- **iteration_5.json (regressão)**: frontend 100% (11/11), backend 91% → após fix 100% (22/22 pytest)
- Testing agent usado: SIM, em 5 iterações
- Credenciais teste: N/A (sem auth ainda — virá na Fase 3)

## Key files
- `/app/backend/server.py` — todas as rotas; considerar splitar ao iniciar Fase 3
- `/app/backend/tests/test_alameda_api.py` — 22 testes, todos passando
- `/app/frontend/src/App.js` — router + useScrollTopOnStageChange
- `/app/frontend/src/context/JourneyContext.jsx` — estado global
- `/app/frontend/src/components/ModuleFooterCTA.jsx` — rodapé compartilhado dos módulos
- `/app/frontend/src/lib/quizData.js` — `buildWhatsappUrl`, classificação, insights
- `/app/frontend/src/lib/simulador.js` — cálculos client-side
- `/app/frontend/src/lib/tabelaVendas.js` — preços e disponibilidade das 12 unidades
- `/app/frontend/src/lib/conteudo.js` — 3 modelos (Premium, Família, Essencial) + diferenciais
