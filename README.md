# SOMOS — Plataforma de Continuidade Educativa Familiar

> *Sei de onde venho. Sei onde estou. Descubro quem sou. Tenho quem me apoie.*

**theworldofsomos.com** — Uma plataforma que forma seres humanos inteiros, independentemente da escola que frequentam.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + inline styles |
| Backend / Auth / DB | Supabase (Auth + PostgreSQL + Storage) |
| IA | Claude API — claude-opus-4-5 |
| Deploy | Netlify (deploy automático da `main`) |
| Email | Resend |
| Analytics | PostHog |

---

## Setup Local

```bash
git clone https://github.com/inesgavinho-byte/theworldofsomos
cd theworldofsomos
npm install
cp .env.example .env.local
# preencher .env.local com as variáveis abaixo
npm run dev
# http://localhost:3000
```

### Variáveis de Ambiente Obrigatórias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Cron (obrigatório em produção)
CRON_SECRET=...

# Stripe (Fase 2 — não activo ainda)
# STRIPE_SECRET_KEY=sk_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

> **Nota Netlify:** usar o preset **Next.js** na integração Supabase para garantir o prefixo `NEXT_PUBLIC_` automático.

---

## Autenticação

Dois fluxos separados e intencionais:

- **Pais** → `/login` — email + password via Supabase Auth
- **Crianças** → `/crianca/login` — PIN de 4 dígitos (hash bcrypt em `criancas.pin`)

O middleware usa **`@supabase/ssr`** — nunca `@supabase/auth-helpers-nextjs` (não existe neste projecto).

### Protecção do PIN Infantil

- PIN armazenado como hash bcrypt — nunca em plaintext
- Lockout após 5 tentativas falhadas consecutivas
- PIN configurado pelo adulto em `/configurar-pin/[criancaId]`
- Sessão de criança isolada da sessão do adulto

### Lógica de Rotas (middleware.ts)

| Rota | Acesso |
|------|--------|
| `/`, `/login`, `/register`, `/leituras/*`, `/guilda`, `/recuperar-password` | Público |
| `/admin/*` | `tipo = admin` |
| `/crianca/*`, `/licao/*` | `tipo = crianca` ou `admin` |
| `/dashboard`, `/onboarding` | `tipo = pai` ou `admin` |
| Sem sessão | → redirect `/login` |

### Promover Utilizador a Admin

```sql
INSERT INTO profiles (id, nome, tipo)
SELECT id, email, 'admin' FROM auth.users
WHERE email = 'SEU_EMAIL'
ON CONFLICT (id) DO UPDATE SET tipo = 'admin';
```

---

## Mapa de Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page |
| `/login` | Login do adulto |
| `/register` | Registo |
| `/recuperar-password` | Reset de password |
| `/dashboard` | Dashboard do adulto |
| `/onboarding` | Criar perfil do filho |
| `/configurar-pin/[criancaId]` | Definir PIN da criança |
| `/crianca/login` | Login da criança (PIN) |
| `/crianca/dashboard` | Dashboard da criança |
| `/licao/[slug]` | Capa da lição |
| `/licao/[slug]/conteudo` | Conteúdo narrativo |
| `/licao/[slug]/exercicios` | Exercícios (5 por sessão) |
| `/licao/[slug]/reflexao` | Reflexão emocional |
| `/licao/[slug]/momento` | O Momento (ecrã dedicado pós-sessão) |
| `/familia` | Hub de exercícios em família |
| `/familia/agora` | Desafio em tempo real (Supabase Realtime) |
| `/guilda` | Candidaturas — A Guilda |
| `/leituras` | Blog Fonte do Conhecimento |
| `/admin` | Painel admin |
| `/admin/conteudo` | Gerir lições e exercícios |
| `/admin/guilda` | Gerir candidaturas |

---

## Base de Dados

### Tabelas Principais

```
profiles            — utilizadores (pai | crianca | admin)
familias            — famílias e plano (free | premium | trial)
familia_membros     — ligação utilizador ↔ família + papel
criancas            — perfil (curriculo, PIN hash, estrelas, jarros)
competencias        — competências por currículo, dimensão e tipo
exercicios          — exercícios com conteúdo JSONB
sessoes             — respostas + reflexão + O Momento
progresso           — progresso por competência
licoes              — metadados das lições (slug, dimensão, tipo)
ninguem_te_conta    — 100 factos desbloqueáveis (Jarro de Pandora)
mailbox_cartas      — The Mail Box (cartas anónimas)
guilda_candidaturas — candidaturas à Guilda
geracoes_ia         — histórico de uploads de livros + exercícios gerados
desafios_familia    — desafios em família (tempo_real | assincrono | fisico)
```

### Tipos de Conteúdo

- **Universal** — aparece para todas as crianças (dimensões Identitária + Social)
- **Curricular** — filtrado pelo currículo da criança (PT, BNCC, Cambridge, IB, FR)

### RLS

