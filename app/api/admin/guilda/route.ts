import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const admin = createAdminClient();

  const { data: candidaturas } = await admin
    .from("guilda_candidaturas")
    .select("*")
    .order("created_at", { ascending: false });

  const { count: totalAprovados } = await admin
    .from("guilda_candidaturas")
    .select("*", { count: "exact", head: true })
    .eq("estado", "aprovado");

  return NextResponse.json({
    candidaturas: candidaturas ?? [],
    totalAprovados: totalAprovados ?? 0,
  });
}

export async function PATCH(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { id, estado } = await request.json();

  if (!id || !["aprovado", "rejeitado", "lista_espera", "pendente"].includes(estado)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  // If approving, check limits
  if (estado === "aprovado") {
    const { data: candidatura } = await admin
      .from("guilda_candidaturas")
      .select("pais_codigo, nome, email")
      .eq("id", id)
      .single();

    if (!candidatura) {
      return NextResponse.json({ error: "Candidatura não encontrada" }, { status: 404 });
    }

    // Check country limit
    const { count: paisCount } = await admin
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("pais_codigo", candidatura.pais_codigo)
      .eq("estado", "aprovado");

    if ((paisCount ?? 0) >= 3) {
      return NextResponse.json(
        { error: `Limite de 3 membros por país atingido para ${candidatura.pais_codigo}` },
        { status: 400 }
      );
    }

    // Check global limit
    const { count: totalAprovados } = await admin
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aprovado");

    if ((totalAprovados ?? 0) >= 100) {
      return NextResponse.json(
        { error: "Limite global de 100 membros atingido" },
        { status: 400 }
      );
    }

    // Send approval email
    try {
      await resend.emails.send({
        from: "SOMOS <noreply@theworldofsomos.com>",
        to: candidatura.email,
        subject: `Bem-vinda/o à Guilda, ${candidatura.nome}.`,
        html: `
          <div style="font-family: 'Nunito', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
            <p style="font-size: 16px; line-height: 1.8; color: #1a1714;">
              ${candidatura.nome},
            </p>
            <p style="font-size: 16px; line-height: 1.8; color: #1a1714;">
              A tua candidatura foi aprovada.<br/>
              És agora um dos 100 membros fundadores da Guilda do SOMOS.
            </p>
            <p style="font-size: 16px; line-height: 1.8; color: #1a1714;">
              Nos próximos dias recebes acesso à plataforma de colaboração
              e todas as instruções para começar.
            </p>
            <p style="font-size: 16px; line-height: 1.8; color: #1a1714;">
              Obrigada por acreditares nisto connosco.
            </p>
            <p style="font-size: 16px; line-height: 1.8; color: #1a1714; margin-top: 32px;">
              <strong>SOMOS</strong>
            </p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("Failed to send approval email:", emailErr);
    }
  }

  const { error } = await admin
    .from("guilda_candidaturas")
    .update({ estado })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erro ao actualizar" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
