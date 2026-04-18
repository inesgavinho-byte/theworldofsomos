"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConfigurarPinPage() {
  const router = useRouter();
  const params = useParams();
  const criancaId = params.criancaId as string;

  const [crianca, setCrianca] = useState<{ nome: string; pin: string | null } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState<"entrada" | "confirmacao" | "sucesso">("entrada");
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [confirmDigits, setConfirmDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push("/login"); return; }

      // Verify parent belongs to a family with this child
      const { data: membro } = await supabase
        .from("familia_membros")
        .select("familia_id")
        .eq("profile_id", user.id)
        .single();

      if (!membro?.familia_id) { router.push("/dashboard"); return; }

      const { data: c } = await supabase
        .from("criancas")
        .select("nome, pin")
        .eq("id", criancaId)
        .eq("familia_id", membro.familia_id)
        .single();

      if (!c) { router.push("/dashboard"); return; }

      setCrianca(c);
      setAuthChecked(true);
      setTimeout(() => pinRefs.current[0]?.focus(), 120);
    });
  }, [criancaId, router]);

  const handleDigit = (
    index: number,
    value: string,
    digits: string[],
    setDigits: (d: string[]) => void,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
    onComplete?: (pin: string) => void
  ) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);
    if (value && index < 3) refs.current[index + 1]?.focus();
    if (next.every((d) => d !== "") && onComplete) onComplete(next.join(""));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent,
    digits: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePinComplete = (pin: string) => {
    setStep("confirmacao");
    setError("");
    setTimeout(() => confirmRefs.current[0]?.focus(), 120);
  };

  const handleConfirmComplete = async (confirmPin: string) => {
    const pin = pinDigits.join("");
    if (confirmPin !== pin) {
      setError("Os PINs não coincidem. Tenta de novo.");
      setConfirmDigits(["", "", "", ""]);
      setTimeout(() => confirmRefs.current[0]?.focus(), 80);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/definir-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ criancaId, pin }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.erro ?? "Não foi possível guardar o PIN. Tenta outra vez.");
        setConfirmDigits(["", "", "", ""]);
        setStep("entrada");
        setPinDigits(["", "", "", ""]);
        setTimeout(() => pinRefs.current[0]?.focus(), 80);
      } else {
        setStep("sucesso");
      }
    } catch {
      setError("Não foi possível guardar o PIN. Tenta outra vez.");
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "rgba(167,139,250,0.12)",
              border: "1.5px solid rgba(167,139,250,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              fontSize: "24px",
            }}
          >
            🔐
          </div>
          <h1 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500, marginBottom: "6px" }}>
            {step === "sucesso" ? "PIN guardado!" : "Configurar PIN"}
          </h1>
          <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            {step === "sucesso"
              ? `${crianca?.nome} já pode entrar de forma autónoma.`
              : crianca?.pin
              ? `Alterar o PIN de ${crianca?.nome}`
              : `Criar o PIN de acesso de ${crianca?.nome}`}
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "36px",
            border: "1px solid rgba(160,144,128,0.2)",
          }}
        >
          {step === "sucesso" ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>✓</div>
              <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600, marginBottom: "28px", lineHeight: 1.6 }}>
                O PIN foi guardado com sucesso. A criança pode agora entrar em{" "}
                <strong style={{ color: "var(--texto-principal)" }}>somos.app/crianca/login</strong>{" "}
                usando o PIN de 4 dígitos que definiste.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link href="/crianca/login" target="_blank">
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "none",
                      background: "var(--roxo-card)",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 800,
                      fontFamily: "Nunito, sans-serif",
                      cursor: "none",
                    }}
                  >
                    Testar login da criança →
                  </button>
                </Link>
                <Link href="/dashboard">
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(160,144,128,0.3)",
                      background: "transparent",
                      color: "var(--texto-secundario)",
                      fontSize: "14px",
                      fontWeight: 700,
                      fontFamily: "Nunito, sans-serif",
                      cursor: "none",
                    }}
                  >
                    Voltar ao dashboard
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
                {(["entrada", "confirmacao"] as const).map((s, i) => (
                  <div
                    key={s}
                    style={{
                      flex: 1,
                      height: "3px",
                      borderRadius: "2px",
                      background: step === "confirmacao" || (step === "entrada" && i === 0)
                        ? "var(--roxo-card)"
                        : "rgba(160,144,128,0.2)",
                      opacity: i === 0 ? 1 : step === "confirmacao" ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>

              <p style={{ fontSize: "15px", fontWeight: 700, marginBottom: "8px" }}>
                {step === "entrada" ? "Escolhe um PIN de 4 dígitos" : "Confirma o PIN"}
              </p>
              <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600, marginBottom: "28px" }}>
                {step === "entrada"
                  ? "Este é o código que a criança usará para entrar."
                  : "Introduz o mesmo PIN outra vez para confirmar."}
              </p>

              {/* PIN digits */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginBottom: "24px" }}>
                {(step === "entrada" ? pinDigits : confirmDigits).map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      if (step === "entrada") pinRefs.current[i] = el;
                      else confirmRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      if (step === "entrada") {
                        handleDigit(i, e.target.value, pinDigits, setPinDigits, pinRefs, handlePinComplete);
                      } else {
                        handleDigit(i, e.target.value, confirmDigits, setConfirmDigits, confirmRefs, handleConfirmComplete);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (step === "entrada") handleKeyDown(i, e, pinDigits, pinRefs);
                      else handleKeyDown(i, e, confirmDigits, confirmRefs);
                    }}
                    className="pin-digit"
                    disabled={loading}
                    style={{} as React.CSSProperties}
                  />
                ))}
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(250,204,21,0.12)",
                    border: "1px solid rgba(250,204,21,0.4)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--amarelo-texto)",
                    marginBottom: "16px",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              {loading && (
                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600, marginBottom: "16px" }}>
                  A guardar...
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                {step === "confirmacao" && (
                  <button
                    onClick={() => {
                      setStep("entrada");
                      setConfirmDigits(["", "", "", ""]);
                      setError("");
                      setTimeout(() => pinRefs.current[0]?.focus(), 80);
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(160,144,128,0.3)",
                      background: "transparent",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "Nunito, sans-serif",
                      color: "var(--texto-secundario)",
                      cursor: "none",
                    }}
                  >
                    ← Alterar
                  </button>
                )}
                <Link href="/dashboard" style={{ flex: 1 }}>
                  <button
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "12px",
                      border: "1.5px solid rgba(160,144,128,0.3)",
                      background: "transparent",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "Nunito, sans-serif",
                      color: "var(--texto-secundario)",
                      cursor: "none",
                    }}
                  >
                    Cancelar
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {step !== "sucesso" && (
          <p style={{ textAlign: "center", marginTop: "20px", fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            A criança usa este PIN em{" "}
            <Link href="/crianca/login" style={{ color: "var(--roxo-texto)", fontWeight: 700 }}>
              /crianca/login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
