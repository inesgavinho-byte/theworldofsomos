import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo, roles")
    .eq("id", user.id)
    .single();

  // Fix 5: ordenar por created_at ascending para determinismo quando há múltiplas famílias
  const { data: memberships } = await supabase
    .from("familia_membros")
    .select("familia_id, papel, familias(nome, plano)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: true });

  const familyMember = memberships?.[0] ?? null;
  const familiaId = (familyMember as any)?.familia_id ?? null;

  let criancas: any[] = [];
  if (familiaId) {
    const { data } = await supabase
      .from("criancas")
      .select("*")
      .eq("familia_id", familiaId);
    criancas = data ?? [];
  }

  // Fetch last delivered moment for each child.
  // O conteúdo para o adulto vive em licoes.momento.adulto (fonte de verdade).
  // A tabela sessoes apenas regista QUANDO foi entregue — não duplicamos o texto.
  const ultimosMomentos: Record<
    string,
    { titulo_licao: string; momento_adulto: string; created_at: string }
  > = {};
  for (const crianca of criancas) {
    const { data: sessao } = await supabase
      .from("sessoes")
      .select("titulo_licao, created_at, licoes(momento)")
      .eq("crianca_id", crianca.id)
      .not("momento_entregue_em", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!sessao) continue;

    const licaoJoined = (sessao as any).licoes as
      | { momento?: { adulto?: { resumo_aprendizagem?: string[] | string; sugestao?: string } } }
      | null;
    const adulto = licaoJoined?.momento?.adulto;
    const resumo = adulto?.resumo_aprendizagem;
    const paraAdulto = Array.isArray(resumo)
      ? resumo.filter((s) => typeof s === "string" && s.trim().length > 0).join(" ")
      : typeof resumo === "string"
        ? resumo
        : "";
    const texto = paraAdulto || adulto?.sugestao || "";
    if (!texto) continue;

    ultimosMomentos[crianca.id] = {
      titulo_licao: (sessao as any).titulo_licao ?? "",
      momento_adulto: texto,
      created_at: (sessao as any).created_at,
    };
  }

  // Fix 6: roles[] é fonte de verdade. tipo é fallback legacy durante transição.
  // Remover fallback tipo quando Fase 1.5 estiver completa.
  const isAdmin =
    (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
    profile?.tipo === "admin";

  // Read active role from context cookie
  const cookieStore = await cookies();
  const contextCookie = cookieStore.get("somos-context")?.value;
  let activeRole: "family" | "admin" = "family";
  if (contextCookie) {
    try {
      const ctx = JSON.parse(contextCookie);
      if (ctx.activeRole === "admin" || ctx.activeRole === "family") {
        activeRole = ctx.activeRole;
      }
    } catch {
      // ignore malformed cookie
    }
  }

  return (
    <DashboardClient
      profile={profile}
      familiaId={familiaId}
      criancas={criancas}
      ultimosMomentos={ultimosMomentos}
      isAdmin={isAdmin}
      activeRole={activeRole}
    />
  );
}
