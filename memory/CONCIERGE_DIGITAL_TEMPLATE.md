# Concierge Digital · Template de Replicação

> Este documento é um **guia operacional** para replicar o modelo Concierge
> Digital (originalmente construído para o Residencial Alameda 500 · Torres
> Engenharia) para outros funis de conversão. Mantenha-o versionado no
> `/app/memory/` como referência para novos projetos.

---

## 1. Fluxo recomendado no Emergent

```
Projeto atual (alameda-quiz)
    │
    ├── 1. Salvar no GitHub (botão "Save to Github" no chat)
    │
    └── Novo projeto no Emergent
            │
            ├── 2. Escolher "Full Stack App"
            ├── 3. Importar via GitHub (OAuth ou URL pública)
            ├── 4. Reconfigurar .env (MONGO_URL, JWT_SECRET, ADMIN_*)
            └── 5. Personalizar conteúdo por segmento
```

**Custo:** cada projeto novo consome créditos + 50 créditos/mês por deploy.
**O que é copiado:** código, estrutura, arquitetura.
**O que NÃO é copiado:** `.env`, dados do MongoDB, `node_modules`.

---

## 2. Arquitetura reaproveitável (não mexer)

Estes arquivos são a **espinha dorsal** do modelo. Reaproveite intactos:

### Frontend
- `/app/frontend/src/context/JourneyContext.jsx` — estado global + score + URL sync
- `/app/frontend/src/components/book/BookHeader.jsx` — header com trilha visual
- `/app/frontend/src/components/book/BookFooter.jsx` — footer sticky com Vire a Página
- `/app/frontend/src/components/book/BookLayout.jsx` — wrapper
- `/app/frontend/src/App.js` — router state-based + URL sync + admin routing
- `/app/frontend/src/index.css` — sistema de design (variáveis CSS, animações)
- `/app/frontend/src/lib/bookPages.js` — sequência canônica de capítulos

### Backend
- `/app/backend/server.py` — FastAPI + MongoDB + lead scoring
- `/app/backend/auth.py` — JWT admin auth
- `/app/backend/routers/admin.py` — endpoints CRM (leads, métricas, reset)
- `/app/backend/routers/brokers.py` — corretores + round-robin

### CRM Admin
- `/app/frontend/src/admin/*` — todo o painel: Kanban, drawer, warehouse,
  corretores, danger zone, SLA badges

---

## 3. O que trocar em cada replicação

### 🎨 Identidade visual
| Arquivo | O que trocar |
|---|---|
| `/app/frontend/src/index.css` (linhas com `--torres-*`) | Paleta de cores (indigo → nova marca) |
| `/app/frontend/public/index.html` | `<title>`, `<meta description>`, `theme-color` |
| `/app/frontend/src/lib/assets.js` | URLs de imagens (hero, galeria, plantas) |
| Header/Footer copy | "Torres Engenharia" → nova marca |

### 📖 Conteúdo dos capítulos
| Módulo | Adapta para |
|---|---|
| `ModuloEmpreendimento` | Apresentação do produto + galeria + diferenciais |
| `ModuloCasas` | Variantes/opções (planos, modelos, tamanhos, cores) |
| `ModuloLocalizacao` | Local/formato de entrega/agenda/prazo |
| `ModuloPerfil` (Quiz) | Perguntas de qualificação do novo segmento |
| `ModuloSimulador` | Calculadora do valor (preço, ROI, parcela, retorno) |
| `ModuloAgendamento` | Formatos de visita/reunião possíveis |
| `ModuloImediato` | CTA WhatsApp com contexto |

### 🧠 Regras de negócio
| Arquivo | Ajustar |
|---|---|
| `/app/frontend/src/lib/quizData.js` | Perguntas, opções, pesos do score, blocos |
| `/app/frontend/src/lib/conteudo.js` | Diferenciais, textos institucionais |
| `/app/frontend/src/lib/tabelaVendas.js` | Preços, unidades, disponibilidade |
| `/app/backend/server.py` — `compute_lead_score()` | Fórmula do score (150 pts) |
| `/app/backend/server.py` — `compute_temperature()` | Faixas quente/morno/frio |
| Regras do simulador (MCMV/SBPE) | Trocar por regras do novo produto |

### 📱 Contatos e integração
| Constante | Onde |
|---|---|
| `WHATSAPP_PHONE` | `/app/frontend/src/lib/quizData.js` |
| Google Maps embed | `ModuloLocalizacao` (iframe URL) |
| Script Hotjar/Contentsquare | `/app/frontend/public/index.html` |
| Pixel Meta (a instalar) | `/app/frontend/public/index.html` |

---

## 4. Blueprint dos 7 capítulos (padrão do modelo)

