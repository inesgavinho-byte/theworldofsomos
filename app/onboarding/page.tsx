"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const CURRICULOS = ["PT", "Cambridge", "IB", "outro"];
const PAISES = ["Portugal", "Brasil", "Angola", "Moçambique", "Reino Unido", "outro"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [escola, setEscola] = useState("");
  const [curriculo, setCurriculo] = useState("PT");
  const [pais, setPais] = useState("Portugal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 3;

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Get user's family
    const { data: membro } = await supabase
      .from("familia_membros")
      .select("familia_id")
      .eq("profile_id", user.id)
      .single();

    if (!membro?.familia_id) {
      setError("Erro ao encontrar a tua família. Tenta outra vez.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("criancas").insert({
      familia_id: membro.familia_id,
      nome,
      data_nascimento: dataNascimento || null,
      escola,
      curriculo,
      pais,
    });

    if (insertError) {
      setError("Erro ao guardar o perfil. Tenta outra vez.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "var(--texto-secundario)",
    marginBottom: "8px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
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
      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 className="font-editorial" style={{ fontSize: "36px", fontWeight: 500 }}>
            SOMOS
          </h1>
          <p style={{ fontSize: "14px", color: "var(--texto-secundario)", marginTop: "4px", fontWeight: 600 }}>
            Vamos criar o perfil do teu filho
          </p>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "3px",
                borderRadius: "2px",
                background: i < step ? "var(--roxo-tint)" : "rgba(160,144,128,0.2)",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        <div
          style={{
            background: "rgba(245,242,236,0.9)",
            backdropFilter: "blur(20px)",
            borderRadius: "24px",
            padding: "32px",
            border: "1px solid rgba(160,144,128,0.2)",
          }}
        >
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Como se chama?
              </h2>
              <div>
                <label style={labelStyle}>Nome do filho</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Maria Silva"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Data de nascimento</label>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Onde estuda?
              </h2>
              <div>
                <label style={labelStyle}>Nome da escola</label>
                <input
                  type="text"
                  value={escola}
                  onChange={(e) => setEscola(e.target.value)}
                  placeholder="Escola Básica..."
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Currículo</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {CURRICULOS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurriculo(c)}
                      style={{
                        padding: "10px",
                        borderRadius: "10px",
                        border: curriculo === c
                          ? "1.5px solid var(--roxo-tint)"
                          : "1.5px solid rgba(160,144,128,0.25)",
                        background: curriculo === c ? "rgba(167,139,250,0.1)" : "white",
                        fontFamily: "Nunito, sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "none",
                        color: curriculo === c ? "var(--roxo-texto)" : "var(--texto-principal)",
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Onde vivem?
              </h2>
              <div>
                <label style={labelStyle}>País</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {PAISES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPais(p)}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: pais === p
                          ? "1.5px solid var(--roxo-tint)"
                          : "1.5px solid rgba(160,144,128,0.2)",
                        background: pais === p ? "rgba(167,139,250,0.1)" : "white",
                        fontFamily: "Nunito, sans-serif",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "none",
                        color: pais === p ? "var(--roxo-texto)" : "var(--texto-principal)",
                        textAlign: "left",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                marginTop: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1.5px solid rgba(160,144,128,0.3)",
                  borderRadius: "12px",
                  padding: "13px",
                  fontSize: "14px",
                  fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  color: "var(--texto-secundario)",
                  cursor: "none",
                }}
              >
                Voltar
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={() => step === 1 && !nome.trim() ? null : setStep((s) => s + 1)}
                disabled={step === 1 && !nome.trim()}
                style={{
                  flex: 2,
                  background: "var(--texto-principal)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 800,
                  fontFamily: "Nunito, sans-serif",
                  cursor: "none",
                  opacity: step === 1 && !nome.trim() ? 0.4 : 1,
                }}
              >
                Continuar
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  flex: 2,
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
                {loading ? "A guardar..." : "Criar perfil"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
