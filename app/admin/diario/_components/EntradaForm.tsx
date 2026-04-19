"use client";

import {
  ChangeEvent,
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AUTOR_LABELS,
  AutorDiario,
  EntradaDiario,
  ReferenciaDiario,
  TIPO_LABELS,
  TIPOS_DIARIO,
  TipoDiario,
} from "@/lib/diario";

interface Props {
  entrada?: EntradaDiario;
  tagsDisponiveis: string[];
  onSubmit: (payload: PayloadEntrada) => Promise<string | null>;
  onCancel?: () => void;
  textoSubmit: string;
}

export interface PayloadEntrada {
  tipo: TipoDiario;
  titulo: string;
  contexto: string;
  conteudo: string;
  implicacoes: string;
  referencias: ReferenciaDiario[];
  tags: string[];
  autor: AutorDiario;
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  borderRadius: "10px",
  border: "1.5px solid rgba(160,144,128,0.3)",
  background: "white",
  fontSize: "14px",
  fontFamily: "Nunito, sans-serif",
  fontWeight: 500,
  outline: "none",
  color: "var(--texto-principal)",
  boxSizing: "border-box",
};

const labelStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "var(--texto-secundario)",
  display: "block",
  marginBottom: "6px",
};

const helperStyle: CSSProperties = {
  fontSize: "11px",
  color: "var(--texto-secundario)",
  fontWeight: 600,
  marginTop: "4px",
};

