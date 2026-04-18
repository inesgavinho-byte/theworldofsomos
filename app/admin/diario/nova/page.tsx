import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import NovaEntradaClient from "./NovaEntradaClient";

export const metadata = { title: "Nova entrada — Diário — SOMOS Admin" };

export default async function NovaEntradaPage() {
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

  const admin = createAdminClient();
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
            marginBottom: "4px",
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
        <h1
          className="font-editorial"
          style={{ fontSize: "28px", fontWeight: 500, marginBottom: "22px" }}
        >
          Nova entrada
        </h1>

        <div
          style={{
            background: "rgba(245,242,236,0.9)",
            borderRadius: "14px",
            border: "1px solid rgba(160,144,128,0.15)",
            padding: "24px",
          }}
        >
          <NovaEntradaClient tagsDisponiveis={tagsDisponiveis} />
        </div>
      </div>
    </div>
  );
}
