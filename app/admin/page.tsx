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

  const ROUTE_GROUPS = [
    {
      tipo: "Pública",
      cor: "#4ade80",
      corFundo: "rgba(74,222,128,0.1)",
      rotas: [
        { path: "/", dinamica: false },
        { path: "/login", dinamica: false },
        { path: "/register", dinamica: false },
        { path: "/leituras", dinamica: false },
        { path: "/leituras/[slug]", dinamica: true },
      ],
    },
    {
      tipo: "Pai",
      cor: "#60a5fa",
      corFundo: "rgba(96,165,250,0.1)",
      rotas: [
        { path: "/dashboard", dinamica: false },
        { path: "/onboarding", dinamica: false },
      ],
    },
    {
      tipo: "Criança",
      cor: "#facc15",
      corFundo: "rgba(250,204,21,0.1)",
      rotas: [
        { path: "/crianca/login", dinamica: false },
        { path: "/crianca/dashboard", dinamica: false },
        { path: "/licao/[slug]", dinamica: true },
        { path: "/licao/[slug]/conteudo", dinamica: true },
        { path: "/licao/[slug]/exercicios", dinamica: true },
        { path: "/licao/[slug]/reflexao", dinamica: true },
      ],
    },
    {
      tipo: "Admin",
      cor: "#a78bfa",
      corFundo: "rgba(167,139,250,0.1)",
      rotas: [
        { path: "/admin", dinamica: false },
        { path: "/admin/utilizadores", dinamica: false },
        { path: "/admin/conteudo", dinamica: false },
        { path: "/admin/estatisticas", dinamica: false },
      ],
    },
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

        {/* Route Map */}
        <div style={{ marginBottom: "28px" }}>
          <h2
            className="font-editorial"
            style={{ fontSize: "24px", fontWeight: 500, marginBottom: "20px" }}
          >
            Mapa de Rotas
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {ROUTE_GROUPS.map((group) => (
              <div key={group.tipo}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      background: group.corFundo,
                      color: group.cor,
                      border: `1px solid ${group.cor}60`,
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase" as const,
                    }}
                  >
                    {group.tipo}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--texto-secundario)",
                      fontWeight: 600,
                    }}
                  >
                    {group.rotas.length} rota{group.rotas.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                    gap: "10px",
                  }}
                >
                  {group.rotas.map((rota) => {
                    const card = (
                      <div
                        className={rota.dinamica ? "" : "card-hover"}
                        style={{
                          background: "rgba(245,242,236,0.9)",
                          borderRadius: "12px",
                          padding: "14px 16px",
                          border: rota.dinamica
                            ? "1.5px dashed rgba(160,144,128,0.3)"
                            : "1px solid rgba(160,144,128,0.15)",
                          opacity: rota.dinamica ? 0.55 : 1,
                          cursor: rota.dinamica ? "default" : "none",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "12px",
                            fontFamily: "monospace",
                            color: rota.dinamica
                              ? "var(--texto-secundario)"
                              : "var(--texto-principal)",
                            display: "block",
                            marginBottom: "10px",
                            wordBreak: "break-all" as const,
                            lineHeight: 1.5,
                          }}
                        >
                          {rota.path}
                        </code>
                        <span
                          style={{
                            display: "inline-block",
                            background: group.corFundo,
                            color: group.cor,
                            border: `1px solid ${group.cor}50`,
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "10px",
                            fontWeight: 800,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase" as const,
                          }}
                        >
                          {group.tipo}
                        </span>
                      </div>
                    );

                    return rota.dinamica ? (
                      <div key={rota.path}>{card}</div>
                    ) : (
                      <Link key={rota.path} href={rota.path}>
                        {card}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
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