Sempre que replicar, siga esta arquitetura de conversão:

| # | Capítulo | Objetivo | Pontos |
|---|---|---|---|
| 1 | **Capa** | Impacto visual, promessa clara, CTA único | 0 |
| 2 | **Produto** (Empreendimento) | Imersão visual + diferenciais mesclados | 25 |
| 3 | **Opções** (Casas/Variantes) | Comparativo lado a lado com escolha | 20 (libera corretor) |
| 4 | **Contexto** (Localização/Detalhes) | Onde/quando/formato | 10 |
| 5 | **Perfil** (Quiz) | Qualificação + captura de contato embedded | 25 |
| 6 | **Calculadora** (Simulador) | Custo/benefício com dados reais | 25 |
| 7 | **Ação** (Corretor) | Escolha entre imediato / agendar / warehouse | 40 (agend.) ou 50 (imed.) |

**Score máximo:** 150 pts. Quente ≥ 90, Morno 45-89, Frio < 45.

---

## 5. Padrões de conversão embutidos

Estes padrões vieram de testes reais e devem ser preservados:

- ✅ **Sem Gate na capa** — captura só no momento de valor (Cap 5)
- ✅ **URLs únicas por capítulo** — tracking de funil no Hotjar/GA4
- ✅ **CTA único por página** com pulso animado + hint "Vire a página"
- ✅ **Toast de pontuação** ao concluir cada capítulo
- ✅ **Anúncio contextual do corretor** ("liberado após cap 3")
- ✅ **Selo "Sua escolha"** quando lead marca uma variante
- ✅ **Selos de confiança** no Simulador ("Sem cadastro", "Sem compromisso")
- ✅ **Lead Warehouse** aberto por padrão para leads fora do perfil
- ✅ **Reset da jornada** disponível no rodapé do Hub

---

## 6. Personalização mínima viável

Ao criar um novo Concierge Digital, o mínimo pra estar no ar:

- [ ] Nova paleta de cores + logo/wordmark no header
- [ ] Copy da Capa (headline + subtext)
- [ ] Fotos do novo produto (galeria + hero + master plan/portfólio)
- [ ] 6-12 perguntas do Quiz com pesos ajustados
- [ ] Regras do Simulador adaptadas (fórmula de cálculo)
- [ ] WhatsApp de atendimento + mensagem pré-preenchida
- [ ] Google Maps embed do local (se aplicável)
- [ ] Endereço no rodapé
- [ ] Meta title/description
- [ ] Reset das constantes em `bookPages.js` se mudar quantidade de capítulos

---

## 7. Integrações mantidas (só reconfigurar chaves)

- **JWT auth** — troca `JWT_SECRET` no `.env`
- **Admin seed** — troca `ADMIN_EMAIL` e `ADMIN_PASSWORD`
- **MongoDB** — Emergent gera nova base automaticamente
- **CORS** — mantém `*` no `.env`
- **Hotjar/Contentsquare** — trocar ID do script se cada projeto tiver o próprio
- **Meta Pixel** — trocar ID por projeto

---

## 8. Verticais recomendadas para replicar

Modelo funciona bem em **produtos de alto ticket com ciclo de decisão longo**:

- 🏗️ Outros lançamentos imobiliários (residencial, comercial, locação premium)
- 🚗 Automotivo (concessionárias, seminovos premium, elétricos)
- 🎓 Educação (MBAs, cursos técnicos, intercâmbio, escolas)
- 💼 B2B consultivo (advocacia, contabilidade, consultoria)
- 🏥 Saúde eletiva (odontologia estética, clínicas premium, planos)
- ✈️ Turismo (viagens sob medida, resorts, cruzeiros)
- 💰 Financeiro (assessoria, seguros complexos, previdência)
- 🎨 Customização (arquitetura, casamentos, eventos corporativos)

---

## 9. Nomenclatura sugerida para novos projetos

- `torres-<empreendimento>` — outros produtos da Torres (ex: `torres-baywood`)
- `<marca>-concierge` — para outros clientes (ex: `honda-concierge`)
- `concierge-<segmento>` — templates internos (ex: `concierge-imob-template`)

---

## 10. Checklist final antes do primeiro deploy

- [ ] Todas as URLs de imagem apontam para os assets do novo produto
- [ ] Copy institucional sem "Torres" ou "Alameda 500" restante
- [ ] WhatsApp testado (link `wa.me` abre no número certo)
- [ ] Simulador retorna valores coerentes com o novo produto
- [ ] Admin login funcionando + senha trocada
- [ ] Meta title mostra nome do novo produto
- [ ] Hotjar/Pixel IDs atualizados
- [ ] `test_credentials.md` reescrito
- [ ] Deploy testado com URL de produção respondendo 200
