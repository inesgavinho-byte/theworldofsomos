"use client";

import Link from "next/link";
import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AUTOR_LABELS,
  AutorDiario,
  EntradaDiario,
  formatDataCurta,
  TIPO_CORES,
  TIPO_LABELS,
  TIPOS_DIARIO,
  TipoDiario,
} from "@/lib/diario";

const PAGE_SIZE = 20;

const inputStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1.5px solid rgba(160,144,128,0.3)",
  background: "white",
  fontSize: "13px",
  fontFamily: "Nunito, sans-serif",
  fontWeight: 600,
  outline: "none",
  color: "var(--texto-principal)",
};

const chipBase: CSSProperties = {
  padding: "5px 12px",
  borderRadius: "999px",
  border: "1.5px solid rgba(160,144,128,0.3)",
  background: "rgba(245,242,236,0.9)",
  fontSize: "11px",
  fontWeight: 700,
  color: "var(--texto-secundario)",
  cursor: "pointer",
  fontFamily: "Nunito, sans-serif",
  letterSpacing: "0.04em",
};

export default function DiarioListClient() {
  const [entradas, setEntradas] = useState<EntradaDiario[]>([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [aCarregarMais, setACarregarMais] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [tiposSel, setTiposSel] = useState<TipoDiario[]>([]);
  const [autor, setAutor] = useState<"todos" | AutorDiario>("todos");
  const [tagsSel, setTagsSel] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");

  const tokenRef = useRef(0);

  useEffect(() => {
    const id = setTimeout(() => setQDebounced(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  const buildUrl = useCallback(
    (offset: number) => {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      for (const t of tiposSel) params.append("tipo", t);
      if (autor !== "todos") params.append("autor", autor);
      for (const t of tagsSel) params.append("tag", t);
      if (qDebounced) params.set("q", qDebounced);
      return `/api/admin/diario?${params.toString()}`;
    },
    [tiposSel, autor, tagsSel, qDebounced],
  );

  const carregar = useCallback(async () => {
    const token = ++tokenRef.current;
    setLoading(true);
    setAviso(null);
    try {
      const res = await fetch(buildUrl(0));
      if (token !== tokenRef.current) return;
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível carregar o diário.");
        setEntradas([]);
        setTotal(0);
        return;
      }
      const json = await res.json();
      setEntradas(json.entradas ?? []);
      setTotal(json.total ?? 0);
      setTagsDisponiveis(json.tagsDisponiveis ?? []);
    } catch {
      if (token === tokenRef.current) {
        setAviso("Não foi possível ligar ao servidor.");
      }
    } finally {
      if (token === tokenRef.current) setLoading(false);
    }
  }, [buildUrl]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const carregarMais = async () => {
    if (aCarregarMais || entradas.length >= total) return;
    setACarregarMais(true);
    try {
      const res = await fetch(buildUrl(entradas.length));
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível carregar mais entradas.");
        return;
      }
      const json = await res.json();
      setEntradas((prev) => [...prev, ...(json.entradas ?? [])]);
      setTotal(json.total ?? 0);
    } catch {
      setAviso("Não foi possível ligar ao servidor.");
    } finally {
      setACarregarMais(false);
    }
  };

  const limparFiltros = () => {
    setTiposSel([]);
    setAutor("todos");
    setTagsSel([]);
    setQ("");
  };

  const temFiltros = useMemo(
    () => tiposSel.length > 0 || autor !== "todos" || tagsSel.length > 0 || q.trim() !== "",
    [tiposSel, autor, tagsSel, q],
  );

  const toggleTipo = (t: TipoDiario) => {
    setTiposSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleTag = (t: string) => {
    setTagsSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div>
      <div
        style={{
          background: "rgba(245,242,236,0.9)",
          borderRadius: "14px",
          border: "1px solid rgba(160,144,128,0.15)",
          padding: "16px",
          marginBottom: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          <input
            type="search"
            placeholder="Pesquisar no diário..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ ...inputStyle, flex: 1, minWidth: "220px" }}
          />

          <select
            value={autor}
            onChange={(e) => setAutor(e.target.value as "todos" | AutorDiario)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="todos">Todos os autores</option>
            <option value="ines">{AUTOR_LABELS.ines}</option>
            <option value="claude">{AUTOR_LABELS.claude}</option>
          </select>

          {temFiltros && (
            <button onClick={limparFiltros} style={{ ...chipBase, cursor: "pointer" }}>
              Limpar filtros
            </button>
          )}

          <span
            style={{
              marginLeft: "auto",
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
            }}
          >
            {total} entrada{total !== 1 ? "s" : ""}
          </span>
        </div>

        <div>
          <p
            style={{
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--texto-secundario)",
              marginBottom: "8px",
            }}
          >
            Tipo
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {TIPOS_DIARIO.map((t) => {
              const activo = tiposSel.includes(t);
              const cores = TIPO_CORES[t];
              return (
                <button
                  key={t}
                  onClick={() => toggleTipo(t)}
                  style={{
                    ...chipBase,
                    border: activo
                      ? `1.5px solid ${cores.borda}`
                      : "1.5px solid rgba(160,144,128,0.25)",
                    background: activo ? cores.bg : "white",
                    color: activo ? cores.cor : "var(--texto-secundario)",
                  }}
                >
                  {TIPO_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        {tagsDisponiveis.length > 0 && (
          <div>
            <p
              style={{
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--texto-secundario)",
                marginBottom: "8px",
              }}
            >
              Tags
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {tagsDisponiveis.map((t) => {
                const activo = tagsSel.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => toggleTag(t)}
                    style={{
                      ...chipBase,
                      border: activo
                        ? "1.5px solid rgba(167,139,250,0.45)"
                        : "1.5px solid rgba(160,144,128,0.25)",
                      background: activo ? "rgba(167,139,250,0.14)" : "white",
                      color: activo ? "#6d49c9" : "var(--texto-secundario)",
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        )}
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
            marginBottom: "12px",
          }}
        >
          {aviso}
        </p>
      )}

      <div
        style={{
          background: "rgba(245,242,236,0.9)",
          borderRadius: "14px",
          border: "1px solid rgba(160,144,128,0.15)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--texto-secundario)",
            }}
          >
            A carregar entradas…
          </div>
        ) : entradas.length === 0 ? (
          <div
            style={{
              padding: "32px",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--texto-secundario)",
            }}
          >
            Sem entradas para os filtros seleccionados.
          </div>
        ) : (
          entradas.map((e) => {
            const cores = TIPO_CORES[e.tipo];
            return (
              <Link
                key={e.id}
                href={`/admin/diario/${e.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  className="card-hover"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 130px 1fr auto",
                    gap: "14px",
                    alignItems: "center",
                    padding: "14px 18px",
                    borderBottom: "1px solid rgba(160,144,128,0.1)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--texto-secundario)",
                      fontFamily: "monospace",
                    }}
                  >
                    {formatDataCurta(e.created_at)}
                  </span>

                  <span
                    style={{
                      background: cores.bg,
                      color: cores.cor,
                      border: `1px solid ${cores.borda}`,
                      borderRadius: "6px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      textAlign: "center",
                      justifySelf: "start",
                    }}
                  >
                    {TIPO_LABELS[e.tipo]}
                  </span>

                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--texto-principal)",
                        margin: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {e.titulo}
                    </p>
                    {e.tags.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "5px",
                          marginTop: "4px",
                        }}
                      >
                        {e.tags.slice(0, 5).map((t) => (
                          <span
                            key={t}
                            style={{
                              padding: "1px 8px",
                              borderRadius: "999px",
                              background: "rgba(160,144,128,0.12)",
                              color: "var(--texto-secundario)",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span
                    style={{
                      padding: "2px 9px",
                      borderRadius: "999px",
                      background: "rgba(160,144,128,0.1)",
                      color: "var(--texto-secundario)",
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {AUTOR_LABELS[e.autor]}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {!loading && entradas.length < total && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "18px" }}>
          <button
            onClick={carregarMais}
            disabled={aCarregarMais}
            style={{
              background: "transparent",
              border: "1.5px solid rgba(160,144,128,0.3)",
              borderRadius: "10px",
              padding: "9px 20px",
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              cursor: aCarregarMais ? "not-allowed" : "pointer",
              opacity: aCarregarMais ? 0.6 : 1,
            }}
          >
            {aCarregarMais
              ? "A carregar…"
              : `Carregar mais (${total - entradas.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
