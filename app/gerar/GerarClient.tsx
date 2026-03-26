"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Exercicio {
  pergunta: string;
  opcoes: string[];
  resposta_correcta: number;
  explicacao: string;
}

interface ResultadoIA {
  dimensao: string;
  tema: string;
  exercicios: Exercicio[];
}

const DIMENSAO_CORES: Record<
  string,
  { cor: string; corTexto: string; nome: string }
> = {
  naturalista: { cor: "#4ade80", corTexto: "#2d5c3a", nome: "Naturalista" },
  logica: { cor: "#60a5fa", corTexto: "#185fa5", nome: "Lógica" },
  artistica: { cor: "#f472b6", corTexto: "#9d3270", nome: "Artística" },
  social: { cor: "#facc15", corTexto: "#854f0b", nome: "Social" },
  identitaria: { cor: "#a78bfa", corTexto: "#534ab7", nome: "Identitária" },
};

const MENSAGENS_PROCESSANDO = [
  "A ler o teu livro...",
  "A identificar os conceitos...",
  "A criar os exercícios...",
  "Quase pronto!",
];

interface Props {
  familiaId: string | null;
  criancas: any[];
}

export default function GerarClient({ familiaId, criancas }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [passo, setPasso] = useState<"upload" | "processando" | "resultado">(
    "upload"
  );
  const [tipoUpload, setTipoUpload] = useState<"imagem" | "pdf">("imagem");
  const [, setFicheiro] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<string>("image/jpeg");
  const [criancaId, setCriancaId] = useState<string>(criancas[0]?.id ?? "");
  const [numeroPagina, setNumeroPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [pdfDocRef, setPdfDocRef] = useState<any>(null);
  const [resultado, setResultado] = useState<ResultadoIA | null>(null);
  const [exerciciosEditaveis, setExerciciosEditaveis] = useState<Exercicio[]>(
    []
  );
  const [erro, setErro] = useState<string | null>(null);
  const [mensagemIdx, setMensagemIdx] = useState(0);
  const [exercicioAtual, setExercicioAtual] = useState(0);
  const [modoEditar, setModoEditar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const criancaAtual = criancas.find((c) => c.id === criancaId);

  // Cycle processing messages
  useEffect(() => {
    if (passo !== "processando") return;
    setMensagemIdx(0);
    const interval = setInterval(() => {
      setMensagemIdx((prev) =>
        prev < MENSAGENS_PROCESSANDO.length - 1 ? prev + 1 : prev
      );
    }, 2000);
    return () => clearInterval(interval);
  }, [passo]);

  function calcularAnoEscolar(dataNasc: string | null): string {
    if (!dataNasc) return "Ensino Básico";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    const idade = hoje.getFullYear() - nasc.getFullYear();
    if (idade < 6) return "Pré-escolar";
    if (idade <= 15) return `${idade - 5}º ano`;
    return "Ensino Secundário";
  }

  const processarImagem = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setErro("Imagem demasiado grande. Máximo 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImagemBase64(dataUrl.split(",")[1]);
      const mt =
        file.type === "image/png"
          ? "image/png"
          : file.type === "image/webp"
          ? "image/webp"
          : "image/jpeg";
      setMediaType(mt);
    };
    reader.readAsDataURL(file);
  };

  const renderPdfPagina = async (file: File, pageNum: number) => {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      }

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPaginas(pdf.numPages);
      setPdfDocRef(pdf);

      const page = await pdf.getPage(pageNum);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const viewport = page.getViewport({ scale: 2 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setPreview(dataUrl);
      setImagemBase64(dataUrl.split(",")[1]);
      setMediaType("image/jpeg");
    } catch {
      setErro("Este PDF não é suportado. Tenta converter para imagem JPG.");
    }
  };

  const handleFicheiro = async (file: File) => {
    setErro(null);
    setFicheiro(file);
    if (file.type === "application/pdf") {
      setTipoUpload("pdf");
      setNumeroPagina(1);
      await renderPdfPagina(file, 1);
    } else {
      setTipoUpload("imagem");
      await processarImagem(file);
    }
  };

  const handleChangePagina = async (novaPage: number) => {
    if (!pdfDocRef) return;
    setNumeroPagina(novaPage);
    const page = await pdfDocRef.getPage(novaPage);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const viewport = page.getViewport({ scale: 2 });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPreview(dataUrl);
    setImagemBase64(dataUrl.split(",")[1]);
  };

  const handleGerar = async () => {
    if (!imagemBase64) {
      setErro("Selecciona uma imagem ou PDF primeiro.");
      return;
    }

    const crianca = criancas.find((c) => c.id === criancaId);
    setPasso("processando");
    setErro(null);

    try {
      const res = await fetch("/api/gerar-exercicios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagemBase64,
          mediaType,
          curriculo: crianca?.curriculo ?? "PT",
          anoEscolar: crianca
            ? calcularAnoEscolar(crianca.data_nascimento)
            : "Ensino Básico",
          idioma:
            crianca?.pais === "BR"
              ? "Português (Brasil)"
              : "Português (Portugal)",
          criancaId: criancaId || null,
          tipoUpload,
          storagePath: null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.erro ?? "Erro ao gerar exercícios");

      setResultado(data.exercicios);
      setExerciciosEditaveis(
        JSON.parse(JSON.stringify(data.exercicios.exercicios))
      );
      setPasso("resultado");
      setExercicioAtual(0);
    } catch (err: any) {
      setPasso("upload");
      setErro(err.message);
    }
  };

  const handleEnviar = async () => {
    if (!resultado || !familiaId) return;
    const supabase = createClient();
    const exerciciosFinais = modoEditar
      ? exerciciosEditaveis
      : resultado.exercicios;

    const { error } = await supabase.from("desafios_familia").insert({
      familia_id: familiaId,
      crianca_id: criancaId || null,
      tipo: "exercicios_ia",
      conteudo: { ...resultado, exercicios: exerciciosFinais },
      estado: "pendente",
      respostas: null,
    });

    if (error) {
      setErro("Erro ao enviar exercícios. Tenta novamente.");
      return;
    }

    setEnviado(true);
    setTimeout(() => router.push("/dashboard"), 2200);
  };

  const resetar = () => {
    setPasso("upload");
    setResultado(null);
    setPreview(null);
    setImagemBase64(null);
    setFicheiro(null);
    setModoEditar(false);
    setErro(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const dim = resultado
    ? DIMENSAO_CORES[resultado.dimensao] ?? DIMENSAO_CORES.logica
    : DIMENSAO_CORES.logica;

  // ── Enviado ──────────────────────────────────────────────────────────────
  if (enviado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--fundo-pai)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(74,222,128,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
          }}
        >
          ✓
        </div>
        <p
          className="font-editorial"
          style={{ fontSize: "24px", fontWeight: 500 }}
        >
          Exercícios enviados!
        </p>
        <p
          style={{
            fontSize: "14px",
            color: "var(--texto-secundario)",
            fontWeight: 600,
          }}
        >
          {criancaAtual?.nome ?? "A criança"} já pode começar a jogar. 📚
        </p>
      </div>
    );
  }

  // ── Processando ──────────────────────────────────────────────────────────
  if (passo === "processando") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--fundo-pai)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "32px",
        }}
      >
        <div style={{ animation: "pulseSoft 2s ease-in-out infinite" }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <rect
              x="4"
              y="4"
              width="24"
              height="24"
              rx="3"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            <path
              d="M16 4V28"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M8 10H12M8 14H13M8 18H11"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M20 10H24M19 14H24M21 18H24"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            className="font-editorial"
            style={{
              fontSize: "22px",
              fontWeight: 500,
              marginBottom: "8px",
              minHeight: "32px",
            }}
          >
            {MENSAGENS_PROCESSANDO[mensagemIdx]}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            A IA está a analisar o teu livro
          </p>
        </div>
        <div
          style={{
            width: "240px",
            height: "4px",
            background: "rgba(96,165,250,0.15)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: "40%",
              background: "#60a5fa",
              borderRadius: "2px",
              animation: "shimmer 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  // ── Resultado ────────────────────────────────────────────────────────────
  if (passo === "resultado" && resultado) {
    const exs = modoEditar ? exerciciosEditaveis : resultado.exercicios;
    const ex = exs[exercicioAtual];

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--fundo-pai)",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "28px",
            }}
          >
            <h1
              className="font-editorial"
              style={{ fontSize: "26px", fontWeight: 500 }}
            >
              SOMOS
            </h1>
            <button
              onClick={resetar}
              style={{
                background: "transparent",
                border: "1.5px solid rgba(160,144,128,0.3)",
                borderRadius: "10px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                color: "var(--texto-secundario)",
                cursor: "none",
              }}
            >
              Recomeçar
            </button>
          </div>

          {/* Tema + Dimensão */}
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "20px",
              padding: "20px 24px",
              border: "1px solid rgba(160,144,128,0.15)",
              marginBottom: "14px",
            }}
          >
            <div
              className="badge-dimensao"
              style={{
                background: `${dim.cor}18`,
                color: dim.corTexto,
                marginBottom: "10px",
                display: "inline-flex",
              }}
            >
              <div
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: dim.cor,
                }}
              />
              {dim.nome}
            </div>
            <p
              className="font-editorial"
              style={{ fontSize: "20px", fontWeight: 500, lineHeight: 1.3 }}
            >
              {resultado.tema}
            </p>
          </div>

          {/* Exercício actual */}
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "20px",
              padding: "24px",
              border: "1px solid rgba(160,144,128,0.15)",
              marginBottom: "14px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                marginBottom: "14px",
              }}
            >
              Exercício {exercicioAtual + 1} de {exs.length}
            </p>

            {modoEditar ? (
              <>
                <textarea
                  value={ex.pergunta}
                  onChange={(e) => {
                    const updated = [...exerciciosEditaveis];
                    updated[exercicioAtual] = {
                      ...updated[exercicioAtual],
                      pergunta: e.target.value,
                    };
                    setExerciciosEditaveis(updated);
                  }}
                  style={{
                    width: "100%",
                    fontFamily: "Nunito, sans-serif",
                    fontSize: "15px",
                    fontWeight: 700,
                    border: "1.5px solid rgba(160,144,128,0.3)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    background: "transparent",
                    marginBottom: "14px",
                    resize: "none",
                    minHeight: "64px",
                    boxSizing: "border-box",
                  }}
                />
                {ex.opcoes.map((op, i) => (
                  <input
                    key={i}
                    value={op}
                    onChange={(e) => {
                      const updated = [...exerciciosEditaveis];
                      const opcoes = [...updated[exercicioAtual].opcoes];
                      opcoes[i] = e.target.value;
                      updated[exercicioAtual] = {
                        ...updated[exercicioAtual],
                        opcoes,
                      };
                      setExerciciosEditaveis(updated);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      fontFamily: "Nunito, sans-serif",
                      fontSize: "13px",
                      fontWeight: i === ex.resposta_correcta ? 800 : 600,
                      border: `1.5px solid ${i === ex.resposta_correcta ? dim.cor : "rgba(160,144,128,0.25)"}`,
                      borderRadius: "10px",
                      padding: "8px 12px",
                      background:
                        i === ex.resposta_correcta
                          ? `${dim.cor}12`
                          : "transparent",
                      marginBottom: "8px",
                      boxSizing: "border-box",
                    }}
                  />
                ))}
                <p
                  style={{
                    fontSize: "11px",
                    color: dim.corTexto,
                    fontWeight: 700,
                    marginTop: "4px",
                  }}
                >
                  * Resposta correcta destacada a{" "}
                  {dim.nome.toLowerCase()}
                </p>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    marginBottom: "18px",
                    lineHeight: 1.4,
                  }}
                >
                  {ex.pergunta}
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                  }}
                >
                  {ex.opcoes.map((op, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "12px",
                        border: "1.5px solid rgba(160,144,128,0.2)",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: "rgba(255,255,255,0.5)",
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          color: dim.corTexto,
                          marginRight: "6px",
                        }}
                      >
                        {String.fromCharCode(65 + i)}.
                      </span>
                      {op}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Dots de navegação */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            {exs.map((_, i) => (
              <button
                key={i}
                onClick={() => setExercicioAtual(i)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  background:
                    i === exercicioAtual ? dim.cor : "rgba(160,144,128,0.2)",
                  color:
                    i === exercicioAtual ? "white" : "var(--texto-secundario)",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "none",
                  fontFamily: "Nunito, sans-serif",
                  transition: "all 0.2s",
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Erros */}
          {erro && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "12px",
                padding: "10px 14px",
                background: "rgba(239,68,68,0.08)",
                borderRadius: "10px",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              {erro}
            </p>
          )}

          {/* Acções */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={handleEnviar}
              style={{
                flex: 1,
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: dim.cor,
                color: dim.corTexto,
                fontSize: "14px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                cursor: "none",
              }}
            >
              ✓ Enviar para {criancaAtual?.nome ?? "filho(a)"}
            </button>
            <button
              onClick={() => {
                setModoEditar(!modoEditar);
                setErro(null);
              }}
              style={{
                padding: "14px 20px",
                borderRadius: "14px",
                border: "1.5px solid rgba(160,144,128,0.3)",
                background: modoEditar ? "rgba(160,144,128,0.1)" : "transparent",
                fontSize: "14px",
                fontWeight: 800,
                fontFamily: "Nunito, sans-serif",
                color: "var(--texto-secundario)",
                cursor: "none",
              }}
            >
              {modoEditar ? "✓ Feito" : "✎ Editar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Upload ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <Link href="/dashboard">
            <button
              style={{
                background: "transparent",
                border: "1.5px solid rgba(160,144,128,0.3)",
                borderRadius: "10px",
                padding: "6px 14px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                color: "var(--texto-secundario)",
                cursor: "none",
              }}
            >
              ← Voltar
            </button>
          </Link>
          <div>
            <h1
              className="font-editorial"
              style={{ fontSize: "26px", fontWeight: 500, lineHeight: 1 }}
            >
              Gerar exercícios
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "var(--texto-secundario)",
                fontWeight: 600,
                marginTop: "2px",
              }}
            >
              Tira uma foto a qualquer página do livro
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          style={{
            background: "rgba(245,242,236,0.9)",
            borderRadius: "20px",
            padding: "24px",
            border: `2px ${dragOver ? "solid #60a5fa" : "dashed rgba(160,144,128,0.25)"}`,
            marginBottom: "16px",
            transition: "border-color 0.2s",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFicheiro(file);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFicheiro(file);
            }}
          />

          {preview ? (
            <div>
              <img
                src={preview}
                alt="Preview da página"
                style={{
                  width: "100%",
                  maxHeight: "320px",
                  objectFit: "contain",
                  borderRadius: "12px",
                  marginBottom: "14px",
                  background: "white",
                }}
              />
              {tipoUpload === "pdf" && totalPaginas > 1 && (
                <div style={{ marginBottom: "14px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--texto-secundario)",
                      }}
                    >
                      Página seleccionada
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#60a5fa",
                      }}
                    >
                      {numeroPagina} / {totalPaginas}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={totalPaginas}
                    value={numeroPagina}
                    onChange={(e) =>
                      handleChangePagina(Number(e.target.value))
                    }
                    style={{ width: "100%", cursor: "none" }}
                  />
                </div>
              )}
              <button
                onClick={resetar}
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(160,144,128,0.3)",
                  borderRadius: "10px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: "Nunito, sans-serif",
                  color: "var(--texto-secundario)",
                  cursor: "none",
                }}
              >
                Remover
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "44px", marginBottom: "12px" }}>📷</div>
              <p
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  marginBottom: "6px",
                }}
              >
                Tira uma foto à página do livro
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--texto-secundario)",
                  fontWeight: 600,
                  marginBottom: "22px",
                }}
              >
                Arrasta aqui, ou escolhe abaixo
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={() => {
                    if (!inputRef.current) return;
                    inputRef.current.accept = "image/*";
                    inputRef.current.setAttribute("capture", "environment");
                    inputRef.current.click();
                  }}
                  style={{
                    background: "#60a5fa",
                    color: "#185fa5",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontFamily: "Nunito, sans-serif",
                    cursor: "none",
                  }}
                >
                  📱 Tirar foto
                </button>
                <button
                  onClick={() => {
                    if (!inputRef.current) return;
                    inputRef.current.accept =
                      "image/jpeg,image/png,image/webp,image/heic,.heic";
                    inputRef.current.removeAttribute("capture");
                    inputRef.current.click();
                  }}
                  style={{
                    background: "transparent",
                    border: "1.5px solid rgba(160,144,128,0.3)",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontFamily: "Nunito, sans-serif",
                    color: "var(--texto-secundario)",
                    cursor: "none",
                  }}
                >
                  Imagem
                </button>
                <button
                  onClick={() => {
                    if (!inputRef.current) return;
                    inputRef.current.accept = "application/pdf";
                    inputRef.current.removeAttribute("capture");
                    inputRef.current.click();
                  }}
                  style={{
                    background: "transparent",
                    border: "1.5px solid rgba(160,144,128,0.3)",
                    borderRadius: "12px",
                    padding: "10px 20px",
                    fontSize: "13px",
                    fontWeight: 800,
                    fontFamily: "Nunito, sans-serif",
                    color: "var(--texto-secundario)",
                    cursor: "none",
                  }}
                >
                  PDF
                </button>
              </div>
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--texto-secundario)",
                  fontWeight: 600,
                  marginTop: "14px",
                  opacity: 0.6,
                }}
              >
                JPG, PNG, WEBP, HEIC (máx. 10MB) · PDF (máx. 20MB)
              </p>
            </div>
          )}
        </div>

        {/* Selector de criança */}
        {criancas.length > 0 && (
          <div
            style={{
              background: "rgba(245,242,236,0.9)",
              borderRadius: "20px",
              padding: "20px",
              border: "1px solid rgba(160,144,128,0.15)",
              marginBottom: "16px",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                marginBottom: "12px",
              }}
            >
              Para quem é?
            </p>
            {criancas.length === 1 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "rgba(167,139,250,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: 800,
                  }}
                >
                  {criancas[0].nome?.charAt(0) ?? "?"}
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 800 }}>
                    {criancas[0].nome}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--texto-secundario)",
                      fontWeight: 600,
                    }}
                  >
                    {criancas[0].curriculo} ·{" "}
                    {calcularAnoEscolar(criancas[0].data_nascimento)}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {criancas.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCriancaId(c.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "12px",
                      border: `1.5px solid ${c.id === criancaId ? "rgba(167,139,250,0.5)" : "rgba(160,144,128,0.2)"}`,
                      background:
                        c.id === criancaId
                          ? "rgba(167,139,250,0.08)"
                          : "transparent",
                      cursor: "none",
                      fontFamily: "Nunito, sans-serif",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background:
                          c.id === criancaId
                            ? "rgba(167,139,250,0.3)"
                            : "rgba(160,144,128,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        fontWeight: 800,
                      }}
                    >
                      {c.nome?.charAt(0) ?? "?"}
                    </div>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 700 }}>
                        {c.nome}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "var(--texto-secundario)",
                          fontWeight: 600,
                        }}
                      >
                        {c.curriculo} · {calcularAnoEscolar(c.data_nascimento)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Erro */}
        {erro && (
          <p
            style={{
              color: "#ef4444",
              fontSize: "13px",
              fontWeight: 700,
              marginBottom: "12px",
              padding: "12px 16px",
              background: "rgba(239,68,68,0.08)",
              borderRadius: "12px",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            {erro}
          </p>
        )}

        {/* CTA principal */}
        <button
          onClick={handleGerar}
          disabled={!imagemBase64}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "16px",
            border: "none",
            background: imagemBase64
              ? "#60a5fa"
              : "rgba(160,144,128,0.2)",
            color: imagemBase64 ? "#185fa5" : "var(--texto-secundario)",
            fontSize: "15px",
            fontWeight: 800,
            fontFamily: "Nunito, sans-serif",
            cursor: imagemBase64 ? "none" : "not-allowed",
            transition: "all 0.2s",
          }}
        >
          {imagemBase64
            ? "Gerar exercícios →"
            : "Selecciona uma imagem primeiro"}
        </button>
      </div>
    </div>
  );
}
