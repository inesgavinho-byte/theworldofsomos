"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AUTOR_LABELS,
  EntradaDiario,
  formatDataCompleta,
  TIPO_CORES,
  TIPO_LABELS,
} from "@/lib/diario";
import EntradaForm, { PayloadEntrada } from "../_components/EntradaForm";
import Markdown from "../_components/Markdown";

interface Props {
  entrada: EntradaDiario;
  tagsDisponiveis: string[];
}

export default function EntradaClient({ entrada: inicial, tagsDisponiveis }: Props) {
  const router = useRouter();
  const [entrada, setEntrada] = useState<EntradaDiario>(inicial);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [aApagar, setAApagar] = useState(false);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const cores = TIPO_CORES[entrada.tipo];

  const guardar = async (payload: PayloadEntrada): Promise<string | null> => {
    try {
      const res = await fetch(`/api/admin/diario/${entrada.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return json?.erro ?? "Não foi possível guardar a entrada.";
      }
      if (json?.entrada) {
        setEntrada(json.entrada as EntradaDiario);
      }
      setModoEdicao(false);
      router.refresh();
      return null;
    } catch {
      return "Não foi possível ligar ao servidor.";
    }
  };

  const apagar = async () => {
    setAApagar(true);
    setAviso(null);
    try {
      const res = await fetch(`/api/admin/diario/${entrada.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível apagar a entrada.");
        setAApagar(false);
        return;
      }
      router.push("/admin/diario");
      router.refresh();
    } catch {
      setAviso("Não foi possível ligar ao servidor.");
      setAApagar(false);
    }
  };

  if (modoEdicao) {
    return (
      <div
        style={{
          background: "rgba(245,242,236,0.9)",
          borderRadius: "14px",
          border: "1px solid rgba(160,144,128,0.15)",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <h2
            className="font-editorial"
            style={{ fontSize: "22px", fontWeight: 500, margin: 0 }}
          >
            A editar entrada
          </h2>
        </div>
        <EntradaForm
          entrada={entrada}
          tagsDisponiveis={tagsDisponiveis}
          onSubmit={guardar}
          onCancel={() => setModoEdicao(false)}
          textoSubmit="Guardar alterações"
        />
      </div>
    );
  }

  return (
    <article
      style={{
        background: "rgba(245,242,236,0.9)",
        borderRadius: "14px",
        border: "1px solid rgba(160,144,128,0.15)",
        padding: "26px 28px",
      }}
    >
      <header style={{ marginBottom: "22px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "10px",
            marginBottom: "12px",
          }}
        >
          <span
            style={{
              background: cores.bg,
              color: cores.cor,
              border: `1px solid ${cores.borda}`,
              borderRadius: "6px",
              padding: "3px 12px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            {TIPO_LABELS[entrada.tipo]}
          </span>

          <span
            style={{
              padding: "2px 10px",
              borderRadius: "999px",
              background: "rgba(160,144,128,0.12)",
              color: "var(--texto-secundario)",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {AUTOR_LABELS[entrada.autor]}
          </span>

          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--texto-secundario)",
              fontFamily: "monospace",
            }}
          >
            {formatDataCompleta(entrada.created_at)}
          </span>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setModoEdicao(true)}
              style={{
                background: "transparent",
                border: "1.5px solid rgba(160,144,128,0.3)",
                borderRadius: "10px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--texto-secundario)",
                cursor: "pointer",
              }}
            >
              Editar
            </button>
            <button
              onClick={() => setConfirmarApagar(true)}
              style={{
                background: "transparent",
                border: "1.5px solid rgba(244,114,182,0.4)",
                borderRadius: "10px",
                padding: "7px 14px",
                fontSize: "12px",
                fontWeight: 700,
                color: "#9d174d",
                cursor: "pointer",
              }}
            >
              Apagar
            </button>
          </div>
        </div>

        <h1
          className="font-editorial"
          style={{ fontSize: "28px", fontWeight: 500, margin: 0, lineHeight: 1.25 }}
        >
          {entrada.titulo}
        </h1>
      </header>

      {aviso && (
        <p
          role="alert"
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#7a2a2a",
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            borderRadius: "10px",
            padding: "10px 14px",
            marginBottom: "14px",
          }}
        >
          {aviso}
        </p>
      )}

      {confirmarApagar && (
        <div
          style={{
            background: "rgba(244,114,182,0.08)",
            border: "1px solid rgba(244,114,182,0.35)",
            borderRadius: "12px",
            padding: "14px 16px",
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#9d174d",
              margin: 0,
              flex: 1,
              minWidth: "220px",
            }}
          >
            Apagar esta entrada? Esta acção não pode ser desfeita.
          </p>
          <button
            onClick={() => setConfirmarApagar(false)}
            disabled={aApagar}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "10px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              cursor: aApagar ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={apagar}
            disabled={aApagar}
            style={{
              background: "#be185d",
              border: "none",
              borderRadius: "10px",
              padding: "7px 14px",
              fontSize: "12px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "0.04em",
              cursor: aApagar ? "not-allowed" : "pointer",
              opacity: aApagar ? 0.7 : 1,
            }}
          >
            {aApagar ? "A apagar…" : "Apagar definitivamente"}
          </button>
        </div>
      )}

      {entrada.contexto && (
        <Seccao titulo="Contexto">
          <Markdown source={entrada.contexto} />
        </Seccao>
      )}

      <Seccao titulo="Conteúdo">
        <Markdown source={entrada.conteudo} />
      </Seccao>

      {entrada.implicacoes && (
        <Seccao titulo="Implicações">
          <Markdown source={entrada.implicacoes} />
        </Seccao>
      )}

      {entrada.referencias.length > 0 && (
        <Seccao titulo="Referências">
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {entrada.referencias.map((r, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                {r.tipo && (
                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: "999px",
                      background: "rgba(160,144,128,0.14)",
                      color: "var(--texto-secundario)",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      fontFamily: "monospace",
                    }}
                  >
                    {r.tipo}
                  </span>
                )}
                {r.url ? (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "var(--roxo-texto)",
                    }}
                  >
                    {r.label || r.url}
                  </a>
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {r.label}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Seccao>
      )}

      {entrada.tags.length > 0 && (
        <Seccao titulo="Tags">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {entrada.tags.map((t) => (
              <span
                key={t}
                style={{
                  padding: "3px 12px",
                  borderRadius: "999px",
                  background: "rgba(167,139,250,0.14)",
                  color: "#6d49c9",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </Seccao>
      )}

      <footer
        style={{
          marginTop: "26px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(160,144,128,0.15)",
          display: "flex",
          flexWrap: "wrap",
          gap: "18px",
          fontSize: "11px",
          fontWeight: 600,
          color: "var(--texto-secundario)",
          fontFamily: "monospace",
        }}
      >
        <span>Criado {formatDataCompleta(entrada.created_at)}</span>
        {entrada.updated_at !== entrada.created_at && (
          <span>Actualizado {formatDataCompleta(entrada.updated_at)}</span>
        )}
      </footer>
    </article>
  );
}

function Seccao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "20px" }}>
      <h2
        style={{
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--texto-secundario)",
          marginBottom: "8px",
          margin: "0 0 8px",
        }}
      >
        {titulo}
      </h2>
      {children}
    </section>
  );
}