export default function EntradaForm({
  entrada,
  tagsDisponiveis,
  onSubmit,
  onCancel,
  textoSubmit,
}: Props) {
  const [tipo, setTipo] = useState<TipoDiario>(entrada?.tipo ?? "sessao");
  const [titulo, setTitulo] = useState(entrada?.titulo ?? "");
  const [contexto, setContexto] = useState(entrada?.contexto ?? "");
  const [conteudo, setConteudo] = useState(entrada?.conteudo ?? "");
  const [implicacoes, setImplicacoes] = useState(entrada?.implicacoes ?? "");
  const [referencias, setReferencias] = useState<ReferenciaDiario[]>(
    entrada?.referencias?.length
      ? entrada.referencias.map((r) => ({ ...r }))
      : [],
  );
  const [tags, setTags] = useState<string[]>(entrada?.tags ?? []);
  const [autor, setAutor] = useState<AutorDiario>(entrada?.autor ?? "ines");
  const [tagInput, setTagInput] = useState("");
  const [aGravar, setAGravar] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const sugestoes = useMemo(() => {
    const q = tagInput.trim().toLowerCase();
    if (!q) return [];
    const existentes = new Set(tags);
    return tagsDisponiveis
      .filter((t) => !existentes.has(t) && t.toLowerCase().includes(q))
      .slice(0, 6);
  }, [tagInput, tags, tagsDisponiveis]);

  const adicionarTag = (valor: string) => {
    const clean = valor.trim().toLowerCase();
    if (!clean) return;
    if (tags.includes(clean)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removerTag = (t: string) => {
    setTags((prev) => prev.filter((x) => x !== t));
  };

  const onTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      adicionarTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const atualizarRef = (
    i: number,
    campo: keyof ReferenciaDiario,
    valor: string,
  ) => {
    setReferencias((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [campo]: valor } : r)),
    );
  };

  const removerRef = (i: number) => {
    setReferencias((prev) => prev.filter((_, idx) => idx !== i));
  };

  const adicionarRef = () => {
    setReferencias((prev) => [...prev, { tipo: "", label: "", url: "" }]);
  };

  const submeter = async (e: FormEvent) => {
    e.preventDefault();
    setAviso(null);

    if (!titulo.trim()) {
      setAviso("Indica um título.");
      return;
    }
    if (!conteudo.trim()) {
      setAviso("Indica o conteúdo da entrada.");
      return;
    }

    const refsLimpas = referencias
      .map((r) => ({
        tipo: r.tipo.trim(),
        label: r.label.trim(),
        url: r.url?.trim() ?? "",
      }))
      .filter((r) => r.tipo || r.label)
      .map((r) => {
        const ref: ReferenciaDiario = { tipo: r.tipo, label: r.label };
        if (r.url) ref.url = r.url;
        return ref;
      });

    setAGravar(true);
    const erro = await onSubmit({
      tipo,
      titulo: titulo.trim(),
      contexto: contexto.trim(),
      conteudo: conteudo.trim(),
      implicacoes: implicacoes.trim(),
      referencias: refsLimpas,
      tags,
      autor,
    });
    setAGravar(false);
    if (erro) setAviso(erro);
  };

  return (
    <form onSubmit={submeter} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Tipo</label>
          <select
            value={tipo}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setTipo(e.target.value as TipoDiario)
            }
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {TIPOS_DIARIO.map((t) => (
              <option key={t} value={t}>
                {TIPO_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Frase curta que categoriza a entrada"
            maxLength={240}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Contexto</label>
        <textarea
          value={contexto}
          onChange={(e) => setContexto(e.target.value)}
          placeholder="O que estava em cima da mesa antes (opcional)"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }}
        />
      </div>

      <div>
        <label style={labelStyle}>Conteúdo</label>
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="O pensamento, decisão ou ideia em prosa. Aceita Markdown: **negrito**, *itálico*, `código`, > citação, - lista."
          rows={12}
          required
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "220px",
            fontFamily: "Nunito, sans-serif",
            lineHeight: 1.6,
          }}
        />
        <p style={helperStyle}>
          Markdown suportado: **negrito**, *itálico*, `código`, &gt; citação, - lista, [link](url).
        </p>
      </div>

      <div>
        <label style={labelStyle}>Implicações</label>
        <textarea
          value={implicacoes}
          onChange={(e) => setImplicacoes(e.target.value)}
          placeholder="O que muda a partir daqui (opcional)"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", minHeight: "70px" }}
        />
      </div>

      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <label style={{ ...labelStyle, margin: 0 }}>Referências</label>
          <button
            type="button"
            onClick={adicionarRef}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "8px",
              padding: "5px 12px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              color: "var(--texto-secundario)",
              cursor: "pointer",
            }}
          >
            + Adicionar referência
          </button>
        </div>

        {referencias.length === 0 && (
          <p style={{ ...helperStyle, marginTop: 0 }}>
            Sem referências. Adiciona uma para ligar esta entrada a uma fonte, rota, ficheiro ou decisão anterior.
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {referencias.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr 1fr 34px",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                value={r.tipo}
                onChange={(e) => atualizarRef(i, "tipo", e.target.value)}
                placeholder="Tipo"
                style={inputStyle}
              />
              <input
                type="text"
                value={r.label}
                onChange={(e) => atualizarRef(i, "label", e.target.value)}
                placeholder="Label"
                style={inputStyle}
              />
              <input
                type="url"
                value={r.url ?? ""}
                onChange={(e) => atualizarRef(i, "url", e.target.value)}
                placeholder="https:// (opcional)"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => removerRef(i)}
                aria-label="Remover referência"
                style={{
                  background: "transparent",
                  border: "1.5px solid rgba(244,114,182,0.35)",
                  borderRadius: "8px",
                  color: "#9d174d",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  height: "40px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Tags</label>
        <div
          style={{
            ...inputStyle,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            alignItems: "center",
            padding: "8px 10px",
          }}
          onClick={() => tagInputRef.current?.focus()}
        >
          {tags.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "3px 10px",
                borderRadius: "999px",
                background: "rgba(167,139,250,0.14)",
                color: "#6d49c9",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              {t}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removerTag(t);
                }}
                aria-label={`Remover tag ${t}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6d49c9",
                  fontSize: "13px",
                  lineHeight: 1,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKey}
            onBlur={() => tagInput.trim() && adicionarTag(tagInput)}
            placeholder={tags.length ? "" : "ex: arquitectura, fase-0"}
            style={{
              flex: 1,
              minWidth: "120px",
              border: "none",
              outline: "none",
              fontSize: "13px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: 500,
              background: "transparent",
            }}
          />
        </div>
        {sugestoes.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
              marginTop: "6px",
            }}
          >
            {sugestoes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => adicionarTag(s)}
                style={{
                  padding: "3px 10px",
                  borderRadius: "999px",
                  background: "rgba(245,242,236,0.9)",
                  border: "1px solid rgba(160,144,128,0.3)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--texto-secundario)",
                  cursor: "pointer",
                }}
              >
                + {s}
              </button>
            ))}
          </div>
        )}
        <p style={helperStyle}>Enter ou vírgula para adicionar.</p>
      </div>

      <div>
        <label style={labelStyle}>Autor</label>
        <div style={{ display: "flex", gap: "10px" }}>
          {(["ines", "claude"] as AutorDiario[]).map((a) => {
            const activo = autor === a;
            return (
              <label
                key={a}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: activo
                    ? "1.5px solid var(--roxo-tint, #a78bfa)"
                    : "1.5px solid rgba(160,144,128,0.3)",
                  background: activo ? "rgba(167,139,250,0.12)" : "white",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "13px",
                  color: activo ? "#534ab7" : "var(--texto-principal)",
                }}
              >
                <input
                  type="radio"
                  name="autor"
                  value={a}
                  checked={activo}
                  onChange={() => setAutor(a)}
                  style={{ margin: 0 }}
                />
                {AUTOR_LABELS[a]}
              </label>
            );
          })}
        </div>
      </div>

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
            margin: 0,
          }}
        >
          {aviso}
        </p>
      )}

      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={aGravar}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "10px",
              padding: "10px 18px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              cursor: aGravar ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={aGravar}
          style={{
            background: "var(--roxo-tint, #a78bfa)",
            border: "none",
            borderRadius: "10px",
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 800,
            color: "white",
            letterSpacing: "0.04em",
            cursor: aGravar ? "not-allowed" : "pointer",
            opacity: aGravar ? 0.7 : 1,
          }}
        >
          {aGravar ? "A guardar…" : textoSubmit}
        </button>
      </div>
    </form>
  );
}
