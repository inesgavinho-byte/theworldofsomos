import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import EntradaClient from "./EntradaClient";
import {
  EntradaDiario,
  isAutorDiario,
  isTipoDiario,
  normalizeReferencias,
  normalizeTags,
} from "@/lib/diario";

export const metadata = { title: "Entrada — Diário — SOMOS Admin" };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EntradaPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("tipo, roles")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (Array.isArray(profile?.roles) && profile!.roles.includes("admin")) ||
    profile?.tipo === "admin";

  if (!isAdmin) redirect("/dashboard");

  if (!UUID_RE.test(params.id)) notFound();

  const admin = createAdminClient();

  const { data } = await admin
    .from("diario_desenvolvimento")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!data) notFound();

  if (
    !isTipoDiario(data.tipo) ||
    !isAutorDiario(data.autor) ||
    typeof data.titulo !== "string" ||
    typeof data.conteudo !== "string"
  ) {
    notFound();
  }

  const entrada: EntradaDiario = {
    id: data.id,
    tipo: data.tipo,
    titulo: data.titulo,
    contexto: typeof data.contexto === "string" ? data.contexto : null,
    conteudo: data.conteudo,
    implicacoes:
      typeof data.implicacoes === "string" ? data.implicacoes : null,
    referencias: normalizeReferencias(data.referencias),
    tags: normalizeTags(data.tags),
    autor: data.autor,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  const { data: linhas } = await admin
    .from("diario_desenvolvimento")
    .select("tags");

  const tagsSet = new Set<string>();
  for (const row of linhas ?? []) {
    const lista = Array.isArray(row.tags) ? (row.tags as unknown[]) : [];
    for (const t of lista) {
      if (typeof t === "string" && t.trim()) tagsSet.add(t.trim());
    }
  }
  const tagsDisponiveis = Array.from(tagsSet).sort();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <Link
            href="/admin/diario"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              textDecoration: "none",
            }}
          >
            ← Diário
          </Link>
        </div>

        <EntradaClient entrada={entrada} tagsDisponiveis={tagsDisponiveis} />
      </div>
    </div>
  );
}
