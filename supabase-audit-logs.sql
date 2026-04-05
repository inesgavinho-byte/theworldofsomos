-- ============================================================
-- SOMOS — Sistema de Auditoria (Fase 1)
-- audit_logs: rastreabilidade de acções relevantes no sistema
-- ============================================================

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

-- RLS: só admins lêem audit_logs
alter table audit_logs enable row level security;

create policy "admins podem ler audit_logs"
  on audit_logs for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
      and (roles @> array['admin'] or tipo = 'admin')
    )
  );

-- Apenas sistema insere (via service_role) — nunca cliente
create policy "sistema insere audit_logs"
  on audit_logs for insert
  with check (true);

-- Índices para performance
create index if not exists audit_logs_user_id_idx on audit_logs(user_id);
create index if not exists audit_logs_action_idx on audit_logs(action);
create index if not exists audit_logs_created_at_idx on audit_logs(created_at desc);
create index if not exists audit_logs_entity_idx on audit_logs(entity_type, entity_id);
