# ARCHITECTURE.md — SOMOS

Documentação de arquitectura e fluxos críticos do sistema.

---

## Visão Geral

```
Browser (Next.js 14)
    ↕ HTTP / Supabase Realtime
Netlify Edge / Functions
    ↕ Supabase SDK (@supabase/ssr)
Supabase (Auth + PostgreSQL + Storage)
    ↕ REST / SDK
Claude API (Anthropic)
    ↕ SMTP
Resend (email transaccional)
```

---

## Fluxo de Autenticação — Adulto

```
1. POST /login → Supabase Auth (email + password)
2. Supabase devolve session → cookie HTTP-only via @supabase/ssr
3. middleware.ts verifica cookie em cada request
4. Lê profiles.tipo para determinar acesso
5. Redirect conforme tipo: pai → /dashboard, admin → /admin
```

---

## Fluxo de Autenticação — Criança

```
1. POST /crianca/login → PIN introduzido pela criança
2. Server-side: buscar criancas por nome/família
3. bcrypt.compare(pin, criancas.pin)
4. Se válido: criar sessão Supabase com user_id da criança
5. Se inválido: incrementar contador de tentativas
6. Após 5 falhas: lockout de 15 minutos
7. Redirect → /crianca/dashboard
```

> O PIN nunca viaja em plaintext após o formulário. A validação é sempre server-side.

---

## Middleware — Decisão de Rota

```
Request chega ao middleware.ts
    ↓
É rota pública? (/, /login, /register, /leituras/*, /guilda, /recuperar-password)
    → SIM: NextResponse.next() imediatamente
    → NÃO: continuar
    ↓
Tem sessão Supabase válida?
    → NÃO: redirect /login
    → SIM: continuar
    ↓
Qual o tipo do utilizador?
    ↓
admin  → acesso a tudo
pai    → /dashboard, /onboarding, /familia, /leituras
crianca → /crianca/*, /licao/*
outro  → redirect /login
```

---

## Fluxo de uma Lição Completa

```
/crianca/dashboard
    → clica em lição
    
/licao/[slug]
    → capa com animação da dimensão
    → botão "Começar lição"
    
/licao/[slug]/conteudo
    → narrativa da lição
    → botão "Fazer exercícios"
    
/licao/[slug]/exercicios
    → 5 perguntas sequenciais
    → para cada resposta:
        - guardar em sessoes (crianca_id, exercicio_id, correcto, tempo_ms)
        - actualizar progresso
        - acumular estrelas em criancas.estrelas_total
    → personagem aparece apenas no feedback
    → verificar se estrelas % 25 === 0 → marcar jarro desbloqueado
    
/licao/[slug]/reflexao
    → mostrar resultado (5 círculos)
    → seleccionar emoção (4 opções SVG)
    → texto livre "O que aprendeste hoje?"
    → guardar reflexao_emocao e reflexao_texto em sessoes
    → botão "Ver o teu Momento →"
    
/licao/[slug]/momento
    → chamar POST /api/momento com { tema, dimensao, titulo_licao, curriculo }
    → Claude API gera fragmento histórico
    → guardar momento_crianca e momento_adulto em sessoes
    → SE jarro desbloqueado:
        - buscar facto de ninguem_te_conta por índice
        - mostrar animação do Jarro de Pandora
        - incrementar criancas.jarros_abertos
    → botão "Voltar ao meu mundo"
```

---

## Geração de Exercícios com IA (Upload de Livro)

```
/dashboard → botão "Gerar exercícios do livro"
    ↓
Modal de upload
    → imagem (JPG/PNG/HEIC) ou PDF
    → PDF: converter página para base64 via pdf.js no browser
    → preview + seleccionar criança
    ↓
POST /api/gerar-exercicios
    → verificar autenticação
    → verificar quota (geracoes_ia count por família por dia)
    → validar tipo MIME e tamanho
    → guardar ficheiro em Supabase Storage
    → chamar Claude Vision API (claude-opus-4-5) com imagem base64
    → validar estrutura da resposta JSON
    → inserir exercícios em exercicios table
    → criar entrada em geracoes_ia
    → notificar criança no dashboard
```

---

## The Mail Box

