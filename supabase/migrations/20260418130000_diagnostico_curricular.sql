-- ============================================================
-- SOMOS — Fluxo de Diagnóstico Curricular
-- Estende `progresso`; cria `diagnosticos` e `sessoes_diagnostico`.
-- RPC: calcular_nivel_competencia, competencias_prioritarias_para_diagnostico.
-- ============================================================

-- ─── progresso: estado + telemetria ─────────────────────────────
alter table public.progresso
  add column if not exists estado text
    not null default 'nao_avaliada'
    check (estado in ('nao_avaliada','em_avaliacao','avaliada')),
  add column if not exists dificuldade_acumulada int not null default 0,
  add column if not exists ultima_tentativa_em timestamptz,
  add column if not exists primeiro_acerto_em timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.progresso_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists progresso_set_updated_at on public.progresso;
create trigger progresso_set_updated_at
  before update on public.progresso
  for each row execute procedure public.progresso_touch_updated_at();

-- RLS do `progresso` (estava sem policies explícitas)
drop policy if exists "Crianca ve o proprio progresso" on public.progresso;
create policy "Crianca ve o proprio progresso" on public.progresso
  for select using (
    crianca_id in (select id from public.criancas where user_id = auth.uid())
  );

drop policy if exists "Familia ve progresso da crianca" on public.progresso;
create policy "Familia ve progresso da crianca" on public.progresso
  for select using (
    crianca_id in (
      select c.id from public.criancas c
      where c.familia_id in (
        select fm.familia_id from public.familia_membros fm
        where fm.profile_id = auth.uid()
      )
    )
  );

-- ─── exercicios: constraint ligeira de dificuldade ──────────────
-- Exercícios de diagnóstico vivem no banco `exercicios` com
-- `tipo_conteudo='curricular'`, `competencia_id` não nulo e
-- `dificuldade` em 1..5. Mantemos compatibilidade com tipos não
-- curriculares (que podem não ter dificuldade).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'exercicios_dificuldade_range'
  ) then
    alter table public.exercicios
      add constraint exercicios_dificuldade_range
      check (dificuldade is null or dificuldade between 1 and 5);
  end if;
end $$;

create index if not exists exercicios_competencia_idx
  on public.exercicios(competencia_id) where competencia_id is not null;
create index if not exists exercicios_curricular_idx
  on public.exercicios(tipo_conteudo, competencia_id, dificuldade)
  where tipo_conteudo = 'curricular';

-- ─── diagnosticos ──────────────────────────────────────────────
create table if not exists public.diagnosticos (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  curriculo text,
  ano_escolar text,
  tipo text not null default 'inicial'
    check (tipo in ('inicial','afinacao')),
  iniciado_em timestamptz not null default now(),
  concluido_em timestamptz,
  competencias_avaliadas int not null default 0,
  estado text not null default 'em_curso'
    check (estado in ('em_curso','concluido','abandonado'))
);

create index if not exists diagnosticos_crianca_idx on public.diagnosticos(crianca_id, estado);

alter table public.diagnosticos enable row level security;

drop policy if exists "Crianca ve os proprios diagnosticos" on public.diagnosticos;
create policy "Crianca ve os proprios diagnosticos" on public.diagnosticos
  for select using (
    crianca_id in (select id from public.criancas where user_id = auth.uid())
  );

drop policy if exists "Familia ve diagnosticos da crianca" on public.diagnosticos;
create policy "Familia ve diagnosticos da crianca" on public.diagnosticos
  for select using (
    crianca_id in (
      select c.id from public.criancas c
      where c.familia_id in (
        select fm.familia_id from public.familia_membros fm
        where fm.profile_id = auth.uid()
      )
    )
  );

-- ─── sessoes_diagnostico ───────────────────────────────────────
create table if not exists public.sessoes_diagnostico (
  id uuid primary key default gen_random_uuid(),
  diagnostico_id uuid not null references public.diagnosticos(id) on delete cascade,
  crianca_id uuid not null references public.criancas(id) on delete cascade,
  competencia_id uuid not null references public.competencias(id),
  exercicio_id uuid not null references public.exercicios(id),
  correcto boolean not null,
  tempo_ms int,
  dificuldade int,
  respondido_em timestamptz not null default now()
);

