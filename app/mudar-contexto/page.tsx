"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function MudarContextoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const destino = searchParams.get("destino") ?? "/admin";
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    await fetch("/api/contexto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activeRole: "admin" }),
    });
    router.push(destino);
  };

  const voltar = () => {
    router.push("/dashboard");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "400px",
        animation: "fadeIn 0.4s ease forwards",
      }}
    >
      <div
        style={{
          background: "rgba(245, 242, 236, 0.06)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "40px 36px",
          border: "1px solid rgba(160, 144, 128, 0.15)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(160,144,128,0.5)",
            marginBottom: "20px",
          }}
        >
          Mudança de contexto
        </p>

        <h1
          className="font-editorial"
          style={{
            fontSize: "26px",
            fontWeight: 500,
            color: "rgba(245,242,236,0.92)",
            lineHeight: 1.3,
            marginBottom: "12px",
          }}
        >
          Estás prestes a entrar no painel de administração.
        </h1>

        <p
          style={{
            fontSize: "14px",
            color: "rgba(160,144,128,0.7)",
            fontWeight: 600,
            marginBottom: "36px",
            lineHeight: 1.5,
          }}
        >
          Vais sair do contexto familiar.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={confirmar}
            disabled={loading}
            style={{
              background: "rgba(245,242,236,0.1)",
              border: "1px solid rgba(160,144,128,0.3)",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 700,
              fontFamily: "Nunito, sans-serif",
              color: "rgba(245,242,236,0.85)",
              cursor: "none",
              transition: "background 0.2s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "A entrar..." : "Continuar para admin"}
          </button>

          <button
            onClick={voltar}
            disabled={loading}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "12px",
              padding: "14px",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "Nunito, sans-serif",
              color: "rgba(160,144,128,0.6)",
              cursor: "none",
              transition: "color 0.2s",
            }}
          >
            Voltar à família
          </button>
        </div>
      </div>
    </div>
  );
}

function MudarContextoFallback() {
  return (
    <p
      style={{
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "rgba(160,144,128,0.6)",
      }}
    >
      A carregar...
    </p>
  );
}

export default function MudarContextoPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(26, 23, 20, 0.92)",
        position: "relative",
        zIndex: 1,
        padding: "24px",
      }}
    >
      <Suspense fallback={<MudarContextoFallback />}>
        <MudarContextoContent />
      </Suspense>
    </div>
  );
}
