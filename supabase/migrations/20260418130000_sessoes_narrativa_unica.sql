-- Idempotência: uma única linha narrativa (com momento_entregue_em) por
-- par (crianca_id, licao_id). Serve de lock contra double-submit.
create unique index if not exists sessoes_conclusao_unica_idx
  on public.sessoes(crianca_id, licao_id)
  where tipo = 'narrativa';
