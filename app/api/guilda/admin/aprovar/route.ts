import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  // Verificar admin
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "ID em falta." }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  // Verificar limite de vagas no país e global antes de aprovar
  const { data: candidatura } = await supabaseAdmin
    .from("guilda_candidaturas")
    .select("nome, email, pais, pais_codigo")
    .eq("id", id)
    .single();

  if (!candidatura) {
    return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
  }

  const [{ count: aprovadosPais }, { count: totalAprovados }] = await Promise.all([
    supabaseAdmin
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("pais_codigo", candidatura.pais_codigo)
      .eq("estado", "aprovado"),
    supabaseAdmin
      .from("guilda_candidaturas")
      .select("*", { count: "exact", head: true })
      .eq("estado", "aprovado"),
  ]);

  if ((aprovadosPais ?? 0) >= 3) {
    return NextResponse.json(
      { error: `${candidatura.pais} já tem 3 membros aprovados.` },
      { status: 400 }
    );
  }

  if ((totalAprovados ?? 0) >= 100) {
    return NextResponse.json(
      { error: "A Guilda já tem 100 membros. Limite global atingido." },
      { status: 400 }
    );
  }

  // Aprovar
  const { error } = await supabaseAdmin
    .from("guilda_candidaturas")
    .update({ estado: "aprovado" })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Erro ao aprovar candidatura." }, { status: 500 });
  }

  // Enviar email de boas-vindas via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      await resend.emails.send({
        from: "SOMOS <guilda@somos.education>",
        to: candidatura.email,
        subject: `Bem-vinda/o à Guilda, ${candidatura.nome.split(" ")[0]}.`,
        text: `${candidatura.nome.split(" ")[0]},

A tua candidatura foi aprovada.
És agora um dos 100 membros fundadores da Guilda do SOMOS.

Nos próximos dias recebes acesso à plataforma de colaboração
e todas as instruções para começar.

Obrigada por acreditares nisto connosco.

SOMOS`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, serif; background: #1a1714; color: #f5f2ec; margin: 0; padding: 0; }
    .container { max-width: 580px; margin: 0 auto; padding: 60px 40px; }
    .logo { font-size: 28px; font-weight: 300; letter-spacing: 4px; color: #a78bfa; margin-bottom: 48px; }
    .heading { font-size: 32px; font-weight: 300; margin-bottom: 8px; color: #f5f2ec; }
    .body { font-size: 16px; line-height: 1.8; color: rgba(245,242,236,0.75); margin: 32px 0; }
    .divider { border: none; border-top: 1px solid rgba(245,242,236,0.1); margin: 40px 0; }
    .footer { font-size: 12px; color: rgba(245,242,236,0.3); letter-spacing: 2px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">SOMOS</div>
    <div class="heading">Bem-vinda/o à Guilda,<br>${candidatura.nome.split(" ")[0]}.</div>
    <div class="body">
      A tua candidatura foi aprovada.<br>
      És agora um dos 100 membros fundadores da Guilda do SOMOS.<br><br>
      Nos próximos dias recebes acesso à plataforma de colaboração
      e todas as instruções para começar.<br><br>
      Obrigada por acreditares nisto connosco.
    </div>
    <hr class="divider">
    <div class="footer">SOMOS — A Guilda</div>
  </div>
</body>
</html>
      `,
      });
    } catch (emailError) {
      console.error("Erro ao enviar email de aprovação:", emailError);
      // Não falha o request por causa do email
    }
  }

  return NextResponse.json({ success: true });
}
