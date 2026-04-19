"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CriancaLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"pin" | "email">("pin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (blocked) return;
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newPin.every((d) => d !== "") && newPin.join("").length === 4) {
      handlePinLogin(newPin.join(""));
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (blocked) return;
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePinLogin = async (pinCode: string) => {
    setLoading(true);
    setError("");

    let res: Response;
    try {
      res = await fetch("/api/crianca/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinCode }),
      });
    } catch {
      setError("Não conseguimos entrar agora. Tenta outra vez.");
      setPin(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    const json: { ok?: boolean; erro?: string; motivo?: string; redirect?: string } =
      await res.json().catch(() => ({}));

    if (res.ok && json.ok) {
      router.push(json.redirect ?? "/crianca/dashboard");
      router.refresh();
      return;
    }

    if (res.status === 423 || res.status === 429) {
      setError(json.erro ?? "O teu acesso está bloqueado. Pede a um adulto para te ajudar.");
      setBlocked(true);
      setPin(["", "", "", ""]);
      setLoading(false);
      return;
    }

    setError(json.erro ?? "O PIN não está correcto. Tenta outra vez.");
    setPin(["", "", "", ""]);
    inputRefs.current[0]?.focus();
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
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
      router.push("/crianca/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-crianca)",
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
          maxWidth: "380px",
          animation: "fadeIn 0.5s ease forwards",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          {/* Star SVG */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ margin: "0 auto 16px" }}
          >
            <circle cx="24" cy="24" r="20" fill="rgba(167,139,250,0.15)" />
            <path
              d="M24 8L26.5 18.5H37L28.5 25L31 35.5L24 29L17 35.5L19.5 25L11 18.5H21.5L24 8Z"
              stroke="#a78bfa"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <h1
            className="font-editorial"
            style={{ fontSize: "36px", fontWeight: 500 }}
          >
            SOMOS
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              marginTop: "4px",
              fontWeight: 600,
            }}
          >
            O teu espaço de aprendizagem
          </p>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "36px",
            border: "1px solid rgba(160, 144, 128, 0.2)",
          }}
        >
          {/* Mode toggle */}
          <div
            style={{
              display: "flex",
              background: "rgba(160, 144, 128, 0.1)",
              borderRadius: "12px",
              padding: "4px",
              marginBottom: "28px",
            }}
          >
            {(["pin", "email"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "10px",
                  border: "none",
                  background: mode === m ? "white" : "transparent",
                  fontFamily: "Nunito, sans-serif",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "none",
                  color: mode === m ? "var(--texto-principal)" : "var(--texto-secundario)",
                  transition: "all 0.2s",
                  boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {m === "pin" ? "PIN" : "Email"}
              </button>
            ))}
          </div>

          {mode === "pin" ? (
            <div>
              {!blocked && (
                <>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: "16px",
                      fontWeight: 700,
                      marginBottom: "28px",
                      color: "var(--texto-principal)",
                    }}
                  >
                    Qual é o teu PIN?
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    {pin.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        className="pin-digit"
                        autoFocus={i === 0}
                        disabled={loading}
                        style={{} as React.CSSProperties}
                      />
                    ))}
                  </div>

                  {loading && (
                    <p
                      style={{
                        textAlign: "center",
                        fontSize: "13px",
                        color: "var(--texto-secundario)",
                        fontWeight: 600,
                      }}
                    >
                      A verificar...
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleEmailLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "var(--roxo-card)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  cursor: "none",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </form>
          )}

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
                marginTop: "16px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              fontSize: "12px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            <Link href="/login" style={{ color: "var(--texto-secundario)" }}>
              ← Área familiar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
