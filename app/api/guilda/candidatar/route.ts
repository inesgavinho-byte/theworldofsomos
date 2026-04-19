import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    nome,
    email,
    pais,
    pais_codigo,
    perfil,
    perfil_descricao,
    motivacao,
    contribuicao,
    linkedin,
    website,
    aceitar_lista_espera,
  } = body;

  // Validações básicas
  if (!nome || !email || !pais || !pais_codigo || !perfil || !motivacao || !contribuicao) {
    return NextResponse.json(
      { error: "Campos obrigatórios em falta." },
      { status: 400 }
    );
  }

  if (motivacao.trim().split(/\s+/).length < 50) {
    return NextResponse.json(
      { error: "A motivação deve ter pelo menos 50 palavras." },
      { status: 400 }
    );
  }

  if (contribuicao.trim().split(/\s+/).length < 50) {
    return NextResponse.json(
      { error: "A contribuição deve ter pelo menos 50 palavras." },
      { status: 400 }
    );
  }

  // Usar admin client para ler dados sem RLS interferir
  const supabaseAdmin = createAdminClient();
  const supabase = await createClient();

  // Verificar se email já existe
  const { data: emailExistente } = await supabaseAdmin
    .from("guilda_candidaturas")
    .select("id, estado")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (emailExistente) {
    return NextResponse.json(
      {
        error: "Este email já submeteu uma candidatura.",
        estado: emailExistente.estado,
      },
      { status: 409 }
    );
  }

  // Verificar vagas no país (aprovados)
  const { count: aprovadosPais } = await supabaseAdmin
    .from("guilda_candidaturas")
    .select("*", { count: "exact", head: true })
    .eq("pais_codigo", pais_codigo.toUpperCase())
    .eq("estado", "aprovado");

  const paisCheio = (aprovadosPais ?? 0) >= 3;

  if (paisCheio && !aceitar_lista_espera) {
    return NextResponse.json(
      {
        error: "lista_espera",
        message: `${pais} já atingiu o limite de 3 membros aprovados.`,
        vagasRestantes: 0,
      },
      { status: 200 }
    );
  }

  // Verificar total global (100 aprovados = Guilda cheia)
  const { count: totalAprovados } = await supabaseAdmin
    .from("guilda_candidaturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprovado");

  const estado =
    paisCheio && aceitar_lista_espera
      ? "lista_espera"
      : (totalAprovados ?? 0) >= 100
      ? "lista_espera"
      : "pendente";

  // Inserir candidatura
  const { data, error } = await supabase
    .from("guilda_candidaturas")
    .insert({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      pais,
      pais_codigo: pais_codigo.toUpperCase(),
      perfil,
      perfil_descricao: perfil_descricao?.trim() || null,
      motivacao: motivacao.trim(),
      contribuicao: contribuicao.trim(),
      linkedin: linkedin?.trim() || null,
      website: website?.trim() || null,
      estado,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Erro ao inserir candidatura:", error);
    return NextResponse.json(
      { error: "Erro ao submeter candidatura. Tenta novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    id: data.id,
    estado,
    listaEspera: estado === "lista_espera",
  });
}
