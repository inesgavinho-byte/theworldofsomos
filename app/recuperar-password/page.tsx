"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const NU = "'Nunito', sans-serif";

export default function RecuperarPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/login`,
      }
    );

    if (resetError) {
      setError("Não foi possível enviar o email. Tenta novamente.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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
            style={{ fontSize: "26px", fontWeight: 500, marginBottom: "8px" }}
          >
            Recuperar palavra-passe
          </h2>

          <p
            style={{
              fontFamily: NU,
              fontSize: "14px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            Indica o teu email e enviamos um link para criares uma nova
            palavra-passe.
          </p>

          {sent ? (
            <div
              style={{
                background: "rgba(74, 222, 128, 0.12)",
                border: "1px solid rgba(74, 222, 128, 0.4)",
                borderRadius: "12px",
                padding: "16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--verde-texto)",
                lineHeight: 1.6,
              }}
            >
              Email enviado! Verifica a tua caixa de entrada e segue o link
              para redefinir a palavra-passe.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
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
                    fontFamily: NU,
                    fontWeight: 600,
                    outline: "none",
                    transition: "border-color 0.2s",
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
                  fontFamily: NU,
                  cursor: "none",
                  marginTop: "8px",
                  transition: "opacity 0.2s",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "A enviar..." : "Enviar link de recuperação"}
              </button>
            </form>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            <Link href="/login" style={{ color: "var(--texto-secundario)" }}>
              ← Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
