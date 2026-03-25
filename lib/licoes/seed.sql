-- ============================================================
-- SOMOS — Seed: Lições e Exercícios para Teste
-- 5 lições (3.º/4.º ano PT) com 5 exercícios cada
-- Executar no Supabase SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- 1. Competências (uma por lição)
-- ------------------------------------------------------------
INSERT INTO competencias (id, dimensao, area, nivel, descricao, curriculo) VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'artistica',
    'Língua Portuguesa',
    3,
    'Identificar classes de palavras: adjectivos, verbos e conjunções em contexto narrativo.',
    'PT'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'logica',
    'Matemática',
    3,
    'Multiplicação, divisão e sequências numéricas até à tabuada do 9.',
    'PT'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'naturalista',
    'Estudo do Meio — Ciências',
    3,
    'Fotossíntese, partes da planta e ciclo da água de forma introdutória.',
    'PT'
  ),
  (
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'artistica',
    'Inglês',
    3,
    'Vocabulário essencial do dia-a-dia: cores, animais, acções e estados emocionais.',
    'PT'
  ),
  (
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'social',
    'História de Portugal',
    3,
    'Os Descobrimentos portugueses: navegadores, caravelas e principais rotas marítimas.',
    'PT'
  )
ON CONFLICT (id) DO NOTHING;


