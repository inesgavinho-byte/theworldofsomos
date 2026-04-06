# SECURITY.md — SOMOS

Documento de segurança operacional. Leitura obrigatória antes de fazer deploy ou modificar autenticação, RLS ou API routes.

---

## Modelo de Autenticação

### Adultos (tipo = pai)
- Supabase Auth — email + password
- Sessão gerida via `@supabase/ssr` com cookies HTTP-only
- Middleware verifica `tipo` em `profiles` em cada request protegido

### Crianças (tipo = crianca)
- PIN de 4 dígitos armazenado como **hash bcrypt** no campo `criancas.pin`
- Nunca armazenar ou transmitir PIN em plaintext
- Sessão de criança é independente da sessão do adulto
- **Lockout:** bloquear após 5 tentativas falhadas consecutivas — implementar contador em Redis ou Supabase com TTL de 15 minutos
- PIN configurado exclusivamente pelo adulto autenticado da família

### Admin (tipo = admin)
- Mesmo fluxo que adultos mas com acesso a `/admin/*`
- Promover a admin apenas via SQL directo no Supabase (nunca via UI da plataforma)
- Manter lista de admins reduzida

---

## SUPABASE_SERVICE_ROLE_KEY

A `service_role` bypassa RLS. Usar **apenas** em:
- Cron jobs server-side
- Scripts de migração
- Handlers que precisam de acesso cross-tenant (ex: mailbox automático)

**Nunca:**
- Expor ao cliente (browser)
- Usar em componentes Next.js client-side
- Incluir em variáveis `NEXT_PUBLIC_*`

Verificar periodicamente se aparece em logs, erros ou respostas de API.

---

## Row Level Security (RLS)

RLS activo em todas as tabelas. Função auxiliar central:

```sql
get_user_familia_id() → uuid
-- devolve a família do utilizador autenticado
-- usada nas políticas RLS de todas as tabelas relacionadas com família
```

**RLS não substitui:**
- Validação server-side nos API routes
- Rate limiting
- Verificação de quotas
- Lógica de negócio transacional

Após qualquer alteração de schema, verificar que as políticas RLS continuam correctas.

---

## Rate Limiting

Implementar em todos os endpoints públicos e semi-públicos:

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/api/gerar-exercicios` | 2 req (Free) / 10 req (Premium) | por dia por família |
| `/api/momento` | 20 req | por dia por criança |
| `/api/guilda` POST | 3 req | por hora por IP |
| `/crianca/login` | 5 tentativas | por 15 minutos por criança |
| `/login` | 10 tentativas | por hora por IP |

Implementar com Supabase (contador + timestamp) ou middleware Netlify Edge.

---

## Cron Jobs

Endpoints de cron autenticados via `CRON_SECRET`:

```typescript
// Verificar em todos os handlers de cron:
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

`CRON_SECRET` deve ser uma string aleatória de pelo menos 32 caracteres. Rodar periodicamente.

**Cron jobs activos:**
- Mailbox: verificar cartas sem resposta há 48h → acionar `/api/mailbox-resposta-automatica`
- Mailbox: verificar cartas sem resposta há 7 dias → transformar em conteúdo
- Limpeza: expirar cartas respondidas após 48h de grace period

---

## Validação de Respostas IA

As respostas da Claude API devem ser validadas antes de persistir ou servir ao cliente:

```typescript
// Exemplo: /api/gerar-exercicios
const resposta = JSON.parse(content.text);

// Validar estrutura obrigatória
if (!resposta.exercicios || !Array.isArray(resposta.exercicios)) {
  throw new Error('Resposta IA inválida — estrutura incorrecta');
}

if (resposta.exercicios.length !== 5) {
  throw new Error('Resposta IA inválida — número de exercícios incorrecto');
}

// Validar cada exercício
resposta.exercicios.forEach((ex, i) => {
  if (!ex.pergunta || !ex.opcoes || ex.opcoes.length !== 4) {
    throw new Error(`Exercício ${i} inválido`);
  }
  if (ex.resposta_correcta < 0 || ex.resposta_correcta > 3) {
    throw new Error(`Índice de resposta inválido no exercício ${i}`);
  }
});
```

---

## Uploads de Ficheiros

Endpoint `/api/gerar-exercicios` aceita imagens e PDFs:

- **Validar tipo MIME** server-side — não confiar no `Content-Type` do cliente
- **Limite de tamanho:** imagens 10MB, PDFs 20MB
- **Não guardar base64** na base de dados — usar Supabase Storage
- **Path de storage:** `livros-upload/{familia_id}/{uuid}` — nunca path previsível
- **Converter PDF para imagem** no cliente antes de enviar — não enviar PDFs inteiros à Claude API

---

## Segredos e Rotação de Chaves

| Variável | Frequência de rotação |
|----------|-----------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Semestral ou após saída de colaborador |
| `ANTHROPIC_API_KEY` | Semestral |
| `RESEND_API_KEY` | Semestral |
| `CRON_SECRET` | Trimestral |
| `SUPABASE_JWT_SECRET` | Não rotar sem migração de sessões |

Após rotação, fazer redeploy imediato no Netlify.

---

## Dados de Menores

A plataforma serve crianças menores. Obrigações adicionais:

- PIN e dados da criança acessíveis apenas ao adulto da mesma família
- Sem exposição de dados de crianças a outros utilizadores
- The Mail Box — anonimato garantido entre remetente e respondente
- Conteúdo gerado por IA verificado para adequação à idade antes de servir
- Não usar dados de crianças para treino de modelos

---

## Incident Response

Em caso de suspeita de comprometimento:

1. Revogar imediatamente a chave comprometida no painel do fornecedor
2. Gerar nova chave e actualizar no Netlify
3. Fazer redeploy
4. Verificar logs de acesso nas últimas 24h
5. Notificar utilizadores afectados se dados pessoais expostos

Contacto de segurança: através do repositório GitHub (issue privada).
