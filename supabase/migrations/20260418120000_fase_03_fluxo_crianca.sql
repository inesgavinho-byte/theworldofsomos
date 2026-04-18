-- ============================================================
-- Fase 0.3 — Fluxo da criança
-- sessoes: colunas em falta · jarros_abertos: tabela · RPC estrelas
-- ============================================================

alter table public.sessoes
  add column if not exists licao_id uuid references public.licoes(id),
  add column if not exists titulo_licao text,
  add column if not exists slug_licao text,
  add column if not exists tipo text default 'exercicio' check (tipo in ('exercicio', 'reflexao', 'narrativa')),
  add column if not exists momento_historico text,
  add column if not exists momento_crianca text,
  add column if not exists momento_adulto text,
  add column if not exists momento_entregue_em timestamptz;

create index if not exists sessoes_crianca_licao_idx on public.sessoes(crianca_id, licao_id);
create index if not exists sessoes_crianca_tipo_idx on public.sessoes(crianca_id, tipo);

drop policy if exists "Crianca pode ler as proprias sessoes" on public.sessoes;
create policy "Crianca pode ler as proprias sessoes" on public.sessoes
  for select using (
    crianca_id in (select id from public.criancas where user_id = auth.uid())
  );

drop policy if exists "Familia pode ler sessoes da crianca" on public.sessoes;
create policy "Familia pode ler sessoes da crianca" on public.sessoes
  for select using (
    crianca_id in (
      select c.id from public.criancas c
      where c.familia_id in (
        select fm.familia_id from public.familia_membros fm where fm.profile_id = auth.uid()
      )
    )
  );

create table if not exists public.jarros_abertos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  numero int not null,
  facto_id int references public.ninguem_te_conta(id),
  eh_primeiro boolean not null default false,
  estrelas_no_momento int,
  data_desbloqueio timestamptz default now(),
  unique (crianca_id, numero)
);

create index if not exists jarros_abertos_crianca_idx on public.jarros_abertos(crianca_id);

alter table public.jarros_abertos enable row level security;

drop policy if exists "Crianca ve os proprios jarros" on public.jarros_abertos;
create policy "Crianca ve os proprios jarros" on public.jarros_abertos
  for select using (
    crianca_id in (select id from public.criancas where user_id = auth.uid())
  );

drop policy if exists "Familia ve jarros da crianca" on public.jarros_abertos;
create policy "Familia ve jarros da crianca" on public.jarros_abertos
  for select using (
    crianca_id in (
      select c.id from public.criancas c
      where c.familia_id in (
        select fm.familia_id from public.familia_membros fm where fm.profile_id = auth.uid()
      )
    )
  );

create or replace function public.incrementar_estrelas(
  p_crianca_id uuid,
  p_estrelas int
)
returns int
language plpgsql
security definer
as $$
declare
  v_total int;
begin
  update public.criancas
    set estrelas_total = coalesce(estrelas_total, 0) + p_estrelas
    where id = p_crianca_id
    returning estrelas_total into v_total;
  return v_total;
end;
$$;

revoke all on function public.incrementar_estrelas(uuid, int) from public, anon, authenticated;
grant execute on function public.incrementar_estrelas(uuid, int) to service_role;
