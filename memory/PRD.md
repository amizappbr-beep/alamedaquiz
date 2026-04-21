# Alameda 500 — Landing Interativa (MVP)

## Problema original
MVP de landing interativa para o Residencial **Alameda 500** (Torres Engenharia, Alterosas/Serra-ES). 12 casas duplex. Fluxo: captura → quiz de 6 perguntas → resultado classificado (quente/morno/frio) → CTA WhatsApp.

## Personas
- **Interessado quente**: quer sair do aluguel, tem entrada, decide rápido. Recebe prioridade.
- **Interessado morno**: perfil próximo, precisa de simulação.
- **Interessado frio**: pesquisando, sem pressa — entra em fluxo de nutrição futura.
- **Corretor Torres**: recebe lead classificado no WhatsApp (27) 99661-0579.

## Requisitos (estáticos)
- 1 página, 4 estágios (intro, quiz, form, result)
- 6 perguntas, 1 por tela, com progresso %
- Formulário de captura (nome + WhatsApp BR com máscara) antes do resultado
- WhatsApp CTA com mensagem automática contendo classificação
- Paleta Torres (índigo #6471A2 + off-white #F5F4F7)
- Tipografia: Playfair Display (headings) + Inter (corpo)
- Imagens reais do empreendimento fornecidas pelo cliente

## Arquitetura
- **Backend**: FastAPI + MongoDB (motor). Rotas em `/api`:
  - `GET /api/` — health
  - `POST /api/leads` — cria lead `{name, phone, answers[6], classification}`
  - `GET /api/leads` — lista leads (sem _id, desc por created_at), filtro por classification
  - `GET /api/leads/summary` — contagens total/quente/morno/frio
- **Frontend**: React + Tailwind + shadcn/ui + sonner (toasts). Estado local via `useState` controla stages.
- **Assets**: imagens do cliente hospedadas em customer-assets.emergentagent.com (listadas em `/app/frontend/src/lib/assets.js`).

## Implementado (2026-04-21)
- Backend com CRUD de leads + summary (testado com pytest, 9/9)
- Frontend completo: Intro, Quiz, LeadForm (máscara BR), Result com galeria de 6 imagens
- Classificação automática por soma de pesos (quente ≥12, morno ≥7, frio <7, máx 16)
- WhatsApp deep link com mensagem pré-preenchida e classificação
- Escassez: badge "12 unidades" na intro e callout no resultado
- Animações: fade-up, ken-burns no hero, slide transitions entre perguntas
- Testing agent: 100% backend, 100% frontend

## Backlog / Próximas iterações

### P0 (pré-launch)
- Logo oficial Alameda 500 (extrair PDF `LOGO ALAMEDA.pdf` para SVG/PNG e substituir o "A" estilizado)
- Recalcular classificação no backend (hoje o cliente envia; possível tampering)
- Rate limit / honeypot em `POST /api/leads` (endpoint público)

### P1 (crescimento)
- Painel administrativo /admin/leads (lista + filtro + export CSV) com auth simples
- Integração com Meta Pixel / Google Analytics para tracking do funil (intro→quiz→form→result→whatsapp)
- Enviar notificação por email/WhatsApp Business automática quando lead QUENTE for capturado
- UTM parameters no WhatsApp link (perfil, fonte de tráfego)

### P2 (nice-to-have)
- Simulador de parcelas no resultado MORNO
- Variantes A/B da headline
- Tour virtual 360° usando as plantas humanizadas
- Página específica por casa (Casa 6, Casa 7, Casas 2–5 e 8–11) com planta correspondente
- Mapa de localização interativo (usar `MAPA DE LOCALIZAÇÃO.pdf`)

## Arquivos-chave
- `/app/backend/server.py`
- `/app/frontend/src/App.js`
- `/app/frontend/src/components/{Intro,Quiz,LeadForm,Result}.jsx`
- `/app/frontend/src/lib/{quizData,assets}.js`
- `/app/frontend/src/index.css` (design tokens Torres)
