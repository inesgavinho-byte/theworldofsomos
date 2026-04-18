"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ExercicioDiagnostico {
  id: string;
  competencia_id: string;
  codigo_oficial: string | null;
  area: string;
  dominio: string | null;
  dificuldade: number;
  pergunta: string;
  opcoes: string[];
}

type Fase = "intro" | "exercicio" | "sem-exercicios" | "fim" | "erro";

interface Props {
  nome: string;
}

const AREA_COR: Record<string, string> = {
  "Português": "#a78bfa",
  "Matemática": "#60a5fa",
  "Estudo do Meio": "#4ade80",
};

export default function DiagnosticoClient({ nome }: Props) {
  const router = useRouter();

  const [fase, setFase] = useState<Fase>("intro");
  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);
  const [exercicios, setExercicios] = useState<ExercicioDiagnostico[]>([]);
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [confirmada, setConfirmada] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [inicioQuestao, setInicioQuestao] = useState<number>(0);
  const [aCarregar, setACarregar] = useState(false);
  const [erroTexto, setErroTexto] = useState("");

  const exercicio = exercicios[indice] ?? null;

  const iniciar = useCallback(async () => {
    setACarregar(true);
    setErroTexto("");
    try {
      const res = await fetch("/api/diagnostico/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setErroTexto(data?.erro ?? "Não conseguimos começar agora. Volta em breve.");
        setFase("erro");
        return;
      }
      if (!Array.isArray(data.exercicios) || data.exercicios.length === 0) {
        setFase("sem-exercicios");
        return;
      }
      setDiagnosticoId(data.diagnostico_id);
      setExercicios(data.exercicios);
      setIndice(0);
      setSelecionada(null);
      setConfirmada(false);
      setFeedback("");
      setInicioQuestao(Date.now());
      setFase("exercicio");
    } catch {
      setErroTexto("Não conseguimos começar agora. Volta em breve.");
      setFase("erro");
    } finally {
      setACarregar(false);
    }
  }, []);

  const confirmar = useCallback(() => {
    if (selecionada === null || !exercicio || !diagnosticoId) return;
    setConfirmada(true);
    // Feedback neutro — o diagnóstico não revela acerto/erro.
    setFeedback("Obrigada por esta resposta.");
    const tempo_ms = Math.max(0, Date.now() - inicioQuestao);
    fetch("/api/diagnostico/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagnostico_id: diagnosticoId,
        exercicio_id: exercicio.id,
        resposta: selecionada,
        tempo_ms,
      }),
    }).catch(() => {
      // Silencioso — não bloquear o fluxo.
    });
  }, [selecionada, exercicio, diagnosticoId, inicioQuestao]);

  const avancar = useCallback(() => {
    if (indice + 1 < exercicios.length) {
      setIndice((i) => i + 1);
      setSelecionada(null);
      setConfirmada(false);
      setFeedback("");
      setInicioQuestao(Date.now());
      return;
    }
    if (!diagnosticoId) return;
    fetch("/api/diagnostico/concluir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ diagnostico_id: diagnosticoId }),
    }).finally(() => setFase("fim"));
  }, [indice, exercicios.length, diagnosticoId]);

  useEffect(() => {
    // Fecha silenciosamente como abandonado se o utilizador sai antes do fim.
    if (!diagnosticoId) return;
    const handler = () => {
      if (fase === "exercicio") {
        navigator.sendBeacon?.(
          "/api/diagnostico/concluir",
          new Blob(
            [JSON.stringify({ diagnostico_id: diagnosticoId, abandonado: true })],
            { type: "application/json" },
          ),
        );
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [diagnosticoId, fase]);

  const container: React.CSSProperties = {
    minHeight: "100vh",
    background: "var(--fundo-crianca)",
    padding: "0 0 48px",
  };

  if (fase === "intro") {
    return (
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "24px",
            padding: "40px 32px",
            border: "1px solid rgba(160,144,128,0.15)",
            textAlign: "center",
            animation: "fadeIn 0.5s ease",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--texto-secundario)",
              marginBottom: "12px",
            }}
          >
            Um momento para conhecer
          </p>
          <h1
            className="font-editorial"
            style={{
              fontSize: "32px",
              fontWeight: 500,
              marginBottom: "16px",
              color: "var(--texto-principal)",
            }}
          >
            Olá{nome ? `, ${nome}` : ""}.
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            Vamos conhecer o que já sabes. Não é um teste — é só para percebermos em que
            é que te podemos ajudar melhor. Vai demorar uns 15 minutos.
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              lineHeight: 1.7,
              marginBottom: "32px",
              fontStyle: "italic",
            }}
          >
            Não te preocupes com acertar ou não — todas as respostas ajudam.
          </p>
          <button
            onClick={iniciar}
            disabled={aCarregar}
            style={{
              background: "#a78bfa",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 800,
              fontFamily: "Nunito, sans-serif",
              letterSpacing: "0.02em",
              cursor: "none",
              opacity: aCarregar ? 0.6 : 1,
            }}
          >
            {aCarregar ? "A preparar…" : "Começar"}
          </button>
          <div style={{ marginTop: "18px" }}>
            <button
              onClick={() => router.push("/crianca/dashboard")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--texto-secundario)",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "none",
              }}
            >
              Voltar ao meu mundo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "sem-exercicios") {
    return (
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "24px",
            padding: "40px 32px",
            border: "1px solid rgba(160,144,128,0.15)",
          }}
        >
          <h2
            className="font-editorial"
            style={{ fontSize: "26px", fontWeight: 500, marginBottom: "12px" }}
          >
            Ainda estamos a preparar o material.
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            Volta em breve — vamos ter actividades à tua espera.
          </p>
          <button
            onClick={() => router.push("/crianca/dashboard")}
            style={{
              background: "#a78bfa",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "none",
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (fase === "erro") {
    return (
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "24px",
            padding: "40px 32px",
            border: "1px solid rgba(160,144,128,0.15)",
          }}
        >
          <h2
            className="font-editorial"
            style={{ fontSize: "24px", fontWeight: 500, marginBottom: "12px" }}
          >
            Não foi possível começar agora.
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            {erroTexto}
          </p>
          <button
            onClick={() => router.push("/crianca/dashboard")}
            style={{
              background: "#a78bfa",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "12px 28px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: "none",
            }}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (fase === "fim") {
    return (
      <div
        style={{
          ...container,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            background: "rgba(255,255,255,0.7)",
            borderRadius: "24px",
            padding: "40px 32px",
            border: "1px solid rgba(160,144,128,0.15)",
            animation: "fadeIn 0.6s ease",
          }}
        >
          <h2
            className="font-editorial"
            style={{ fontSize: "34px", fontWeight: 500, marginBottom: "12px" }}
          >
            Obrigada.
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              lineHeight: 1.7,
              marginBottom: "28px",
            }}
          >
            Acabaste. Agora voltas ao teu mundo — as tuas próximas explorações já estão
            à tua espera.
          </p>
          <button
            onClick={() => router.push("/crianca/dashboard")}
            style={{
              background: "#a78bfa",
              color: "white",
              border: "none",
              borderRadius: "14px",
              padding: "14px 32px",
              fontSize: "15px",
              fontWeight: 800,
              cursor: "none",
            }}
          >
            Voltar ao meu mundo
          </button>
        </div>
      </div>
    );
  }

  // Fase exercicio
  if (!exercicio) return null;
  const corArea = AREA_COR[exercicio.area] ?? "#a78bfa";

  return (
    <div style={container}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(160,144,128,0.1)",
        }}
      >
        <button
          onClick={() => router.push("/crianca/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            cursor: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M5 12L11 6M5 12L11 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Sair
        </button>
        <h1 className="font-editorial" style={{ fontSize: "18px", fontWeight: 500 }}>
          Vamos conhecer-te
        </h1>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--texto-secundario)",
            letterSpacing: "0.04em",
          }}
        >
          Pergunta {indice + 1}
        </span>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "24px 20px" }}>
        <div
          className="badge-dimensao"
          style={{
            background: `${corArea}18`,
            color: corArea,
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: corArea,
            }}
          />
          {exercicio.area}
          {exercicio.dominio ? ` · ${exercicio.dominio}` : ""}
        </div>

        <div
          className="card-dashed"
          style={{ padding: "24px", marginBottom: "20px", background: "rgba(255,255,255,0.5)" }}
        >
          <p
            className="font-editorial"
            style={{ fontSize: "22px", fontWeight: 500, lineHeight: 1.4 }}
          >
            {exercicio.pergunta}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {exercicio.opcoes.map((opcao, i) => {
            const escolhida = selecionada === i;
            const fundo = escolhida
              ? confirmada
                ? "rgba(167,139,250,0.18)"
                : "rgba(167,139,250,0.12)"
              : "rgba(255,255,255,0.6)";
            const borda = escolhida
              ? `1.5px solid ${corArea}`
              : "1.5px solid rgba(160,144,128,0.18)";
            return (
              <button
                key={i}
                onClick={() => !confirmada && setSelecionada(i)}
                disabled={confirmada}
                style={{
                  background: fundo,
                  border: borda,
                  borderRadius: "16px",
                  padding: "16px 18px",
                  textAlign: "left",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: confirmada ? "default" : "none",
                  color: "var(--texto-principal)",
                  fontFamily: "Nunito, sans-serif",
                  transition: "background 0.2s, border 0.2s",
                }}
              >
                {opcao}
              </button>
            );
          })}
        </div>

        {confirmada && (
          <p
            style={{
              marginTop: "18px",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              textAlign: "center",
              fontStyle: "italic",
            }}
          >
            {feedback}
          </p>
        )}

        <div style={{ marginTop: "24px", display: "flex", justifyContent: "center" }}>
          {confirmada ? (
            <button
              onClick={avancar}
              style={{
                background: corArea,
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "12px 30px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: "none",
              }}
            >
              {indice + 1 < exercicios.length ? "Próxima" : "Terminar"}
            </button>
          ) : (
            <button
              onClick={confirmar}
              disabled={selecionada === null}
              style={{
                background: selecionada === null ? "rgba(160,144,128,0.2)" : corArea,
                color: selecionada === null ? "var(--texto-secundario)" : "white",
                border: "none",
                borderRadius: "14px",
                padding: "12px 30px",
                fontSize: "15px",
                fontWeight: 800,
                cursor: selecionada === null ? "default" : "none",
              }}
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
