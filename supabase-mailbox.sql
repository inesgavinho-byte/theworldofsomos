-- ============================================
-- SOMOS — The Mail Box Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Cartas da caixa de correio
CREATE TABLE IF NOT EXISTS mailbox_cartas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_id uuid REFERENCES profiles,
  conteudo text NOT NULL,
  estado text DEFAULT 'aguarda' CHECK (estado IN ('aguarda', 'respondida')),
  respondida_por uuid REFERENCES profiles,
  resposta text,
  created_at timestamptz DEFAULT now(),
  respondida_at timestamptz,
  expires_at timestamptz -- calculado: quando receber resposta + 48h de grace period
);

ALTER TABLE mailbox_cartas ENABLE ROW LEVEL SECURITY;

-- Autor vê as suas próprias cartas (com todos os campos)
CREATE POLICY "autor_ve_propria_carta" ON mailbox_cartas
  FOR SELECT
  USING (auth.uid() = autor_id);

-- Utilizadores autenticados vêem cartas em aguarda (sem autor_id — usar view)
-- Nota: a query pública deve NUNCA seleccionar autor_id
CREATE POLICY "autenticado_ve_cartas_aguarda" ON mailbox_cartas
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND estado = 'aguarda'
    AND autor_id != auth.uid()
  );

-- Qualquer utilizador autenticado pode inserir uma carta
CREATE POLICY "autenticado_insere_carta" ON mailbox_cartas
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = autor_id);

-- Qualquer utilizador autenticado pode actualizar cartas em aguarda (para responder)
-- mas não pode alterar autor_id nem conteudo
CREATE POLICY "autenticado_responde_carta" ON mailbox_cartas
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL
    AND estado = 'aguarda'
    AND autor_id != auth.uid()
  );

-- Admin pode apagar cartas problemáticas
CREATE POLICY "admin_apaga_carta" ON mailbox_cartas
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- ============================================
-- Padrões detectados pela IA (análise agregada)
-- Nunca ligado a cartas individuais após análise
-- ============================================
CREATE TABLE IF NOT EXISTS mailbox_padroes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tema text,
  frequencia int DEFAULT 1,
  primeiro_visto timestamptz DEFAULT now(),
  ultimo_visto timestamptz DEFAULT now()
);

ALTER TABLE mailbox_padroes ENABLE ROW LEVEL SECURITY;

-- Apenas admins vêem padrões
CREATE POLICY "admin_ve_padroes" ON mailbox_padroes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );
