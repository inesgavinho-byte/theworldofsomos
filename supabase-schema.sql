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
  curriculo text DEFAULT 'PT' CHECK (curriculo IN ('PT', 'Cambridge', 'IB', 'outro')),
  pais text,
  estilo_aprendizagem text
);

-- Competências
CREATE TABLE IF NOT EXISTS competencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dimensao text,
  area text,
  nivel int,
  descricao text,
  curriculo text
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
  metodo_ensino text
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
  respostas jsonb
);

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