```
Estado de uma carta: aguarda → respondida → expirada

DEPOSITAR:
    POST /api/mailbox → inserir em mailbox_cartas (estado: 'aguarda')
    
RESPONDER (comunidade):
    GET /api/mailbox → buscar 1 carta aleatória em estado 'aguarda'
    POST /api/mailbox/[id]/responder → 
        actualizar estado para 'respondida'
        guardar resposta + respondida_by
        notificar autor

CRON — 48h sem resposta:
    buscar cartas em 'aguarda' com created_at < NOW() - INTERVAL '48h'
    para cada carta:
        POST /api/mailbox-resposta-automatica (autenticado com CRON_SECRET)
        Claude API gera resposta empática
        actualizar carta com resposta automática + nota

CRON — 7 dias:
    buscar cartas 'respondida' com respondida_at < NOW() - INTERVAL '7d'
    extrair tema via Claude API (sem guardar conteúdo)
    incrementar mailbox_padroes
    apagar conteúdo da carta
    enviar "transformação" ao autor via dashboard

EXPIRAÇÃO após grace period (48h pós-resposta):
    apagar carta completamente
```

---

## A Guilda — Fluxo de Candidatura

```
/guilda → formulário público
    ↓
POST /api/guilda
    → verificar vagas globais (< 100 aprovados)
    → verificar vagas por país (< 3 aprovados)
    → se sem vagas: oferecer lista de espera
    → inserir em guilda_candidaturas (estado: 'pendente')
    
/admin/guilda → admin revê candidaturas
    PATCH /api/admin/guilda
        → estado: 'aprovado' | 'rejeitado' | 'lista_espera'
        → se aprovado: email via Resend ao candidato
```

---

## Supabase Realtime — Família em Tempo Real

Usado em `/familia/agora` para sincronizar dois dispositivos:

```
Canal: familia-{desafio_id}

Eventos:
    pergunta_iniciada   → ambos os dispositivos recebem a pergunta
    resposta_pai        → pai submeteu resposta
    resposta_crianca    → criança submeteu resposta
    revelar             → ambos revelam respostas simultaneamente

Timeout: 30s → avançar automaticamente se um dos dois não responder
```

---

## Cron Jobs

| Job | Trigger | Endpoint | Auth |
|-----|---------|----------|------|
| Mailbox 48h | Netlify Scheduled Function | `/api/mailbox-resposta-automatica` | CRON_SECRET |
| Mailbox 7d | Netlify Scheduled Function | `/api/mailbox-transformar` | CRON_SECRET |
| Limpeza cartas | Netlify Scheduled Function | `/api/mailbox-limpar` | CRON_SECRET |

Configurar em `netlify.toml`:
```toml
[functions."mailbox-48h"]
  schedule = "0 */6 * * *"  # cada 6 horas
```

---

## Modelos de Dados — Campos Críticos

### criancas
```sql
estrelas_total      INTEGER DEFAULT 0    -- acumuladas globalmente
jarros_abertos      INTEGER DEFAULT 0    -- número de jarros abertos
primeiro_jarro_visto BOOLEAN DEFAULT false -- controla a história de Erasmo
pin                 TEXT                  -- hash bcrypt do PIN
```

### sessoes
```sql
momento_crianca     TEXT    -- frase gerada pela IA para a criança
momento_adulto      TEXT    -- frase gerada pela IA para o adulto
reflexao_emocao     TEXT    -- desafiada | tranquila | curiosa | confusa
reflexao_texto      TEXT    -- resposta livre à pergunta "O que aprendeste?"
```

### competencias
```sql
tipo                TEXT    -- 'universal' | 'curricular'
curriculo           TEXT    -- 'PT' | 'BNCC' | 'Cambridge' | 'IB' | 'FR'
idioma              TEXT    -- 'pt-PT' | 'pt-BR' | 'en' | 'fr'
```

---

## Convenções de Código

- Lições novas → adicionar ao Supabase **e** ao array `LICOES_INFO` em `app/licao/[slug]/page.tsx`
- Conteúdo de lições → `lib/licoes/[slug].ts` — nunca hardcoded em componentes
- Dimensões → sempre lowercase sem acentos: `identitaria`, `naturalista`, `logica`, `artistica`, `social`
- Currículos → sempre: `PT`, `BNCC`, `Cambridge`, `IB`, `FR`
- Rotas públicas → declarar em `PUBLIC_PREFIXES` no `middleware.ts`
- `SUPABASE_SERVICE_ROLE_KEY` → apenas em server-side, nunca em `NEXT_PUBLIC_*`
