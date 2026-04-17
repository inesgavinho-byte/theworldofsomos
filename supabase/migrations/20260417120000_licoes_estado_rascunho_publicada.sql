-- ============================================================
-- SOMOS — Fase 0.1
-- Acrescentar estado rascunho/publicada à tabela licoes
-- ============================================================
--
-- Rascunhos só são visíveis a admins. Publicadas visíveis a
-- qualquer utilizador autenticado (mantendo a restrição ativo=true).
-- Admins continuam a ler todos os registos através da política
-- licoes_all_admin já existente.
-- ============================================================

-- 1. Coluna estado — idempotente
alter table public.licoes
  add column if not exists estado text;

-- 2. Backfill: lições existentes nascem publicadas
update public.licoes
  set estado = 'publicada'
  where estado is null;

-- 3. Default para novos registos + NOT NULL + CHECK
alter table public.licoes
  alter column estado set default 'rascunho';

alter table public.licoes
  alter column estado set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'licoes_estado_check'
      and conrelid = 'public.licoes'::regclass
  ) then
    alter table public.licoes
      add constraint licoes_estado_check
      check (estado in ('rascunho', 'publicada'));
  end if;
end $$;

-- 4. RLS — substituir licoes_select_authenticated para exigir
--    estado='publicada'. Política admin continua intacta.
drop policy if exists "licoes_select_authenticated" on public.licoes;

create policy "licoes_select_authenticated"
  on public.licoes
  for select
  to authenticated
  using (ativo = true and estado = 'publicada');

-- Índice para filtro por estado (útil quando o volume crescer)
create index if not exists licoes_estado_idx on public.licoes(estado);
