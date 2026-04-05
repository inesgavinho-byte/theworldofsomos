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
git clone https://github.com/inesgavinho-byte/somos
cd somos
npm install
cp .env.example .env.local
npm run dev
```

### Variáveis de Ambiente Obrigatórias

```env
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
```

> **Nota:** No Netlify, usar o preset **Next.js** na integração Supabase para garantir o prefixo `NEXT_PUBLIC_` automático.

---

## Autenticação

Dois fluxos separados:

- **Pais** → `/login` (email + password)
- **Crianças** → `/crianca/login` (PIN de 4 dígitos)

O middleware usa `@supabase/ssr` — **nunca** `@supabase/auth-helpers-nextjs`.

### Lógica de Rotas

| Rota | Acesso |
|------|--------|
| `/`, `/login`, `/register`, `/leituras/*`, `/guilda`, `/recuperar-password` | Público |
| `/admin/*` | `tipo = admin` |
| `/crianca/*`, `/licao/*` | `tipo = crianca` ou `admin` |
| `/dashboard`, `/onboarding` | `tipo = pai` ou `admin` |

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
| `/licao/[slug]/exercicios` | Exercícios |
| `/licao/[slug]/reflexao` | Reflexão emocional |
| `/licao/[slug]/momento` | O Momento (pós-sessão) |
| `/familia` | Hub de exercícios em família |
| `/guilda` | Candidaturas — A Guilda |
| `/leituras` | Blog Fonte do Conhecimento |
| `/admin` | Painel admin |
| `/admin/conteudo` | Gerir lições e exercícios |
| `/admin/guilda` | Gerir candidaturas |

---

## Base de Dados

### Tabelas Principais

```
profiles          — utilizadores (pai | crianca | admin)
familias          — famílias e plano de subscrição
familia_membros   — ligação utilizador ↔ família
criancas          — perfil da criança (curriculo, PIN, estrelas, jarros)
competencias      — competências por currículo e dimensão
exercicios        — exercícios com conteúdo JSONB
sessoes           — respostas + reflexão + O Momento
progresso         — progresso por competência
licoes            — metadados das lições (slug, dimensão, tipo)
ninguem_te_conta  — 100 factos do Jarro de Pandora
mailbox_cartas    — The Mail Box
guilda_candidaturas — candidaturas à Guilda
geracoes_ia       — histórico de uploads de livros
```

### Tipos de Conteúdo

- **Universal** — aparece para todas as crianças (Identitária + Social)
- **Curricular** — filtrado pelo currículo da criança (PT, BNCC, Cambridge, IB, FR)

### RLS

Todas as tabelas têm Row Level Security activo. Função auxiliar: `get_user_familia_id()`.

---

## API Routes

| Route | Método | Descrição |
|-------|--------|-----------|
| `/api/gerar-exercicios` | POST | Claude Vision — gera exercícios de imagem/PDF |
| `/api/momento` | POST | Claude API — gera O Momento após sessão |
| `/api/mailbox-resposta-automatica` | POST | Claude API — responde cartas sem resposta (48h) |
| `/api/guilda` | GET + POST | Membros públicos + candidatura |
| `/api/admin/guilda` | GET + PATCH | Aprovar/rejeitar candidaturas |

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

### Tipografia

- **Títulos:** Cormorant Garamond (300, 400, 500, italic)
- **UI:** Nunito (400, 600, 700, 800, 900)
- **Regra:** nunca emojis nativos — sempre SVGs de linha

### Convenções

- A palavra **"problema"** nunca aparece na plataforma
- Erros marcados em **âmbar** com símbolo `~` (nunca vermelho com `×`)
- Personagens aparecem **apenas no feedback**, nunca durante a pergunta
- Linguagem neutra — "a minha família" em vez de "o meu pai"

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
- Netlify Supabase ID: `bkprgvheubsoicwaoiuw`

### Supabase URL Configuration

Em **Authentication → URL Configuration**:
```
Site URL:      https://theworldofsomos.com
Redirect URLs: https://theworldofsomos.com/**
```

### DNS

Domínio `theworldofsomos.com` gerido pelo GoDaddy com nameservers a apontar para o Netlify:
```
dns1.p06.nsone.net
dns2.p06.nsone.net
dns3.p06.nsone.net
dns4.p06.nsone.net
```

---

## Funcionalidades Chave

### O Momento
Gerado pela Claude API no fim de cada sessão. Ecrã dedicado `/licao/[slug]/momento`. Regra: apresentar sempre quem é a figura histórica antes do Momento.

### O Jarro de Pandora
A cada 25 estrelas, o jarro abre. Nome historicamente correcto — *pithos* grego (não "caixa" — erro de Erasmo). Primeiro desbloqueio inclui sempre a história do jarro. **Sem countdown** para o próximo desbloqueio.

### Upload de Livros + IA
Família fotografa página do livro → Claude Vision gera 5 exercícios no idioma do currículo. Limite: 10/dia Premium, 2/dia Free.

### The Mail Box
Cartas anónimas entre membros da comunidade. Sem resposta em 48h → SOMOS responde via Claude API. Sem resposta em 7 dias → transforma-se em conteúdo devolvido ao autor.

### A Guilda
100 colaboradores globais. Máximo 3 por país. Candidaturas em `/guilda`.

---

## Roadmap

### Fase 1 — MVP ✓
Autenticação, dashboards, exercícios, reflexão, O Momento, Jarro de Pandora, 15 lições, admin, landing page, A Guilda, domínio próprio.

### Fase 2 — Diferenciadores
Upload de livros + IA, exercícios em família, The Mail Box, currículos internacionais com conteúdo, Stripe.

### Fase 3 — Crescimento
O Testamento da Criança, O Atlas Pessoal, O Mentor Invisível, A Teia das Civilizações, A Incubadora, A Herança.

---

*SOMOS · theworldofsomos.com · 2026*
