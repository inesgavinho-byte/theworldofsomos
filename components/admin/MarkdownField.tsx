"use client";

import { useMemo } from "react";

/**
 * Editor mínimo de markdown com preview lado a lado.
 * Não usa bibliotecas externas — renderiza um subconjunto seguro:
 * parágrafos, **negrito**, *itálico*, cabeçalhos # ## ###, listas - e 1.
 *
 * O objectivo aqui é ajudar a Ines a ver o texto formatado enquanto
 * edita — não é um renderer completo de CommonMark.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderInline(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  return out;
}

function renderMarkdown(md: string): string {
  if (!md) return "";
  const lines = md.split(/\r?\n/);
  const html: string[] = [];
  let listaAberta: "ul" | "ol" | null = null;

  const fecharLista = () => {
    if (listaAberta) {
      html.push(listaAberta === "ul" ? "</ul>" : "</ol>");
      listaAberta = null;
    }
  };

  for (const linha of lines) {
    const bruta = linha.trimEnd();

    if (bruta.trim() === "") {
      fecharLista();
      continue;
    }

    const h3 = bruta.match(/^###\s+(.*)$/);
    const h2 = bruta.match(/^##\s+(.*)$/);
    const h1 = bruta.match(/^#\s+(.*)$/);
    const ul = bruta.match(/^[-*]\s+(.*)$/);
    const ol = bruta.match(/^\d+\.\s+(.*)$/);

    if (h3) {
      fecharLista();
      html.push(`<h3 style="font-size:14px;font-weight:700;margin:10px 0 4px;">${renderInline(h3[1])}</h3>`);
    } else if (h2) {
      fecharLista();
      html.push(`<h2 style="font-size:15px;font-weight:700;margin:12px 0 4px;">${renderInline(h2[1])}</h2>`);
    } else if (h1) {
      fecharLista();
      html.push(`<h1 style="font-size:16px;font-weight:800;margin:14px 0 6px;">${renderInline(h1[1])}</h1>`);
    } else if (ul) {
      if (listaAberta !== "ul") {
        fecharLista();
        html.push('<ul style="padding-left:18px;margin:4px 0;">');
        listaAberta = "ul";
      }
      html.push(`<li>${renderInline(ul[1])}</li>`);
    } else if (ol) {
      if (listaAberta !== "ol") {
        fecharLista();
        html.push('<ol style="padding-left:20px;margin:4px 0;">');
        listaAberta = "ol";
      }
      html.push(`<li>${renderInline(ol[1])}</li>`);
    } else {
      fecharLista();
      html.push(`<p style="margin:6px 0;">${renderInline(bruta)}</p>`);
    }
  }
  fecharLista();
  return html.join("");
}

interface MarkdownFieldProps {
  label?: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  linhasMin?: number;
  hint?: string;
}

export default function MarkdownField({
  label,
  valor,
  onChange,
  placeholder,
  linhasMin = 6,
  hint,
}: MarkdownFieldProps) {
  const htmlPreview = useMemo(() => renderMarkdown(valor ?? ""), [valor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "var(--texto-secundario)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          alignItems: "stretch",
        }}
      >
        <textarea
          value={valor ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={linhasMin}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: "10px",
            border: "1.5px solid rgba(160,144,128,0.25)",
            background: "rgba(255,253,248,0.95)",
            fontFamily: "Nunito, sans-serif",
            fontSize: "13px",
            lineHeight: 1.5,
            resize: "vertical",
            minHeight: `${linhasMin * 22}px`,
          }}
        />
        <div
          style={{
            borderRadius: "10px",
            border: "1.5px dashed rgba(160,144,128,0.25)",
            background: "rgba(245,242,236,0.55)",
            padding: "10px 12px",
            fontFamily: "Nunito, sans-serif",
            fontSize: "13px",
            lineHeight: 1.5,
            overflow: "auto",
            minHeight: `${linhasMin * 22}px`,
          }}
          aria-label="Pré-visualização"
          dangerouslySetInnerHTML={{
            __html:
              htmlPreview ||
              '<p style="color:rgba(93,79,62,0.6);font-style:italic;">Sem conteúdo</p>',
          }}
        />
      </div>
      {hint && (
        <p style={{ fontSize: "11px", color: "var(--texto-secundario)", fontWeight: 600 }}>
          {hint}
        </p>
      )}
    </div>
  );
}
