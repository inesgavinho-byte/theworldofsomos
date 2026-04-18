"use client";

import { Fragment, ReactNode } from "react";

type Inline = string | { type: "bold" | "italic" | "code"; text: string } | {
  type: "link";
  label: string;
  url: string;
};

function parseInline(text: string): ReactNode[] {
  const tokens: Inline[] = [];
  const re =
    /\*\*([^*\n]+)\*\*|(?<![\w*])\*([^*\n]+)\*(?!\w)|_([^_\n]+)_|`([^`\n]+)`|\[([^\]\n]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push(text.slice(last, m.index));
    if (m[1] !== undefined) tokens.push({ type: "bold", text: m[1] });
    else if (m[2] !== undefined) tokens.push({ type: "italic", text: m[2] });
    else if (m[3] !== undefined) tokens.push({ type: "italic", text: m[3] });
    else if (m[4] !== undefined) tokens.push({ type: "code", text: m[4] });
    else if (m[5] !== undefined && m[6] !== undefined)
      tokens.push({ type: "link", label: m[5], url: m[6] });
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push(text.slice(last));

  return tokens.map((t, i) => {
    if (typeof t === "string") return <Fragment key={i}>{t}</Fragment>;
    if (t.type === "bold")
      return (
        <strong key={i} style={{ fontWeight: 800 }}>
          {t.text}
        </strong>
      );
    if (t.type === "italic")
      return (
        <em key={i} style={{ fontStyle: "italic" }}>
          {t.text}
        </em>
      );
    if (t.type === "code")
      return (
        <code
          key={i}
          style={{
            background: "rgba(160,144,128,0.14)",
            borderRadius: "4px",
            padding: "1px 5px",
            fontFamily: "monospace",
            fontSize: "0.92em",
          }}
        >
          {t.text}
        </code>
      );
    if (t.type === "link")
      return (
        <a
          key={i}
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--roxo-texto)", fontWeight: 700 }}
        >
          {t.label}
        </a>
      );
    return null;
  });
}

interface Block {
  kind: "heading" | "blockquote" | "list" | "paragraph";
  level?: 1 | 2 | 3;
  lines: string[];
}

function parseBlocks(source: string): Block[] {
  const linhas = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let buffer: string[] = [];

  const flushParagraph = () => {
    if (buffer.length) {
      blocks.push({ kind: "paragraph", lines: buffer });
      buffer = [];
    }
  };

  for (const linhaRaw of linhas) {
    const linha = linhaRaw.trimEnd();

    if (!linha.trim()) {
      flushParagraph();
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(linha);
    if (heading) {
      flushParagraph();
      blocks.push({
        kind: "heading",
        level: heading[1].length as 1 | 2 | 3,
        lines: [heading[2]],
      });
      continue;
    }

    if (/^>\s?/.test(linha)) {
      flushParagraph();
      const prev = blocks[blocks.length - 1];
      const content = linha.replace(/^>\s?/, "");
      if (prev && prev.kind === "blockquote") prev.lines.push(content);
      else blocks.push({ kind: "blockquote", lines: [content] });
      continue;
    }

    if (/^[-*]\s+/.test(linha)) {
      flushParagraph();
      const prev = blocks[blocks.length - 1];
      const content = linha.replace(/^[-*]\s+/, "");
      if (prev && prev.kind === "list") prev.lines.push(content);
      else blocks.push({ kind: "list", lines: [content] });
      continue;
    }

    buffer.push(linha);
  }
  flushParagraph();

  return blocks;
}

export default function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);

  return (
    <div
      style={{
        fontSize: "14.5px",
        lineHeight: 1.75,
        color: "var(--texto-principal)",
        fontWeight: 500,
      }}
    >
      {blocks.map((b, i) => {
        if (b.kind === "heading") {
          const size = b.level === 1 ? "22px" : b.level === 2 ? "18px" : "15px";
          return (
            <h3
              key={i}
              className="font-editorial"
              style={{
                fontSize: size,
                fontWeight: 500,
                margin: i === 0 ? "0 0 10px" : "18px 0 8px",
              }}
            >
              {parseInline(b.lines[0])}
            </h3>
          );
        }
        if (b.kind === "blockquote") {
          return (
            <blockquote
              key={i}
              style={{
                margin: "12px 0",
                padding: "8px 14px",
                borderLeft: "3px solid rgba(167,139,250,0.45)",
                background: "rgba(167,139,250,0.06)",
                borderRadius: "0 8px 8px 0",
                color: "var(--texto-secundario)",
                fontStyle: "italic",
              }}
            >
              {b.lines.map((l, j) => (
                <p key={j} style={{ margin: 0 }}>
                  {parseInline(l)}
                </p>
              ))}
            </blockquote>
          );
        }
        if (b.kind === "list") {
          return (
            <ul
              key={i}
              style={{
                margin: "8px 0 10px",
                paddingLeft: "22px",
                listStyleType: "disc",
              }}
            >
              {b.lines.map((l, j) => (
                <li key={j} style={{ marginBottom: "4px" }}>
                  {parseInline(l)}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            style={{
              margin: i === 0 ? "0 0 10px" : "10px 0",
              whiteSpace: "pre-wrap",
            }}
          >
            {b.lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {parseInline(l)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
