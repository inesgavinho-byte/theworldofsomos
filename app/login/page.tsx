"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error_code");
  const errorParam = searchParams.get("error");
  const isExpiredLink =
    errorCode === "otp_expired" || errorParam === "access_denied";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou palavra-passe incorretos.");
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tipo")
        .eq("id", data.user.id)
        .single();

      if (profile?.tipo === "admin") {
        router.push("/admin");
      } else if (profile?.tipo === "crianca") {
        router.push("/crianca/dashboard");
      } else {
        router.push("/dashboard");
      }
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
        {/* Logo */}
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
            Plataforma de continuidade educativa familiar
          </p>
        </div>

        {/* Card */}
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
            Entrar
          </h2>

          {isExpiredLink && (
            <div
              style={{
                background: "rgba(250, 204, 21, 0.12)",
                border: "1px solid rgba(250, 204, 21, 0.4)",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--amarelo-texto)",
                  marginBottom: "16px",
                  lineHeight: "1.5",
                }}
              >
                O link de recuperação expirou.
                <br />
                Por favor solicita um novo link.
              </p>
              <Link
                href="/recuperar-password"
                style={{
                  display: "inline-block",
                  background: "var(--texto-principal)",
                  color: "white",
                  borderRadius: "10px",
                  padding: "10px 20px",
                  fontSize: "13px",
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Recuperar palavra-passe
              </Link>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
                  transition: "border-color 0.2s",
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
                placeholder="••••••••"
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
                transition: "opacity 0.2s",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "16px",
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            <Link
              href="/recuperar-password"
              style={{ color: "var(--texto-secundario)" }}
            >
              Esqueceste a palavra-passe?
            </Link>
          </p>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            Ainda não tens conta?{" "}
            <Link
              href="/register"
              style={{
                color: "var(--roxo-texto)",
                fontWeight: 700,
              }}
            >
              Registar
            </Link>
          </p>

          <p
            style={{
              textAlign: "center",
              marginTop: "12px",
              fontSize: "12px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            <Link
              href="/crianca/login"
              style={{ color: "var(--texto-secundario)" }}
            >
              Entrar como criança →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
