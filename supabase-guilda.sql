-- ============================================================
-- A Guilda — SOMOS
-- 100 pessoas. 100 nações.
-- Cada uma com algo que só ela pode trazer.
-- ============================================================

-- Tabela principal de candidaturas à Guilda
create table if not exists guilda_candidaturas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  pais text not null,
  pais_codigo text not null, -- ISO 3166-1 alpha-2
  perfil text not null check (perfil in (
    'criador_conteudo', 'especialista_curriculo',
    'tradutor', 'educador', 'pai_mae', 'outro'
  )),
  perfil_descricao text, -- se "outro"
  motivacao text not null, -- "Porque queres fazer parte da Guilda?"
  contribuicao text not null, -- "O que trazes?"
  linkedin text,
  website text,
  estado text default 'pendente' check (estado in (
    'pendente', 'aprovado', 'rejeitado', 'lista_espera'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Vista para contar aprovados por país
create or replace view guilda_vagas_pais as
select pais_codigo, count(*) as aprovados
from guilda_candidaturas
where estado = 'aprovado'
group by pais_codigo;

-- Vista para contar total de aprovados
create or replace view guilda_total_aprovados as
select count(*) as total
from guilda_candidaturas
where estado = 'aprovado';

-- Índices para performance
create index if not exists idx_guilda_candidaturas_pais_codigo
  on guilda_candidaturas(pais_codigo);

create index if not exists idx_guilda_candidaturas_estado
  on guilda_candidaturas(estado);

create index if not exists idx_guilda_candidaturas_email
  on guilda_candidaturas(email);

-- Trigger para atualizar updated_at
create or replace function update_guilda_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger guilda_candidaturas_updated_at
  before update on guilda_candidaturas
  for each row execute function update_guilda_updated_at();

-- RLS (Row Level Security)
alter table guilda_candidaturas enable row level security;

-- Qualquer pessoa pode inserir uma candidatura (página pública)
create policy "guilda_insert_public"
  on guilda_candidaturas for insert
  with check (true);

-- Membros aprovados são visíveis publicamente (apenas campos não sensíveis)
-- A leitura pública é feita via API route com service role para dados admin,
-- e via select limitado para dados públicos (membros aprovados).
create policy "guilda_select_aprovados_public"
  on guilda_candidaturas for select
  using (estado = 'aprovado');

-- Admins podem ler e atualizar tudo (via service role key, sem RLS)
-- As rotas admin usam supabaseAdmin que bypassa RLS.
