# Alameda 500 — Concierge Digital (ex-Landing Interativa)

## Problema original
MVP interativo para o Residencial Alameda 500 (Torres Engenharia, Alterosas/Serra-ES). Evoluído de quiz linear para **HUB DE EXPLORAÇÃO não-linear** com lead scoring progressivo e handoff qualificado para corretor (agendamento ou atendimento imediato). Este app é a porta de entrada de um CRM imobiliário em construção.

## Visão em 3 fases
- **Fase 1 — Hub de Exploração** (✅ CONCLUÍDA 2026-04-21)
- **Fase 2 — Simulador CAIXA/MCMV**
- **Fase 3 — CRM embutido** (admin para a incorporadora, 1 corretor único)

## Personas
- **Explorador curioso**: quer entender sem compromisso. Navega módulos livremente.
- **Comprador decidido**: quer fechar. Score >=90, escolhe atendimento imediato.
- **Incorporadora Torres Engenharia (CRM)**: recebe leads já qualificados e enriquecidos.

## Requisitos (estáticos)
- Hub com 6 módulos clicáveis não-lineares
- Lead scoring 0-150 recalculado em tempo real (client + server)
- "Falar com corretor" só habilita após 2 módulos visitados
- 2 opções de atendimento: imediato (WhatsApp) ou agendado (data + hora + formato)
- 3 formatos de agendamento: apto decorado / visita ao imóvel / videochamada
- Persistência em localStorage (jornada não perde ao recarregar)
- Paleta Torres (índigo #6471A2 + off-white #F5F4F7), Playfair + Inter

## Arquitetura

### Backend (FastAPI + MongoDB)
- `GET /api/` — health v2.0
- `POST /api/leads` — aceita jornada completa (`modulos_visitados`, `quiz_answers`, `classification`, `casa_preferida`, `simulacao`, `agendamento`, `solicita_atendimento_imediato`, `interacoes`, `tempo_total_segundos`). Valida nome+phone se finalizando (agendamento ou imediato). Recalcula `lead_score` e `temperatura` server-side.
- `GET /api/leads` — lista com filtros `classification`, `temperatura`, `min_score`
- `GET /api/leads/summary` — contagens + score médio/máx + totais de agendamentos e imediatos

### Frontend (React + Context)
- `JourneyProvider` centraliza estado + persiste em localStorage
- Stage machine: `hub | empreendimento | casas | perfil | simulador | diferenciais | corretor | agendamento | imediato | obrigado`
- Header persistente com score/módulos
- 9 componentes de módulo em `/components/modules/`

### Lead Scoring (server e client)
| Ação | Pontos |
|------|--------|
| Módulo empreendimento | +10 |
| Módulo casas + escolha de preferida | +15 |
| Módulo diferenciais | +5 |
| Quiz quente/morno/frio | +30/+20/+10 |
| Simulação com renda | +25 |
| Agendamento | +40 |
| Atendimento imediato | +50 |
| Tempo na página | +5 por 30s (máx +20) |

- Temperatura: ≥90 quente, ≥45 morno, <45 frio

## Implementado (2026-04-21)

### Fase 1
- Backend v2.0 com modelos expandidos (QuizAnswer, Agendamento, Simulacao, Interacao) + compute_lead_score + compute_temperature (testado 12/12 pytest)
- JourneyContext com persistência em localStorage
- Header com score/módulos
- Hub com 6 cards, gating do corretor por 2+ módulos
- ModuloEmpreendimento com galeria lightbox (6 itens)
- ModuloCasas com 3 plantas + sugestão pelo perfil
- ModuloPerfil reusa quiz de 6 perguntas
- ModuloSimulador com placeholder "Em breve"
- ModuloDiferenciais com 10 cards
- ModuloCorretor com escolha imediato/agendar
- ModuloAgendamento com data (14 dias), formato, horário, nome+whatsapp
- ModuloImediato com form rápido + abertura do WhatsApp com score oficial do servidor
- ModuloObrigado com resumo da jornada + reset
- Testing agent: 100% backend (12/12), 100% frontend (todos os fluxos críticos)

## Backlog

### Fase 2 — Simulador CAIXA/MCMV (próxima)
- Regras MCMV offline (faixas, subsídio, taxa, prazo)
- Input: renda, entrada, FGTS, prazo → parcela estimada + faixa
- Link secundário para simulador oficial da Caixa
- Integra ao lead score (+25)

### Fase 3 — CRM embutido para a incorporadora
- Rota `/admin` com login (single user = incorporadora)
- Kanban de leads: Novo → Em contato → Visita agendada → Negociação → Vendido/Perdido
- Lista com filtros (score, temperatura, data), export CSV
- Detalhe do lead: timeline de interações, dados da jornada, notas do corretor
- Dashboard: métricas de conversão por módulo, taxa de agendamento, tempo médio na jornada

### Pós-fase 3 / Melhorias técnicas
- Recalcular `classification` server-side a partir de `quiz_answers` (hoje cliente envia — risco de tampering)
- Rate limit / honeypot em `POST /api/leads`
- Normalizar phone para E.164 no backend
- Deduplicar `interacoes` antes de salvar
- Migração `@app.on_event` → lifespan handler
- Retornar 201 Created em `POST /api/leads`

## Arquivos-chave
- `/app/backend/server.py`
- `/app/frontend/src/App.js`
- `/app/frontend/src/context/JourneyContext.jsx`
- `/app/frontend/src/components/{Header,Hub}.jsx`
- `/app/frontend/src/components/modules/Modulo*.jsx`
- `/app/frontend/src/lib/{quizData,conteudo,assets}.js`
- `/app/memory/PRD.md` (este arquivo)
- `/app/backend/tests/test_alameda_api.py`
