"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import MarkdownField from "@/components/admin/MarkdownField";

const DIMENSOES = ["Identitária", "Social", "Lógica", "Narrativa", "Naturalista", "Artística"];
const TIPOS: Array<"universal" | "curricular"> = ["universal", "curricular"];
const CURRICULOS = ["PT", "BNCC", "Cambridge", "IB", "FR"];
const CORES = [
  { valor: "#f472b6", nome: "Rosa" },
  { valor: "#60a5fa", nome: "Azul" },
  { valor: "#facc15", nome: "Amarelo" },
  { valor: "#4ade80", nome: "Verde" },
  { valor: "#a78bfa", nome: "Roxo" },
];

type Estado = "rascunho" | "publicada";
type Tipo = "universal" | "curricular";

interface Seccao {
  numero: number;
  titulo: string;
  texto: string;
}

interface Conteudo {
  perguntas_de_escuta?: string[];
  secoes?: Seccao[];
}

interface Reflexao {
  introducao?: string;
  prompts?: string[];
  tipo_contributo?: string;
}

interface Momento {
  crianca?: { data?: string; titulo?: string; texto?: string };
  adulto?: { resumo_aprendizagem?: string[]; sugestao?: string };
}

interface PerguntaPorta {
  pergunta: string;
  desenvolvimento?: string;
  licao_destino_slug?: string;
}

interface LicaoForm {
  id: string;
  slug: string;
  titulo: string;
  subtitulo: string;
  narrativa: string;
  descricao: string;
  dimensao: string;
  cor: string;
  tipo: Tipo;
  curriculo: string;
  ordem: number;
  duracao_min: number | null;
  idade_min: number | null;
  idade_max: number | null;
  estado: Estado;
  conteudo: Conteudo;
  reflexao: Reflexao;
  momento: Momento;
  perguntas_porta: PerguntaPorta[];
}

type SeccaoId =
  | "metadados"
  | "estado"
  | "conteudo"
  | "reflexao"
  | "momento"
  | "porta";

const ESTADO_CORES: Record<Estado, { bg: string; texto: string; borda: string }> = {
  rascunho: { bg: "rgba(160,144,128,0.14)", texto: "#5d4f3e", borda: "rgba(160,144,128,0.35)" },
  publicada: { bg: "rgba(74,222,128,0.14)", texto: "#2d5c3a", borda: "rgba(74,222,128,0.4)" },
};