-- ------------------------------------------------------------
-- 2. Exercícios — Português: As Palavras que Voam
-- ------------------------------------------------------------
INSERT INTO exercicios (id, competencia_id, tipo, conteudo, dificuldade, metodo_ensino) VALUES
  (
    'aa000001-0000-0000-0000-000000000001',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'escolha_multipla',
    '{
      "pergunta": "O gato ___ rapidamente pela janela.",
      "opcoes": ["saltou", "amarelo", "bonito", "mas"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'aa000001-0000-0000-0000-000000000002',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'escolha_multipla',
    '{
      "pergunta": "Qual destas palavras descreve como alguém é?",
      "opcoes": ["feliz", "correr", "e", "casa"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'aa000001-0000-0000-0000-000000000003',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'escolha_multipla',
    '{
      "pergunta": "A Maria ___ a sua amiga porque ela estava triste.",
      "opcoes": ["abraçou", "grande", "porém", "azul"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'aa000001-0000-0000-0000-000000000004',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'escolha_multipla',
    '{
      "pergunta": "Qual é o adjectivo nesta frase: ''O céu está limpo''?",
      "opcoes": ["limpo", "céu", "está", "o"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'aa000001-0000-0000-0000-000000000005',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'escolha_multipla',
    '{
      "pergunta": "Liga duas ideias: ''Gosto de ler ___ também gosto de desenhar.''",
      "opcoes": ["e", "corri", "bonito", "porta"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),


-- ------------------------------------------------------------
-- 3. Exercícios — Matemática: O Mapa dos Números
-- ------------------------------------------------------------
  (
    'bb000002-0000-0000-0000-000000000001',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'escolha_multipla',
    '{
      "pergunta": "Qual é o resultado de 7 × 8?",
      "opcoes": ["56", "54", "63", "48"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'bb000002-0000-0000-0000-000000000002',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'escolha_multipla',
    '{
      "pergunta": "Se tens 36 rebuçados e divides por 4 amigos, quantos ficam a cada um?",
      "opcoes": ["9", "8", "7", "12"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'bb000002-0000-0000-0000-000000000003',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'escolha_multipla',
    '{
      "pergunta": "Qual é o número que falta? 5, 10, 15, ___, 25",
      "opcoes": ["20", "18", "22", "19"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'bb000002-0000-0000-0000-000000000004',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'escolha_multipla',
    '{
      "pergunta": "Uma caixa tem 6 filas com 9 ovos cada. Quantos ovos no total?",
      "opcoes": ["54", "45", "63", "48"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'bb000002-0000-0000-0000-000000000005',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'escolha_multipla',
    '{
      "pergunta": "Qual é metade de 84?",
      "opcoes": ["42", "44", "40", "46"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),


-- ------------------------------------------------------------
-- 4. Exercícios — Ciências: A Vida Secreta das Plantas
-- ------------------------------------------------------------
  (
    'cc000003-0000-0000-0000-000000000001',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'escolha_multipla',
    '{
      "pergunta": "O que é que as plantas precisam para fazer fotossíntese?",
      "opcoes": ["luz solar", "vento", "terra", "frio"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'cc000003-0000-0000-0000-000000000002',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'escolha_multipla',
    '{
      "pergunta": "Qual parte da planta absorve água do solo?",
      "opcoes": ["raiz", "folha", "flor", "caule"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'cc000003-0000-0000-0000-000000000003',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'escolha_multipla',
    '{
      "pergunta": "O que libertam as plantas durante o dia?",
      "opcoes": ["oxigénio", "dióxido de carbono", "azoto", "vapor"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'cc000003-0000-0000-0000-000000000004',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'escolha_multipla',
    '{
      "pergunta": "Como se chama o processo em que a água dos rios sobe para as nuvens?",
      "opcoes": ["evaporação", "fotossíntese", "respiração", "germinação"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'cc000003-0000-0000-0000-000000000005',
    'c3d4e5f6-a7b8-9012-cdef-123456789012',
    'escolha_multipla',
    '{
      "pergunta": "Onde fica guardada a energia que a planta produz?",
      "opcoes": ["fruto e folhas", "flores", "raízes", "casca"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),


-- ------------------------------------------------------------
-- 5. Exercícios — Inglês: The Big Adventure
-- ------------------------------------------------------------
  (
    'dd000004-0000-0000-0000-000000000001',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'escolha_multipla',
    '{
      "pergunta": "Como se diz ''gato'' em inglês?",
      "opcoes": ["cat", "dog", "bird", "fish"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'dd000004-0000-0000-0000-000000000002',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'escolha_multipla',
    '{
      "pergunta": "What colour is the sun?",
      "opcoes": ["yellow", "blue", "green", "red"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'dd000004-0000-0000-0000-000000000003',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'escolha_multipla',
    '{
      "pergunta": "Como se diz ''estou feliz'' em inglês?",
      "opcoes": ["I am happy", "I am sad", "I am tired", "I am hungry"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'dd000004-0000-0000-0000-000000000004',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'escolha_multipla',
    '{
      "pergunta": "Which word means ''correr''?",
      "opcoes": ["run", "jump", "swim", "fly"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'dd000004-0000-0000-0000-000000000005',
    'd4e5f6a7-b8c9-0123-defa-234567890123',
    'escolha_multipla',
    '{
      "pergunta": "How many days are in a week?",
      "opcoes": ["7", "5", "6", "8"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),


-- ------------------------------------------------------------
-- 6. Exercícios — História: Os Descobrimentos
-- ------------------------------------------------------------
  (
    'ee000005-0000-0000-0000-000000000001',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'escolha_multipla',
    '{
      "pergunta": "Como se chamavam os barcos usados pelos navegadores portugueses?",
      "opcoes": ["caravelas", "galeões", "fragatas", "barcaças"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'ee000005-0000-0000-0000-000000000002',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'escolha_multipla',
    '{
      "pergunta": "Quem foi o primeiro navegador a chegar à Índia pelo mar?",
      "opcoes": ["Vasco da Gama", "Pedro Álvares Cabral", "Bartolomeu Dias", "Fernão de Magalhães"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'ee000005-0000-0000-0000-000000000003',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'escolha_multipla',
    '{
      "pergunta": "Em que século aconteceram os Descobrimentos portugueses?",
      "opcoes": ["século XV e XVI", "século XII", "século XVIII", "século X"],
      "resposta_correcta": 0
    }'::jsonb,
    2,
    'escolha_multipla_2x2'
  ),
  (
    'ee000005-0000-0000-0000-000000000004',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'escolha_multipla',
    '{
      "pergunta": "Que país foi descoberto por Pedro Álvares Cabral em 1500?",
      "opcoes": ["Brasil", "Angola", "Índia", "Moçambique"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  ),
  (
    'ee000005-0000-0000-0000-000000000005',
    'e5f6a7b8-c9d0-1234-efab-345678901234',
    'escolha_multipla',
    '{
      "pergunta": "Para que servia a bússola nos barcos?",
      "opcoes": ["indicar o norte", "medir o tempo", "ver as estrelas", "calcular distâncias"],
      "resposta_correcta": 0
    }'::jsonb,
    1,
    'escolha_multipla_2x2'
  )
ON CONFLICT (id) DO NOTHING;