Todas as tabelas têm Row Level Security activo.
Função auxiliar: `get_user_familia_id()` — devolve a família do utilizador autenticado.

> **Atenção:** RLS é necessário mas não suficiente. Ver `SECURITY.md` para hardening completo.

---

## API Routes

| Route | Método | Acesso | Descrição |
|-------|--------|--------|-----------|
| `/api/gerar-exercicios` | POST | Autenticado | Claude Vision — gera exercícios de imagem/PDF |
| `/api/momento` | POST | Autenticado | Claude API — gera O Momento após sessão |
| `/api/mailbox-resposta-automatica` | POST | CRON_SECRET | Claude API — responde cartas após 48h |
| `/api/guilda` | GET + POST | Público / Autenticado | Membros + candidatura |
| `/api/admin/guilda` | GET + PATCH | Admin | Aprovar/rejeitar candidaturas |

### Regras de Quota (aplicadas server-side)

| Funcionalidade | Free | Premium |
|---------------|------|---------|
| Upload de livros / geração IA | 2/dia | 10/dia |
| Guilda — vagas por país | — | máx. 3 aprovados |
| Guilda — total global | — | máx. 100 aprovados |

---

## Sistema de Design

### Dimensões e Cores

| Dimensão | Tint | Texto | Card |
|----------|------|-------|------|
| Identitária | `#a78bfa` | `#534ab7` | `#2a2250` |
| Naturalista | `#4ade80` | `#2d5c3a` | `#1e3d28` |
| Lógica | `#60a5fa` | `#185fa5` | `#0f1a2e` |
| Artística | `#f472b6` | `#993556` | `#3d1a2e` |
| Social | `#facc15` | `#854f0b` | `#2a1f0a` |

Fundos: pai `#ede9e1` · criança `#f5f2ec` · texto `#1a1714` · secundário `#a09080`

### Tipografia

- **Títulos:** Cormorant Garamond (300, 400, 500, italic)
- **UI:** Nunito (400, 600, 700, 800, 900)
- **Regra:** nunca emojis nativos — sempre SVGs de linha

### Convenções Editoriais

- A palavra **"problema"** nunca aparece na plataforma
- Erros marcados em **âmbar** com símbolo `~` (nunca vermelho com `×`)
- Personagens aparecem **apenas no feedback**, nunca durante a pergunta
- Linguagem neutra — "a minha família" em vez de "o meu pai"
- Jarro de Pandora: sem countdown para próximo desbloqueio — surpresa preservada

---

## Personagens

13 personagens em `/public/assets/personagens/`:

| Personagem | Dimensão |
|-----------|---------|
| Maya, Mayasalta, Sofia, Sofia_experiencias | Naturalista |
| Kenji, Finn, Ibrahim, Leo | Lógica |
| Yuki, Sara | Artística |
| Nora, Kwame | Social |
| Tomas, Layla | Identitária |

Vídeos animados: `MAYA.mp4`, `Amara.mp4`

**Máscara para fundir fundo preto:**
```css
mask-image: radial-gradient(ellipse 90% 80% at 50% 55%, transparent 30%, black 80%),
            linear-gradient(to top, black 0%, transparent 45%);
```

---

## Deploy

### Netlify

- Deploy automático de commits na branch **`main`**
- Branches `claude/*` **não** fazem deploy — fazer merge para `main`
- Build: `npm run build`

### Supabase URL Configuration

Em **Authentication → URL Configuration**:
```
Site URL:      https://theworldofsomos.com
Redirect URLs: https://theworldofsomos.com/**
```

### DNS

`theworldofsomos.com` (GoDaddy) com nameservers a apontar para Netlify:
```
dns1.p06.nsone.net
dns2.p06.nsone.net
dns3.p06.nsone.net
dns4.p06.nsone.net
```

---

## Observabilidade

| Camada | Ferramenta |
|--------|-----------|
| Analytics de produto | PostHog |
| Erros de frontend | PostHog + console Netlify |
| Logs de API | Netlify Functions logs |
| Custos Claude | Anthropic Console |
| Cron jobs | Logs Netlify + alertas manuais |

**Monitorizar activamente:**
- Custo diário da Claude API
- Taxa de erro em `/api/gerar-exercicios` e `/api/momento`
- Candidaturas pendentes na Guilda

---

## Segurança

Ver [`SECURITY.md`](./SECURITY.md) para documentação completa.

---

## Roadmap

### Fase 1 — MVP ✓
Autenticação, dashboards, exercícios, reflexão, O Momento, Jarro de Pandora, 15 lições, admin, landing page, A Guilda, domínio próprio.

### Fase 2 — Diferenciadores
Upload de livros + IA, exercícios em família, The Mail Box, currículos internacionais, Stripe.

### Fase 3 — Crescimento
O Testamento da Criança, O Atlas Pessoal, O Mentor Invisível, A Teia das Civilizações, A Incubadora, A Herança.

---

*SOMOS · theworldofsomos.com · 2026*