function Campo({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
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
      {children}
      {hint && (
        <p style={{ fontSize: "11px", color: "var(--texto-secundario)", fontWeight: 600 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1.5px solid rgba(160,144,128,0.25)",
  background: "rgba(255,253,248,0.95)",
  fontFamily: "Nunito, sans-serif",
  fontSize: "13px",
};

function Seccao({
  id,
  titulo,
  aberta,
  onToggle,
  children,
}: {
  id: SeccaoId;
  titulo: string;
  aberta: boolean;
  onToggle: (id: SeccaoId) => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(245,242,236,0.9)",
        border: "1px solid rgba(160,144,128,0.15)",
        borderRadius: "14px",
        padding: "16px 20px",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          fontFamily: "Nunito, sans-serif",
          fontSize: "14px",
          fontWeight: 800,
          color: "var(--texto-primario)",
          padding: 0,
        }}
      >
        <span>{titulo}</span>
        <span style={{ fontSize: "12px", color: "var(--texto-secundario)" }}>
          {aberta ? "▾" : "▸"}
        </span>
      </button>
      {aberta && <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>{children}</div>}
    </div>
  );
}

export default function EditarLicaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [authChecked, setAuthChecked] = useState(false);
  const [form, setForm] = useState<LicaoForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [aGuardar, setAGuardar] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [seccoesAbertas, setSeccoesAbertas] = useState<Record<SeccaoId, boolean>>({
    metadados: true,
    estado: true,
    conteudo: false,
    reflexao: false,
    momento: false,
    porta: false,
  });
  const [abaMomento, setAbaMomento] = useState<"crianca" | "adulto">("crianca");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      supabase
        .from("profiles")
        .select("tipo")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile?.tipo !== "admin") {
            router.push("/dashboard");
            return;
          }
          setAuthChecked(true);
          carregarLicao();
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router]);

  const carregarLicao = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("licoes")
      .select(
        "id, slug, titulo, subtitulo, narrativa, descricao, dimensao, cor, tipo, curriculo, ordem, duracao_min, idade_min, idade_max, estado, conteudo, reflexao, momento, perguntas_porta"
      )
      .eq("id", id)
      .single();
    if (error || !data) {
      setAviso("Não foi possível carregar a lição.");
      setLoading(false);
      return;
    }
    setForm({
      id: data.id,
      slug: data.slug,
      titulo: data.titulo ?? "",
      subtitulo: data.subtitulo ?? "",
      narrativa: data.narrativa ?? "",
      descricao: data.descricao ?? "",
      dimensao: data.dimensao ?? "Identitária",
      cor: data.cor ?? "#a78bfa",
      tipo: (data.tipo as Tipo) ?? "universal",
      curriculo: data.curriculo ?? "",
      ordem: typeof data.ordem === "number" ? data.ordem : 0,
      duracao_min: data.duracao_min ?? null,
      idade_min: data.idade_min ?? null,
      idade_max: data.idade_max ?? null,
      estado: (data.estado as Estado) ?? "rascunho",
      conteudo: (data.conteudo as Conteudo) ?? { perguntas_de_escuta: [], secoes: [] },
      reflexao: (data.reflexao as Reflexao) ?? { introducao: "", prompts: [] },
      momento: (data.momento as Momento) ?? {
        crianca: { data: "", titulo: "", texto: "" },
        adulto: { resumo_aprendizagem: [], sugestao: "" },
      },
      perguntas_porta: (data.perguntas_porta as PerguntaPorta[]) ?? [],
    });
    setLoading(false);
  }, [id]);

  const toggle = (s: SeccaoId) =>
    setSeccoesAbertas((prev) => ({ ...prev, [s]: !prev[s] }));

  const setCampo = <K extends keyof LicaoForm>(chave: K, valor: LicaoForm[K]) => {
    if (!form) return;
    setForm({ ...form, [chave]: valor });
  };

  const guardar = async () => {
    if (!form) return;
    if (!form.titulo.trim()) {
      setAviso("O título é obrigatório.");
      return;
    }
    if (form.tipo === "curricular" && !form.curriculo) {
      setAviso("Lições curriculares exigem um currículo.");
      return;
    }
    setAGuardar(true);
    setAviso(null);
    setSucesso(null);

    const payload = {
      titulo: form.titulo.trim(),
      subtitulo: form.subtitulo.trim() || null,
      narrativa: form.narrativa.trim() || null,
      descricao: form.descricao.trim() || null,
      dimensao: form.dimensao,
      cor: form.cor,
      tipo: form.tipo,
      curriculo: form.tipo === "universal" ? null : form.curriculo || null,
      ordem: form.ordem,
      duracao_min: form.duracao_min,
      idade_min: form.idade_min,
      idade_max: form.idade_max,
      estado: form.estado,
      conteudo: form.conteudo,
      reflexao: form.reflexao,
      momento: form.momento,
      perguntas_porta: form.perguntas_porta,
    };

    try {
      const res = await fetch(`/api/admin/licoes/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAviso(json?.erro ?? "Não foi possível guardar.");
      } else {
        setSucesso(
          json?.campos_alterados?.length
            ? `Guardado — ${json.campos_alterados.length} ${
                json.campos_alterados.length === 1 ? "campo alterado" : "campos alterados"
              }.`
            : "Guardado — sem alterações."
        );
      }
    } catch {
      setAviso("Não foi possível guardar.");
    } finally {
      setAGuardar(false);
    }
  };

  if (!authChecked || loading) {
    return (
      <div style={{ padding: "32px 24px" }}>
        <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
          A carregar lição...
        </p>
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ padding: "32px 24px" }}>
        <p style={{ fontSize: "13px", color: "var(--texto-secundario)", fontWeight: 600 }}>
          {aviso ?? "Lição não encontrada."}
        </p>
        <Link href="/admin/conteudo">
          <span style={{ fontSize: "12px", color: "var(--roxo-texto)", fontWeight: 700 }}>
            ← Voltar ao conteúdo
          </span>
        </Link>
      </div>
    );
  }

  const estadoCores = ESTADO_CORES[form.estado];

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", position: "relative", zIndex: 1, padding: "32px 24px" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "18px" }}>
        {/* Cabeçalho */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            position: "sticky",
            top: 0,
            background: "var(--fundo-pai)",
            paddingTop: "4px",
            paddingBottom: "8px",
            zIndex: 10,
          }}
        >
          <Link href="/admin/conteudo">
            <button
              style={{
                background: "transparent",
                border: "none",
                cursor: "none",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "Nunito, sans-serif",
                color: "var(--texto-secundario)",
              }}
            >
              ← Conteúdo
            </button>
          </Link>
          <h1 className="font-editorial" style={{ fontSize: "24px", fontWeight: 500, flex: 1, minWidth: 0 }}>
            {form.titulo || "Lição sem título"}
          </h1>
          <span
            style={{
              padding: "2px 9px",
              borderRadius: "999px",
              background: estadoCores.bg,
              color: estadoCores.texto,
              border: `1px solid ${estadoCores.borda}`,
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {form.estado}
          </span>
          <button
            onClick={guardar}
            disabled={aGuardar}
            style={{
              padding: "8px 18px",
              borderRadius: "10px",
              border: "1.5px solid var(--roxo-tint)",
              background: aGuardar ? "rgba(167,139,250,0.12)" : "var(--roxo-tint)",
              color: aGuardar ? "var(--roxo-texto)" : "white",
              fontFamily: "Nunito, sans-serif",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              cursor: aGuardar ? "not-allowed" : "none",
            }}
          >
            {aGuardar ? "A guardar..." : "Guardar"}
          </button>
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
            }}
          >
            {aviso}
          </p>
        )}
        {sucesso && (
          <p
            role="status"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2d5c3a",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.3)",
              borderRadius: "10px",
              padding: "10px 14px",
            }}
          >
            {sucesso}
          </p>
        )}

        {/* Metadados */}
        <Seccao id="metadados" titulo="Metadados" aberta={seccoesAbertas.metadados} onToggle={toggle}>
          <Campo label="Título">
            <input
              type="text"
              value={form.titulo}
              onChange={(e) => setCampo("titulo", e.target.value)}
              style={inputStyle}
            />
          </Campo>
          <Campo label="Subtítulo">
            <input
              type="text"
              value={form.subtitulo}
              onChange={(e) => setCampo("subtitulo", e.target.value)}
              style={inputStyle}
            />
          </Campo>
          <Campo label="Descrição" hint="Texto curto para listas e cartões.">
            <textarea
              value={form.descricao}
              onChange={(e) => setCampo("descricao", e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical", minHeight: "54px" }}
            />
          </Campo>
          <Campo label="Narrativa" hint="Abertura da lição na vista da criança.">
            <textarea
              value={form.narrativa}
              onChange={(e) => setCampo("narrativa", e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical", minHeight: "88px" }}
            />
          </Campo>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Campo label="Dimensão">
              <select
                value={form.dimensao}
                onChange={(e) => setCampo("dimensao", e.target.value)}
                style={inputStyle}
              >
                {DIMENSOES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Cor">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {CORES.map((c) => (
                  <button
                    key={c.valor}
                    type="button"
                    onClick={() => setCampo("cor", c.valor)}
                    aria-label={c.nome}
                    title={c.nome}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: c.valor,
                      border: form.cor === c.valor
                        ? "3px solid var(--texto-primario)"
                        : "1.5px solid rgba(160,144,128,0.25)",
                      cursor: "none",
                    }}
                  />
                ))}
              </div>
            </Campo>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Campo label="Tipo">
              <select
                value={form.tipo}
                onChange={(e) => setCampo("tipo", e.target.value as Tipo)}
                style={inputStyle}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t === "universal" ? "Universal" : "Curricular"}</option>
                ))}
              </select>
            </Campo>
            <Campo label="Currículo" hint={form.tipo === "universal" ? "Não aplicável a universais." : undefined}>
              <select
                value={form.curriculo}
                onChange={(e) => setCampo("curriculo", e.target.value)}
                disabled={form.tipo === "universal"}
                style={{ ...inputStyle, opacity: form.tipo === "universal" ? 0.5 : 1 }}
              >
                <option value="">—</option>
                {CURRICULOS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Campo>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
            <Campo label="Ordem">
              <input
                type="number"
                value={form.ordem}
                onChange={(e) => setCampo("ordem", parseInt(e.target.value, 10) || 0)}
                style={inputStyle}
              />
            </Campo>
            <Campo label="Duração (min)">
              <input
                type="number"
                value={form.duracao_min ?? ""}
                onChange={(e) =>
                  setCampo("duracao_min", e.target.value === "" ? null : parseInt(e.target.value, 10))
                }
                style={inputStyle}
              />
            </Campo>
            <Campo label="Idade mín.">
              <input
                type="number"
                value={form.idade_min ?? ""}
                onChange={(e) =>
                  setCampo("idade_min", e.target.value === "" ? null : parseInt(e.target.value, 10))
                }
                style={inputStyle}
              />
            </Campo>
            <Campo label="Idade máx.">
              <input
                type="number"
                value={form.idade_max ?? ""}
                onChange={(e) =>
                  setCampo("idade_max", e.target.value === "" ? null : parseInt(e.target.value, 10))
                }
                style={inputStyle}
              />
            </Campo>
          </div>
        </Seccao>

        {/* Estado */}
        <Seccao id="estado" titulo="Estado" aberta={seccoesAbertas.estado} onToggle={toggle}>
          <p style={{ fontSize: "12px", color: "var(--texto-secundario)", fontWeight: 600 }}>
            {form.estado === "publicada"
              ? "Esta lição está visível para crianças e famílias."
              : "Esta lição está em rascunho — só admins a podem ver."}
          </p>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setCampo("estado", "rascunho")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: `1.5px solid ${form.estado === "rascunho" ? "rgba(160,144,128,0.5)" : "rgba(160,144,128,0.25)"}`,
                background: form.estado === "rascunho" ? "rgba(160,144,128,0.2)" : "rgba(255,253,248,0.95)",
                color: "#5d4f3e",
                fontFamily: "Nunito, sans-serif",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: "none",
              }}
            >
              Rascunho
            </button>
            <button
              type="button"
              onClick={() => setCampo("estado", "publicada")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: `1.5px solid ${form.estado === "publicada" ? "rgba(74,222,128,0.5)" : "rgba(160,144,128,0.25)"}`,
                background: form.estado === "publicada" ? "rgba(74,222,128,0.2)" : "rgba(255,253,248,0.95)",
                color: "#2d5c3a",
                fontFamily: "Nunito, sans-serif",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "0.04em",
                cursor: "none",
              }}
            >
              Publicada
            </button>
          </div>
          {form.estado === "rascunho" && (
            <p style={{ fontSize: "11px", color: "#854f0b", fontWeight: 700, background: "rgba(250,204,21,0.12)", padding: "8px 12px", borderRadius: "8px", border: "1px solid rgba(250,204,21,0.3)" }}>
              Ao guardar como rascunho a lição deixa de aparecer na vista da criança.
            </p>
          )}
        </Seccao>

        {/* Conteúdo */}
        <Seccao id="conteudo" titulo="Conteúdo" aberta={seccoesAbertas.conteudo} onToggle={toggle}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--texto-secundario)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Perguntas de escuta
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(form.conteudo.perguntas_de_escuta ?? []).map((p, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <textarea
                    value={p}
                    onChange={(e) => {
                      const lista = [...(form.conteudo.perguntas_de_escuta ?? [])];
                      lista[idx] = e.target.value;
                      setCampo("conteudo", { ...form.conteudo, perguntas_de_escuta: lista });
                    }}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical", flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const lista = [...(form.conteudo.perguntas_de_escuta ?? [])];
                      lista.splice(idx, 1);
                      setCampo("conteudo", { ...form.conteudo, perguntas_de_escuta: lista });
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#7a2a2a",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "none",
                    }}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const lista = [...(form.conteudo.perguntas_de_escuta ?? []), ""];
                  setCampo("conteudo", { ...form.conteudo, perguntas_de_escuta: lista });
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px dashed rgba(160,144,128,0.35)",
                  background: "transparent",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "none",
                  alignSelf: "flex-start",
                }}
              >
                + Adicionar pergunta de escuta
              </button>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--texto-secundario)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px", marginTop: "12px" }}>
              Secções
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {(form.conteudo.secoes ?? []).map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px solid rgba(160,144,128,0.2)",
                    borderRadius: "12px",
                    padding: "12px",
                    background: "rgba(255,253,248,0.6)",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: "10px", marginBottom: "10px", alignItems: "end" }}>
                    <Campo label="Nº">
                      <input
                        type="number"
                        value={s.numero}
                        onChange={(e) => {
                          const lista = [...(form.conteudo.secoes ?? [])];
                          lista[idx] = { ...s, numero: parseInt(e.target.value, 10) || 0 };
                          setCampo("conteudo", { ...form.conteudo, secoes: lista });
                        }}
                        style={inputStyle}
                      />
                    </Campo>
                    <Campo label="Título">
                      <input
                        type="text"
                        value={s.titulo}
                        onChange={(e) => {
                          const lista = [...(form.conteudo.secoes ?? [])];
                          lista[idx] = { ...s, titulo: e.target.value };
                          setCampo("conteudo", { ...form.conteudo, secoes: lista });
                        }}
                        style={inputStyle}
                      />
                    </Campo>
                    <button
                      type="button"
                      onClick={() => {
                        const lista = [...(form.conteudo.secoes ?? [])];
                        lista.splice(idx, 1);
                        setCampo("conteudo", { ...form.conteudo, secoes: lista });
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "rgba(239,68,68,0.08)",
                        color: "#7a2a2a",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "none",
                      }}
                    >
                      Remover
                    </button>
                  </div>
                  <MarkdownField
                    label="Texto (markdown)"
                    valor={s.texto}
                    onChange={(v) => {
                      const lista = [...(form.conteudo.secoes ?? [])];
                      lista[idx] = { ...s, texto: v };
                      setCampo("conteudo", { ...form.conteudo, secoes: lista });
                    }}
                    linhasMin={5}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const lista = form.conteudo.secoes ?? [];
                  const proximoNum = lista.length > 0 ? Math.max(...lista.map((x) => x.numero)) + 1 : 1;
                  setCampo("conteudo", {
                    ...form.conteudo,
                    secoes: [...lista, { numero: proximoNum, titulo: "", texto: "" }],
                  });
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px dashed rgba(160,144,128,0.35)",
                  background: "transparent",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "none",
                  alignSelf: "flex-start",
                }}
              >
                + Adicionar secção
              </button>
            </div>
          </div>
        </Seccao>

        {/* Reflexão */}
        <Seccao id="reflexao" titulo="Reflexão" aberta={seccoesAbertas.reflexao} onToggle={toggle}>
          <MarkdownField
            label="Introdução"
            valor={form.reflexao.introducao ?? ""}
            onChange={(v) => setCampo("reflexao", { ...form.reflexao, introducao: v })}
            linhasMin={4}
          />
          <div>
            <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--texto-secundario)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Prompts
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {(form.reflexao.prompts ?? []).map((p, idx) => (
                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <textarea
                    value={p}
                    onChange={(e) => {
                      const lista = [...(form.reflexao.prompts ?? [])];
                      lista[idx] = e.target.value;
                      setCampo("reflexao", { ...form.reflexao, prompts: lista });
                    }}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical", flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const lista = [...(form.reflexao.prompts ?? [])];
                      lista.splice(idx, 1);
                      setCampo("reflexao", { ...form.reflexao, prompts: lista });
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(239,68,68,0.3)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#7a2a2a",
                      fontSize: "11px",
                      fontWeight: 800,
                      cursor: "none",
                    }}
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const lista = [...(form.reflexao.prompts ?? []), ""];
                  setCampo("reflexao", { ...form.reflexao, prompts: lista });
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1.5px dashed rgba(160,144,128,0.35)",
                  background: "transparent",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "none",
                  alignSelf: "flex-start",
                }}
              >
                + Adicionar prompt
              </button>
            </div>
          </div>
        </Seccao>

        {/* Momento */}
        <Seccao id="momento" titulo="Momento" aberta={seccoesAbertas.momento} onToggle={toggle}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setAbaMomento("crianca")}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: `1.5px solid ${abaMomento === "crianca" ? "var(--roxo-tint)" : "rgba(160,144,128,0.25)"}`,
                background: abaMomento === "crianca" ? "rgba(167,139,250,0.12)" : "rgba(245,242,236,0.9)",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "none",
                color: abaMomento === "crianca" ? "var(--roxo-texto)" : "var(--texto-secundario)",
              }}
            >
              Criança
            </button>
            <button
              type="button"
              onClick={() => setAbaMomento("adulto")}
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                border: `1.5px solid ${abaMomento === "adulto" ? "var(--roxo-tint)" : "rgba(160,144,128,0.25)"}`,
                background: abaMomento === "adulto" ? "rgba(167,139,250,0.12)" : "rgba(245,242,236,0.9)",
                fontFamily: "Nunito, sans-serif",
                fontWeight: 800,
                fontSize: "12px",
                cursor: "none",
                color: abaMomento === "adulto" ? "var(--roxo-texto)" : "var(--texto-secundario)",
              }}
            >
              Adulto
            </button>
          </div>

          {abaMomento === "crianca" ? (
            <>
              <Campo label="Data" hint="Ex: 1498, ou um intervalo como 1434-1460.">
                <input
                  type="text"
                  value={form.momento.crianca?.data ?? ""}
                  onChange={(e) =>
                    setCampo("momento", {
                      ...form.momento,
                      crianca: { ...(form.momento.crianca ?? {}), data: e.target.value },
                    })
                  }
                  style={inputStyle}
                />
              </Campo>
              <Campo label="Título">
                <input
                  type="text"
                  value={form.momento.crianca?.titulo ?? ""}
                  onChange={(e) =>
                    setCampo("momento", {
                      ...form.momento,
                      crianca: { ...(form.momento.crianca ?? {}), titulo: e.target.value },
                    })
                  }
                  style={inputStyle}
                />
              </Campo>
              <MarkdownField
                label="Texto"
                valor={form.momento.crianca?.texto ?? ""}
                onChange={(v) =>
                  setCampo("momento", {
                    ...form.momento,
                    crianca: { ...(form.momento.crianca ?? {}), texto: v },
                  })
                }
                linhasMin={5}
              />
            </>
          ) : (
            <>
              <div>
                <p style={{ fontSize: "11px", fontWeight: 800, color: "var(--texto-secundario)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                  Resumo de aprendizagem
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(form.momento.adulto?.resumo_aprendizagem ?? []).map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                      <textarea
                        value={item}
                        onChange={(e) => {
                          const lista = [...(form.momento.adulto?.resumo_aprendizagem ?? [])];
                          lista[idx] = e.target.value;
                          setCampo("momento", {
                            ...form.momento,
                            adulto: { ...(form.momento.adulto ?? {}), resumo_aprendizagem: lista },
                          });
                        }}
                        rows={2}
                        style={{ ...inputStyle, resize: "vertical", flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const lista = [...(form.momento.adulto?.resumo_aprendizagem ?? [])];
                          lista.splice(idx, 1);
                          setCampo("momento", {
                            ...form.momento,
                            adulto: { ...(form.momento.adulto ?? {}), resumo_aprendizagem: lista },
                          });
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "1px solid rgba(239,68,68,0.3)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#7a2a2a",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "none",
                        }}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const lista = [...(form.momento.adulto?.resumo_aprendizagem ?? []), ""];
                      setCampo("momento", {
                        ...form.momento,
                        adulto: { ...(form.momento.adulto ?? {}), resumo_aprendizagem: lista },
                      });
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: "1.5px dashed rgba(160,144,128,0.35)",
                      background: "transparent",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "none",
                      alignSelf: "flex-start",
                    }}
                  >
                    + Adicionar item
                  </button>
                </div>
              </div>
              <MarkdownField
                label="Sugestão para o adulto"
                valor={form.momento.adulto?.sugestao ?? ""}
                onChange={(v) =>
                  setCampo("momento", {
                    ...form.momento,
                    adulto: { ...(form.momento.adulto ?? {}), sugestao: v },
                  })
                }
                linhasMin={4}
              />
            </>
          )}
        </Seccao>

        {/* Perguntas-porta */}
        <Seccao id="porta" titulo="Perguntas-porta" aberta={seccoesAbertas.porta} onToggle={toggle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {form.perguntas_porta.map((p, idx) => (
              <div
                key={idx}
                style={{
                  border: "1px solid rgba(160,144,128,0.2)",
                  borderRadius: "12px",
                  padding: "12px",
                  background: "rgba(255,253,248,0.6)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Campo label="Pergunta">
                  <input
                    type="text"
                    value={p.pergunta}
                    onChange={(e) => {
                      const lista = [...form.perguntas_porta];
                      lista[idx] = { ...p, pergunta: e.target.value };
                      setCampo("perguntas_porta", lista);
                    }}
                    style={inputStyle}
                  />
                </Campo>
                <MarkdownField
                  label="Desenvolvimento"
                  valor={p.desenvolvimento ?? ""}
                  onChange={(v) => {
                    const lista = [...form.perguntas_porta];
                    lista[idx] = { ...p, desenvolvimento: v };
                    setCampo("perguntas_porta", lista);
                  }}
                  linhasMin={4}
                />
                <Campo label="Lição destino (slug)" hint="Opcional. Slug da lição que esta pergunta abre.">
                  <input
                    type="text"
                    value={p.licao_destino_slug ?? ""}
                    onChange={(e) => {
                      const lista = [...form.perguntas_porta];
                      lista[idx] = { ...p, licao_destino_slug: e.target.value || undefined };
                      setCampo("perguntas_porta", lista);
                    }}
                    style={inputStyle}
                  />
                </Campo>
                <button
                  type="button"
                  onClick={() => {
                    const lista = [...form.perguntas_porta];
                    lista.splice(idx, 1);
                    setCampo("perguntas_porta", lista);
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.08)",
                    color: "#7a2a2a",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "none",
                    alignSelf: "flex-start",
                  }}
                >
                  Remover pergunta-porta
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setCampo("perguntas_porta", [
                  ...form.perguntas_porta,
                  { pergunta: "", desenvolvimento: "" },
                ]);
              }}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "1.5px dashed rgba(160,144,128,0.35)",
                background: "transparent",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "none",
                alignSelf: "flex-start",
              }}
            >
              + Adicionar pergunta-porta
            </button>
          </div>
        </Seccao>
      </div>
    </div>
  );
}
