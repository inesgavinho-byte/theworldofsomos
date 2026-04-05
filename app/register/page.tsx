"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // Create profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        nome,
        tipo: "pai",
        roles: [],
      });

      // Create family
      const { data: familia } = await supabase
        .from("familias")
        .insert({ nome: `Família ${nome}`, plano: "free" })
        .select()
        .single();

      if (familia) {
        await supabase.from("familia_membros").insert({
          familia_id: familia.id,
          profile_id: data.user.id,
          papel: "pai",
        });
      }

      router.push("/onboarding");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          animation: "fadeIn 0.5s ease forwards",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1
            className="font-editorial"
            style={{ fontSize: "42px", fontWeight: 500, letterSpacing: "-0.5px" }}
          >
            SOMOS
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              marginTop: "6px",
              fontWeight: 600,
            }}
          >
            Começa a jornada da tua família
          </p>
        </div>

        <div
          style={{
            background: "rgba(245, 242, 236, 0.85)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "36px",
            border: "1px solid rgba(160, 144, 128, 0.2)",
          }}
        >
          <h2
            className="font-editorial"
            style={{ fontSize: "26px", fontWeight: 500, marginBottom: "24px" }}
          >
            Criar conta
          </h2>

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  marginBottom: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                O teu nome
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                placeholder="Ana Costa"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(160, 144, 128, 0.3)",
                  background: "white",
                  fontSize: "15px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  marginBottom: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="o.teu@email.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(160, 144, 128, 0.3)",
                  background: "white",
                  fontSize: "15px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  marginBottom: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="mínimo 6 caracteres"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "1.5px solid rgba(160, 144, 128, 0.3)",
                  background: "white",
                  fontSize: "15px",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "none",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "rgba(250, 204, 21, 0.12)",
                  border: "1px solid rgba(250, 204, 21, 0.4)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "var(--amarelo-texto)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: "var(--texto-principal)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                padding: "14px",
                fontSize: "15px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor: "none",
                marginTop: "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "A criar conta..." : "Criar conta"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            Já tens conta?{" "}
            <Link href="/login" style={{ color: "var(--roxo-texto)", fontWeight: 700 }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
