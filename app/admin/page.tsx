import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, tipo")
    .eq("id", user.id)
    .single();

  if (profile?.tipo !== "admin") redirect("/dashboard");

  // Stats
  const [
    { count: totalProfiles },
    { count: totalCriancas },
    { count: totalFamilias },
    { count: totalSessoes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("criancas").select("*", { count: "exact", head: true }),
    supabase.from("familias").select("*", { count: "exact", head: true }),
    supabase.from("sessoes").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Utilizadores", valor: totalProfiles ?? 0, cor: "#a78bfa" },
    { label: "Crianças", valor: totalCriancas ?? 0, cor: "#4ade80" },
    { label: "Famílias", valor: totalFamilias ?? 0, cor: "#60a5fa" },
    { label: "Sessões", valor: totalSessoes ?? 0, cor: "#facc15" },
  ];

  const NAV_ITEMS = [
    { href: "/admin/utilizadores", label: "Utilizadores", desc: "Gerir contas e permissões" },
    { href: "/admin/conteudo", label: "Conteúdo", desc: "Artigos, lições e exercícios" },
    { href: "/admin/estatisticas", label: "Estatísticas", desc: "Métricas de uso e engagement" },
  ];

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
      {/* Header */}
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            className="font-editorial"
            style={{ fontSize: "32px", fontWeight: 500 }}
          >
            Painel Admin
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              marginTop: "4px",
            }}
          >
            Bem-vindo, {profile?.nome}
          </p>
        </div>
        <Link href="/dashboard">
          <button
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "10px",
              padding: "7px 16px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "Nunito, sans-serif",
              color: "var(--texto-secundario)",
              cursor: "none",
            }}
          >
            Ver dashboard pai
          </button>
        </Link>
      </div>

      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Stats grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "rgba(245,242,236,0.9)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(160,144,128,0.15)",
              }}
            >
              <p
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: stat.cor,
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {stat.valor}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Nav cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
            marginBottom: "28px",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className="card-hover"
                style={{
                  background: "rgba(245,242,236,0.9)",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid rgba(160,144,128,0.15)",
                }}
              >
                <h3
                  className="font-editorial"
                  style={{ fontSize: "20px", fontWeight: 500, marginBottom: "6px" }}
                >
                  {item.label}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--texto-secundario)",
                    fontWeight: 600,
                  }}
                >
                  {item.desc}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--roxo-texto)",
                    fontWeight: 700,
                    marginTop: "12px",
                  }}
                >
                  Abrir →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* SQL helper info */}
        <div
          style={{
            background: "var(--roxo-card)",
            borderRadius: "16px",
            padding: "20px",
            color: "white",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.4,
              marginBottom: "8px",
            }}
          >
            Promover utilizador a admin
          </p>
          <code
            style={{
              fontSize: "12px",
              fontFamily: "monospace",
              opacity: 0.7,
              lineHeight: 1.8,
            }}
          >
            {`INSERT INTO profiles (id, nome, tipo)
SELECT id, email, 'admin' FROM auth.users
WHERE email = 'SEU_EMAIL'
ON CONFLICT (id) DO UPDATE SET tipo = 'admin';`}
          </code>
        </div>
      </div>
    </div>
  );
}