create index if not exists sessoes_diag_crianca_idx
  on public.sessoes_diagnostico(crianca_id, competencia_id, respondido_em desc);
create index if not exists sessoes_diag_diagnostico_idx
  on public.sessoes_diagnostico(diagnostico_id, respondido_em);

alter table public.sessoes_diagnostico enable row level security;

drop policy if exists "Crianca ve as proprias sessoes diagnostico" on public.sessoes_diagnostico;
create policy "Crianca ve as proprias sessoes diagnostico" on public.sessoes_diagnostico
  for select using (
    crianca_id in (select id from public.criancas where user_id = auth.uid())
  );

drop policy if exists "Familia ve sessoes diagnostico da crianca" on public.sessoes_diagnostico;
create policy "Familia ve sessoes diagnostico da crianca" on public.sessoes_diagnostico
  for select using (
    crianca_id in (
      select c.id from public.criancas c
      where c.familia_id in (
        select fm.familia_id from public.familia_membros fm
        where fm.profile_id = auth.uid()
      )
    )
  );

-- ─── RPC: calcular_nivel_competencia ────────────────────────────
-- Recalcula o nível (0..5) de uma competência, com base nas
-- últimas 10 respostas (diagnóstico + sessões de lição). Abaixo
-- de 3 tentativas fica 'em_avaliacao' com nivel_actual = 0.
create or replace function public.calcular_nivel_competencia(
  p_crianca_id uuid,
  p_competencia_id uuid
)
returns table (
  nivel_actual int,
  estado text,
  tentativas int,
  acertos int
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tentativas int := 0;
  v_acertos int := 0;
  v_taxa numeric := 0;
  v_max_dif_acerto int := 0;
  v_dif_acumulada int := 0;
  v_consistente_alto boolean := false;
  v_tem_media boolean := false;
  v_primeiro_acerto timestamptz;
  v_ultima timestamptz;
  v_nivel int := 0;
  v_estado text := 'nao_avaliada';
begin
  -- Universo de respostas: últimas 10 respostas (diagnóstico + lição) para a competência.
  with respostas as (
    select correcto, coalesce(dificuldade, 1) as dificuldade, respondido_em
      from public.sessoes_diagnostico
      where crianca_id = p_crianca_id and competencia_id = p_competencia_id
    union all
    select s.correcto, coalesce(e.dificuldade, 1) as dificuldade, s.created_at
      from public.sessoes s
      join public.exercicios e on e.id = s.exercicio_id
      where s.crianca_id = p_crianca_id
        and e.competencia_id = p_competencia_id
        and s.correcto is not null
  ),
  ultimas as (
    select * from respostas order by respondido_em desc limit 10
  )
  select
    count(*)::int,
    count(*) filter (where correcto)::int,
    coalesce(max(dificuldade) filter (where correcto), 0)::int,
    coalesce(sum(dificuldade) filter (where correcto), 0)::int,
    -- acertos em dificuldade >= 3 indica capacidade consolidada
    bool_or(correcto and dificuldade >= 3),
    min(respondido_em) filter (where correcto),
    max(respondido_em)
    into
      v_tentativas, v_acertos, v_max_dif_acerto, v_dif_acumulada,
      v_tem_media, v_primeiro_acerto, v_ultima
  from ultimas;

  if v_tentativas < 3 then
    -- Com ao menos 1 tentativa, o estado passa a 'em_avaliacao'.
    v_estado := case when v_tentativas = 0 then 'nao_avaliada' else 'em_avaliacao' end;
    v_nivel := 0;
  else
    v_taxa := v_acertos::numeric / v_tentativas::numeric;
    v_estado := 'avaliada';

    -- Consistência em todas as dificuldades: pelo menos um acerto em 3 faixas distintas.
    select (count(distinct dificuldade) filter (where correcto)) >= 3
      into v_consistente_alto
      from (
        select correcto, coalesce(dificuldade, 1) as dificuldade
          from public.sessoes_diagnostico
          where crianca_id = p_crianca_id and competencia_id = p_competencia_id
        union all
        select s.correcto, coalesce(e.dificuldade, 1)
          from public.sessoes s
          join public.exercicios e on e.id = s.exercicio_id
          where s.crianca_id = p_crianca_id and e.competencia_id = p_competencia_id
            and s.correcto is not null
      ) r;

    if v_taxa >= 0.95 and v_max_dif_acerto >= 4 and v_consistente_alto then
      v_nivel := 5;
    elsif v_taxa >= 0.85 and v_max_dif_acerto >= 4 then
      v_nivel := 4;
    elsif v_taxa >= 0.70 and v_tem_media then
      v_nivel := 3;
    elsif v_taxa >= 0.30 then
      v_nivel := 2;
    else
      v_nivel := 1;
    end if;
  end if;

  insert into public.progresso as p (
    crianca_id, competencia_id,
    nivel_actual, acertos, tentativas,
    estado, dificuldade_acumulada,
    ultima_tentativa_em, primeiro_acerto_em
  )
  values (
    p_crianca_id, p_competencia_id,
    v_nivel, v_acertos, v_tentativas,
    v_estado, v_dif_acumulada,
    v_ultima, v_primeiro_acerto
  )
  on conflict (crianca_id, competencia_id) do update set
    nivel_actual = excluded.nivel_actual,
    acertos = excluded.acertos,
    tentativas = excluded.tentativas,
    estado = excluded.estado,
    dificuldade_acumulada = excluded.dificuldade_acumulada,
    ultima_tentativa_em = coalesce(excluded.ultima_tentativa_em, p.ultima_tentativa_em),
    primeiro_acerto_em = coalesce(p.primeiro_acerto_em, excluded.primeiro_acerto_em);

  nivel_actual := v_nivel;
  estado := v_estado;
  tentativas := v_tentativas;
  acertos := v_acertos;
  return next;
end;
$$;

revoke all on function public.calcular_nivel_competencia(uuid, uuid) from public, anon, authenticated;
grant execute on function public.calcular_nivel_competencia(uuid, uuid) to service_role;

-- ─── RPC: competencias_prioritarias_para_diagnostico ────────────
-- Devolve até 25 competências ainda `nao_avaliada`, com equilíbrio
-- entre áreas, priorizando ordem_dominio baixa e competências com
-- exercícios disponíveis.
create or replace function public.competencias_prioritarias_para_diagnostico(
  p_crianca_id uuid,
  p_curriculo text,
  p_ano text,
  p_limite int default 25
)
returns table (
  competencia_id uuid,
  area text,
  dominio text,
  ordem_dominio int,
  codigo_oficial text,
  descricao text,
  num_exercicios int
)
language sql
security definer
set search_path = public
as $$
  with candidatas as (
    select
      c.id as competencia_id,
      c.area,
      c.dominio,
      coalesce(c.ordem_dominio, 0) as ordem_dominio,
      c.codigo_oficial,
      c.descricao,
      coalesce(
        (select count(*) from public.exercicios e
          where e.competencia_id = c.id
            and e.tipo_conteudo = 'curricular'),
        0
      )::int as num_exercicios,
      coalesce(p.estado, 'nao_avaliada') as estado
    from public.competencias c
    left join public.progresso p
      on p.crianca_id = p_crianca_id and p.competencia_id = c.id
    where c.curriculo = p_curriculo
      and c.ano_escolar = p_ano
      and c.tipo = 'curricular'
  ),
  filtradas as (
    select *
      from candidatas
      where estado = 'nao_avaliada'
  ),
  ranqueadas as (
    select
      f.*,
      row_number() over (
        partition by f.area
        order by f.ordem_dominio asc, f.num_exercicios desc, f.codigo_oficial asc
      ) as rn_area
    from filtradas f
  )
  select competencia_id, area, dominio, ordem_dominio, codigo_oficial, descricao, num_exercicios
    from ranqueadas
    order by rn_area asc, area asc, ordem_dominio asc
    limit p_limite;
$$;

revoke all on function public.competencias_prioritarias_para_diagnostico(uuid, text, text, int) from public, anon, authenticated;
grant execute on function public.competencias_prioritarias_para_diagnostico(uuid, text, text, int) to service_role;
