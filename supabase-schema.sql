-- ============================================
-- SOMOS — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Perfis de utilizador
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  nome text,
  tipo text CHECK (tipo IN ('pai', 'crianca', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Famílias
CREATE TABLE IF NOT EXISTS familias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text,
  plano text DEFAULT 'free' CHECK (plano IN ('free', 'premium', 'trial')),
  stripe_customer_id text,
  created_at timestamptz DEFAULT now()
);

-- Membros da família
CREATE TABLE IF NOT EXISTS familia_membros (
  familia_id uuid REFERENCES familias,
  profile_id uuid REFERENCES profiles,
  papel text CHECK (papel IN ('pai', 'mae', 'avo', 'irmao', 'outro')),
  PRIMARY KEY (familia_id, profile_id)
);

-- Crianças
CREATE TABLE IF NOT EXISTS criancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid REFERENCES familias,
  nome text,
  data_nascimento date,
  escola text,
  curriculo text DEFAULT 'PT' CHECK (curriculo IN ('PT', 'BNCC', 'Cambridge', 'IB', 'FR', 'outro')),
  ano_escolar text,
  pais text,
  estilo_aprendizagem text,
  pin text,
  user_id uuid REFERENCES auth.users
);

-- Competências
CREATE TABLE IF NOT EXISTS competencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimensao text,
  area text,
  nivel int,
  descricao text,
  curriculo text,
  idioma text DEFAULT 'pt-PT',
  ano_escolar text
  -- ano_escolar: '3', '4', '5' para PT | 'Year 3' para Cambridge | 'Grade 3' para IB | 'CE2' para FR
);

-- Progresso
CREATE TABLE IF NOT EXISTS progresso (
  crianca_id uuid REFERENCES criancas,
  competencia_id uuid REFERENCES competencias,
  nivel_actual int DEFAULT 0,
  acertos int DEFAULT 0,
  tentativas int DEFAULT 0,
  PRIMARY KEY (crianca_id, competencia_id)
);

-- Exercícios
CREATE TABLE IF NOT EXISTS exercicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia_id uuid REFERENCES competencias,
  tipo text,
  conteudo jsonb,
  dificuldade int,
  metodo_ensino text,
  idioma text DEFAULT 'pt-PT'
);

-- Sessões
CREATE TABLE IF NOT EXISTS sessoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crianca_id uuid REFERENCES criancas,
  exercicio_id uuid REFERENCES exercicios,
  resposta jsonb,
  correcto boolean,
  tempo_ms int,
  reflexao_emocao text,
  reflexao_texto text,
  created_at timestamptz DEFAULT now()
);

-- Gerações IA (upload de livros + exercícios gerados)
CREATE TABLE IF NOT EXISTS geracoes_ia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid REFERENCES familias,
  crianca_id uuid REFERENCES criancas,
  tipo_upload text CHECK (tipo_upload IN ('foto', 'pdf', 'imagem')),
  storage_path text,
  curriculo text,
  ano_escolar text,
  exercicios_gerados jsonb,
  estado text DEFAULT 'pendente' CHECK (estado IN ('pendente', 'processando', 'concluido', 'erro')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE geracoes_ia ENABLE ROW LEVEL SECURITY;

-- Apenas membros da família podem ver/inserir as suas gerações
CREATE POLICY "Familia pode gerir geracoes_ia" ON geracoes_ia
  FOR ALL USING (familia_id = get_user_familia_id());

-- ============================================
-- Supabase Storage — bucket livros-upload
-- Criar manualmente no dashboard:
--   bucket: livros-upload (private)
--   política: utilizador autenticado pode fazer upload para {familia_id}/{uuid}
-- ============================================

-- Desafios família
CREATE TABLE IF NOT EXISTS desafios_familia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id uuid REFERENCES familias,
  crianca_id uuid REFERENCES criancas,
  tipo text,
  conteudo jsonb,
  estado text,
  respostas jsonb,
  -- Campos adicionados para Jogar em Família
  modo text CHECK (modo IN ('tempo_real', 'assincrono', 'fisico')),
  criado_por uuid REFERENCES profiles,
  expires_at timestamptz,
  respostas_pai jsonb,
  respostas_crianca jsonb,
  created_at timestamptz DEFAULT now()
);

-- Migration: adicionar colunas se a tabela já existir
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS modo text CHECK (modo IN ('tempo_real', 'assincrono', 'fisico'));
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS criado_por uuid REFERENCES profiles;
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS expires_at timestamptz;
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS respostas_pai jsonb;
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS respostas_crianca jsonb;
ALTER TABLE desafios_familia ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Configuração de currículos
CREATE TABLE IF NOT EXISTS curriculos_config (
  codigo text PRIMARY KEY,
  nome text,
  idioma text,
  idioma_codigo text, -- 'pt-PT', 'pt-BR', 'en', 'fr'
  anos_escolares jsonb, -- ['1','2','3','4','5','6','7','8','9']
  anos_display jsonb,   -- ['1.º ano', '2.º ano', ...] ou ['Year 1', 'Year 2', ...]
  ativo boolean DEFAULT true
);

