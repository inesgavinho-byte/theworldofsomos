"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CURRICULOS_CONFIG, type CodigoCurriculo, formatAnoEscolar } from "@/lib/curriculo";

const CURRICULOS_LIST: CodigoCurriculo[] = ["PT", "BNCC", "Cambridge", "IB", "FR"];

const PAPEIS = [
  { valor: "mae", label: "Mãe" },
  { valor: "pai", label: "Pai" },
  { valor: "avo", label: "Avó / Avô" },
  { valor: "irmao", label: "Irmão / Irmã" },
  { valor: "outro", label: "Outro familiar" },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nome, setNome] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [papel, setPapel] = useState("");
  const [curriculo, setCurriculo] = useState<CodigoCurriculo>("PT");
  const [anoEscolar, setAnoEscolar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 4;
  const curriculoConfig = CURRICULOS_CONFIG[curriculo];

  const handleCurriculoChange = (c: CodigoCurriculo) => {
    setCurriculo(c);
    setAnoEscolar(""); // reset when curriculum changes
  };

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
    let { data: membro } = await supabase
      .from("familia_membros")
      .select("familia_id")
      .eq("profile_id", user.id)
      .single();

    // If no family found, auto-create one
    if (!membro?.familia_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();

      const nomeFamilia = profile?.nome
        ? `Família ${profile.nome.split(" ")[0]}`
        : "A minha família";

      const { data: novaFamilia, error: familiaError } = await supabase
        .from("familias")
        .insert({ nome: nomeFamilia, plano: "free" })
        .select()
        .single();

      if (familiaError || !novaFamilia) {
        setError("Erro ao criar a tua família. Tenta outra vez.");
        setLoading(false);
        return;
      }

      await supabase.from("familia_membros").insert({
        familia_id: novaFamilia.id,
        profile_id: user.id,
        papel: papel || "outro",
      });

      membro = { familia_id: novaFamilia.id };
    }

    const { data: novaCrianca, error: insertError } = await supabase
      .from("criancas")
      .insert({
        familia_id: membro.familia_id,
        nome,
        data_nascimento: dataNascimento || null,
        curriculo,
        ano_escolar: anoEscolar,
      })
      .select("id")
      .single();

    if (insertError || !novaCrianca) {
      setError("Erro ao guardar o perfil. Tenta outra vez.");
      setLoading(false);
      return;
    }

    // Redirect to PIN setup so the child can login immediately
    router.push(`/configurar-pin/${novaCrianca.id}`);
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

  const canProceedStep1 = nome.trim().length > 0;
  const canProceedStep2 = papel.length > 0;
  const canProceedStep3 = anoEscolar.length > 0;

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
            {nome ? `Vamos criar o perfil de ${nome}` : "Vamos criar um novo perfil"}
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
          {/* ── Passo 1: Nome + data de nascimento ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Como se chama?
              </h2>
              <div>
                <label style={labelStyle}>Nome da criança</label>
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

          {/* ── Passo 2: Relação com a criança ── */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Qual é a tua relação com {nome || "a criança"}?
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {PAPEIS.map((p) => {
                  const isSelected = papel === p.valor;
                  return (
                    <button
                      key={p.valor}
                      onClick={() => setPapel(p.valor)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: isSelected
                          ? "1.5px solid var(--roxo-tint)"
                          : "1.5px solid rgba(160,144,128,0.25)",
                        background: isSelected ? "rgba(167,139,250,0.1)" : "white",
                        fontFamily: "Nunito, sans-serif",
                        fontWeight: 700,
                        fontSize: "14px",
                        cursor: "none",
                        color: isSelected ? "var(--roxo-texto)" : "var(--texto-principal)",
                        textAlign: "left",
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Passo 3: Sistema de ensino + ano escolar ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Sistema de ensino
              </h2>

              <div>
                <label style={labelStyle}>Currículo</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {CURRICULOS_LIST.map((c) => {
                    const cfg = CURRICULOS_CONFIG[c];
                    const isSelected = curriculo === c;
                    return (
                      <button
                        key={c}
                        onClick={() => handleCurriculoChange(c)}
                        style={{
                          padding: "12px 14px",
                          borderRadius: "12px",
                          border: isSelected
                            ? "1.5px solid var(--roxo-tint)"
                            : "1.5px solid rgba(160,144,128,0.25)",
                          background: isSelected ? "rgba(167,139,250,0.1)" : "white",
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "none",
                          color: isSelected ? "var(--roxo-texto)" : "var(--texto-principal)",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "18px" }}>{cfg.bandeira}</span>
                        <div>
                          <div>{cfg.nome}</div>
                          <div style={{ fontSize: "11px", fontWeight: 600, opacity: 0.6, marginTop: "1px" }}>
                            {cfg.idioma}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ano escolar</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                  {curriculoConfig.anos_display.map((display, idx) => {
                    const valor = curriculoConfig.anos_escolares[idx];
                    const isSelected = anoEscolar === valor;
                    return (
                      <button
                        key={valor}
                        onClick={() => setAnoEscolar(valor)}
                        style={{
                          padding: "9px 6px",
                          borderRadius: "10px",
                          border: isSelected
                            ? "1.5px solid var(--roxo-tint)"
                            : "1.5px solid rgba(160,144,128,0.25)",
                          background: isSelected ? "rgba(167,139,250,0.1)" : "white",
                          fontFamily: "Nunito, sans-serif",
                          fontWeight: 700,
                          fontSize: "12px",
                          cursor: "none",
                          color: isSelected ? "var(--roxo-texto)" : "var(--texto-principal)",
                        }}
                      >
                        {display}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Passo 4: Confirmação ── */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <h2 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500 }}>
                Tudo certo!
              </h2>
              <p style={{ fontSize: "14px", color: "var(--texto-secundario)", fontWeight: 600 }}>
                Confirma os dados antes de criar o perfil.
              </p>

              <div
                style={{
                  background: "white",
                  borderRadius: "14px",
                  padding: "18px",
                  border: "1px solid rgba(160,144,128,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                    Nome
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: 700 }}>{nome}</p>
                </div>

                {dataNascimento && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                      Data de nascimento
                    </p>
                    <p style={{ fontSize: "15px", fontWeight: 700 }}>
                      {new Date(dataNascimento + "T00:00:00").toLocaleDateString("pt-PT")}
                    </p>
                  </div>
                )}

                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                    Currículo
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>{curriculoConfig.bandeira}</span>
                    <p style={{ fontSize: "15px", fontWeight: 700 }}>{curriculoConfig.nome}</p>
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--texto-secundario)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "3px" }}>
                    Ano escolar
                  </p>
                  <p style={{ fontSize: "15px", fontWeight: 700 }}>
                    {formatAnoEscolar(curriculo, anoEscolar)}
                  </p>
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
                onClick={() => {
                  if (step === 1 && !canProceedStep1) return;
                  if (step === 2 && !canProceedStep2) return;
                  if (step === 3 && !canProceedStep3) return;
                  setStep((s) => s + 1);
                }}
                disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3)}
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
                  opacity: (step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3) ? 0.4 : 1,
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
