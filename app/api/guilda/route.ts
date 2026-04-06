import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { log } from "@/lib/audit";

export async function GET() {
  const supabase = createAdminClient();

  // Get count of approved members
  const { count: totalAprovados } = await supabase
    .from("guilda_candidaturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprovado");

  // Get approved counts per country
  const { data: vagasPais } = await supabase
    .from("guilda_candidaturas")
    .select("pais_codigo")
    .eq("estado", "aprovado");

  const paisCounts: Record<string, number> = {};
  vagasPais?.forEach((row) => {
    paisCounts[row.pais_codigo] = (paisCounts[row.pais_codigo] || 0) + 1;
  });

  // Get approved members (public display)
  const { data: membros } = await supabase
    .from("guilda_candidaturas")
    .select("nome, pais, pais_codigo, perfil, created_at")
    .eq("estado", "aprovado")
    .order("created_at", { ascending: true });

  return NextResponse.json({
    totalAprovados: totalAprovados ?? 0,
    paisCounts,
    membros: membros ?? [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();

  try {
    const body = await request.json();

    const { nome, email, pais, pais_codigo, perfil, perfil_descricao, motivacao, contribuicao, linkedin, website } = body;

    // Validate required fields
    if (!nome || !email || !pais || !pais_codigo || !perfil || !motivacao || !contribuicao) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    // Validate perfil
    const perfisValidos = ['criador_conteudo', 'especialista_curriculo', 'tradutor', 'educador', 'pai_mae', 'outro'];
    if (!perfisValidos.includes(perfil)) {
      return NextResponse.json(
        { error: "Perfil inválido." },
        { status: 400 }
      );
    }

    // Validate word count (minimum 100 words)
    const wordCount = (text: string) => text.trim().split(/\s+/).length;
    if (wordCount(motivacao) < 100) {
      return NextResponse.json(
        { error: "A motivação deve ter pelo menos 100 palavras." },
        { status: 400 }
      );
    }
    if (wordCount(contribuicao) < 100) {
      return NextResponse.json(
        { error: "A contribuição deve ter pelo menos 100 palavras." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("guilda_candidaturas")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Este email já tem uma candidatura registada." },
        { status: 409 }
      );
    }

    // Check country slots
    const { count: paisCount } = await supabase
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("pais_codigo", pais_codigo)
      .eq("estado", "aprovado");

    // Check total approved
    const { count: totalAprovados } = await supabase
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aprovado");

    const paisEsgotado = (paisCount ?? 0) >= 3;
    const globalEsgotado = (totalAprovados ?? 0) >= 100;

    // Determine initial state
    let estado = "pendente";
    if (paisEsgotado || globalEsgotado) {
      estado = "lista_espera";
    }

    const { error } = await supabase.from("guilda_candidaturas").insert({
      nome,
      email,
      pais,
      pais_codigo,
      perfil,
      perfil_descricao: perfil === "outro" ? perfil_descricao : null,
      motivacao,
      contribuicao,
      linkedin: linkedin || null,
      website: website || null,
      estado,
    });

    if (error) {
      console.error("Guilda insert error:", error);
      return NextResponse.json(
        { error: "Erro ao submeter candidatura." },
        { status: 500 }
      );
    }

    await log({
      action: 'guilda.apply',
      entityType: 'guilda_candidatura',
      metadata: { pais: pais_codigo, perfil, estado },
      request,
    });

    return NextResponse.json({
      success: true,
      estado,
      paisEsgotado,
    });
  } catch {
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
