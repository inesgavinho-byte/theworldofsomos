-- ============================================================
-- Rede de pré-requisitos — RPC obter_plano_consolidacao
-- Percorre competencia_pre_requisitos a partir de uma competência-alvo
-- e devolve o plano ordenado para consolidar as bases em falta.
-- ============================================================

create or replace function public.obter_plano_consolidacao(
  p_crianca_id uuid,
  p_competencia_id uuid
)
returns table (
  passo int,
  competencia_id uuid,
  codigo_oficial text,
  area text,
  dominio text,
  descricao text,
  ano_escolar text,
  nivel_actual int,
  estado text,
  bloqueador boolean,
  tipo_ligacao text
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_autorizado boolean;
begin
  if v_user_id is null then
    raise exception 'Não autenticado.' using errcode = '42501';
  end if;

  select exists (
    select 1 from criancas c
    where c.id = p_crianca_id
      and (
        c.user_id = v_user_id
        or c.familia_id in (
          select fm.familia_id from familia_membros fm where fm.profile_id = v_user_id
        )
      )
  ) into v_autorizado;

  if not v_autorizado then
    raise exception 'Acesso não autorizado a esta criança.' using errcode = '42501';
  end if;

  return query
  with recursive rede as (
    -- Raiz: a competência-alvo (profundidade 0)
    select
      c.id as competencia_id,
      c.codigo_oficial,
      c.area,
      c.dominio,
      c.descricao,
      c.ano_escolar,
      0 as profundidade,
      'alvo'::text as tipo_ligacao,
      null::text as tipo_prereq,
      coalesce(pr.nivel_actual, 0) as nivel_actual,
      coalesce(pr.estado, 'nao_avaliada') as estado
    from competencias c
    left join progresso pr
      on pr.crianca_id = p_crianca_id and pr.competencia_id = c.id
    where c.id = p_competencia_id

    union all

    -- Descida: pré-requisitos directos do nó actual
    select
      pc.id,
      pc.codigo_oficial,
      pc.area,
      pc.dominio,
      pc.descricao,
      pc.ano_escolar,
      r.profundidade + 1,
      case cpr.tipo
        when 'forte' then 'pre_requisito_forte'
        else 'pre_requisito_sugerido'
      end,
      cpr.tipo,
      coalesce(pr.nivel_actual, 0),
      coalesce(pr.estado, 'nao_avaliada')
    from rede r
    join competencia_pre_requisitos cpr on cpr.competencia_id = r.competencia_id
    join competencias pc on pc.id = cpr.pre_requisito_id
    left join progresso pr
      on pr.crianca_id = p_crianca_id and pr.competencia_id = pc.id
    where r.profundidade < 3
      and pc.id <> r.competencia_id
      and (
        r.profundidade = 0
        or (r.tipo_prereq = 'forte'
            and (r.nivel_actual < 3 or r.estado = 'nao_avaliada'))
        or (r.tipo_prereq = 'sugerido' and r.nivel_actual < 2)
      )
  ),
  -- Se a mesma competência aparecer em vários caminhos, manter a ocorrência
  -- mais profunda (mais básica na rede).
  deduplicado as (
    select distinct on (r.competencia_id)
      r.competencia_id,
      r.codigo_oficial,
      r.area,
      r.dominio,
      r.descricao,
      r.ano_escolar,
      r.profundidade,
      r.tipo_ligacao,
      r.tipo_prereq,
      r.nivel_actual,
      r.estado
    from rede r
    order by r.competencia_id, r.profundidade desc
  ),
  filtrado as (
    select *
    from deduplicado d
    where d.tipo_ligacao = 'alvo'
       or (d.tipo_prereq = 'forte'
           and (d.nivel_actual < 3 or d.estado = 'nao_avaliada'))
       or (d.tipo_prereq = 'sugerido' and d.nivel_actual < 2)
  )
  select
    row_number() over (
      order by f.profundidade desc,
               f.ano_escolar nulls last,
               f.area,
               f.codigo_oficial
    )::int as passo,
    f.competencia_id,
    f.codigo_oficial,
    f.area,
    f.dominio,
    f.descricao,
    f.ano_escolar,
    f.nivel_actual::int,
    f.estado,
    (f.tipo_prereq = 'forte' and f.nivel_actual < 3) as bloqueador,
    f.tipo_ligacao
  from filtrado f;
end;
$$;

revoke all on function public.obter_plano_consolidacao(uuid, uuid) from public, anon;
grant execute on function public.obter_plano_consolidacao(uuid, uuid) to authenticated;
