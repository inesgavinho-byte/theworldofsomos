import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DiarioListClient from "./DiarioListClient";

export const metadata = { title: "Diário — SOMOS Admin" };

export default async function DiarioPage() {
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
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "4px",
              }}
            >
              <Link
                href="/admin"
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  textDecoration: "none",
                }}
              >
                ← Admin
              </Link>
            </div>
            <h1
              className="font-editorial"
              style={{ fontSize: "32px", fontWeight: 500 }}
            >
              Diário de desenvolvimento
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginTop: "4px",
              }}
            >
              Memória estratégica do projecto — decisões, ideias, aprendizagens, evolução.
            </p>
          </div>

          <Link href="/admin/diario/nova">
            <button
              style={{
                background: "var(--roxo-tint, #a78bfa)",
                border: "none",
                borderRadius: "10px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 800,
                color: "white",
                letterSpacing: "0.04em",
                cursor: "pointer",
              }}
            >
              + Nova entrada
            </button>
          </Link>
        </div>

        <DiarioListClient />
      </div>
    </div>
  );
}
