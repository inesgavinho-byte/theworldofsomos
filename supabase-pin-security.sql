-- Fase 0.2 · Segurança PIN da criança
-- Tabela de tentativas de login (rate limit + lockout por IP)
-- e policies RLS mínimas em criancas.

create table if not exists pin_tentativas (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null,
  user_agent text,
  sucesso boolean not null,
  crianca_id uuid references criancas(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pin_tentativas_ip_created
  on pin_tentativas (ip_address, created_at desc);

create index if not exists idx_pin_tentativas_created
  on pin_tentativas (created_at desc);

alter table pin_tentativas enable row level security;

drop policy if exists "pin_tentativas admin select" on pin_tentativas;
create policy "pin_tentativas admin select" on pin_tentativas
  for select
  using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and (p.tipo = 'admin' or 'admin' = any(coalesce(p.roles, array[]::text[])))
    )
  );

-- RLS em criancas: adultos da família leem, criança lê-se a si própria.
drop policy if exists "criancas select familia" on criancas;
create policy "criancas select familia" on criancas
  for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from familia_membros fm
      where fm.familia_id = criancas.familia_id
        and fm.profile_id = auth.uid()
    )
  );