INSERT INTO curriculos_config VALUES
  ('PT',        'Currículo Nacional',           'Português',  'pt-PT',
   '["1","2","3","4","5","6","7","8","9"]',
   '["1.º ano","2.º ano","3.º ano","4.º ano","5.º ano","6.º ano","7.º ano","8.º ano","9.º ano"]',
   true),
  ('BNCC',      'Base Nacional (Brasil)',        'Português',  'pt-BR',
   '["1","2","3","4","5","6","7","8","9"]',
   '["1.º ano","2.º ano","3.º ano","4.º ano","5.º ano","6.º ano","7.º ano","8.º ano","9.º ano"]',
   true),
  ('Cambridge', 'Cambridge International',      'English',    'en',
   '["1","2","3","4","5","6","7","8","9"]',
   '["Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9"]',
   true),
  ('IB',        'International Baccalaureate',  'English',    'en',
   '["1","2","3","4","5","6","7","8","9","10"]',
   '["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"]',
   true),
  ('FR',        'Éducation Nationale',          'Français',   'fr',
   '["CP","CE1","CE2","CM1","CM2","6","5","4","3"]',
   '["CP","CE1","CE2","CM1","CM2","6ème","5ème","4ème","3ème"]',
   true)
ON CONFLICT (codigo) DO NOTHING;

-- ============================================
-- RLS: Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE familias ENABLE ROW LEVEL SECURITY;
ALTER TABLE familia_membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE criancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE desafios_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculos_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Competencias: public read
CREATE POLICY "Competencias are public" ON competencias
  FOR SELECT USING (true);

-- Exercicios: public read
CREATE POLICY "Exercicios are public" ON exercicios
  FOR SELECT USING (true);

-- Curriculos config: public read
CREATE POLICY "Curriculos config are public" ON curriculos_config
  FOR SELECT USING (true);

-- ============================================
-- Helper function
-- ============================================

CREATE OR REPLACE FUNCTION get_user_familia_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT familia_id FROM familia_membros WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- ============================================
-- Trigger: auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, tipo)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nome',
    'pai'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================
-- Promote user to admin
-- (Replace SEU_EMAIL with actual email)
-- ============================================
-- INSERT INTO profiles (id, nome, tipo)
-- SELECT id, email, 'admin' FROM auth.users
-- WHERE email = 'SEU_EMAIL'
-- ON CONFLICT (id) DO UPDATE SET tipo = 'admin';

-- ============================================
-- Migration: multi-curriculum support
-- Run these if the tables already exist
-- ============================================

-- Update criancas constraint to support all curricula
-- alter table criancas drop constraint if exists criancas_curriculo_check;
-- alter table criancas add constraint criancas_curriculo_check
--   check (curriculo in ('PT', 'BNCC', 'Cambridge', 'IB', 'FR', 'outro'));
-- alter table criancas add column if not exists ano_escolar text;

-- Add idioma and ano_escolar to competencias
-- alter table competencias add column if not exists idioma text default 'pt-PT';
-- alter table competencias add column if not exists ano_escolar text;

-- Add idioma to exercicios
-- alter table exercicios add column if not exists idioma text default 'pt-PT';

-- ============================================
-- Migration: universal vs curricular content
-- ============================================

/**
 * SOMOS — Arquitectura de Conteúdo
 *
 * Conteúdo Universal: pertence à condição humana.
 * Não tem currículo, não tem fronteiras, não tem validade.
 * Uma criança em Lisboa e uma criança em Tóquio têm as mesmas
 * perguntas sobre quem são e para que estão aqui.
 *
 * Conteúdo Curricular: pertence à escola que a criança frequenta.
 * Respeita a sequência, o vocabulário e os objectivos de cada sistema.
 *
 * O SOMOS é ambos — mas o Universal é o coração.
 */

-- Adicionar campo tipo à tabela competencias
alter table competencias
  add column if not exists tipo text default 'curricular'
  check (tipo in ('universal', 'curricular'));

-- Adicionar campo tipo_conteudo à tabela exercicios
alter table exercicios
  add column if not exists tipo_conteudo text default 'curricular'
  check (tipo_conteudo in ('universal', 'curricular'));

-- Lições universais (dimensão Identitária e Social)
update competencias set tipo = 'universal'
where dimensao in ('identitaria', 'social');

-- Lições curriculares (Naturalista, Lógica, Artística com conteúdo escolar)
update competencias set tipo = 'curricular'
where dimensao in ('naturalista', 'logica', 'artistica');

-- Excepção: lições Naturalista sobre planeta/ecologia são universais
update competencias set tipo = 'universal'
where area in ('ecologia', 'planeta', 'ambiente', 'natureza-global');

-- ============================================
-- Migration: PIN de criança
-- ============================================
ALTER TABLE criancas ADD COLUMN IF NOT EXISTS pin text;
ALTER TABLE criancas ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users;
