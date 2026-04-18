"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createClient } from "@/lib/supabase/client";

type Tipo = "escolha_multipla" | "escolha_unica" | "verdadeiro_falso";

interface Exercicio {
  id: string;
  licao_id: string;
  tipo: Tipo;
  conteudo: {
    pergunta: string;
    opcoes?: string[];
    resposta_correcta: number | boolean;
    explicacao?: string;
  };
  dificuldade: number | null;
  ordem: number;
  idioma: string;
  tipo_conteudo: string;
}

interface LicaoInfo {
  id: string;
  titulo: string;
}

const TIPO_LABEL: Record<Tipo, string> = {
  escolha_multipla: "Escolha múltipla",
  escolha_unica: "Escolha única",
  verdadeiro_falso: "Verdadeiro / Falso",
};

const TIPO_COR: Record<Tipo, { bg: string; texto: string }> = {
  escolha_multipla: { bg: "rgba(96,165,250,0.12)", texto: "#185fa5" },
  escolha_unica: { bg: "rgba(167,139,250,0.12)", texto: "#534ab7" },
  verdadeiro_falso: { bg: "rgba(250,204,21,0.12)", texto: "#854f0b" },
};

interface FormState {
  tipo: Tipo;
  pergunta: string;
  opcoes: string[];
  respostaIndex: number;
  respostaBool: boolean;
  explicacao: string;
  dificuldade: number;
  ordem: number;
}

const VAZIO: FormState = {
  tipo: "escolha_multipla",
  pergunta: "",
  opcoes: ["", ""],
  respostaIndex: 0,
  respostaBool: true,
  explicacao: "",
  dificuldade: 1,
  ordem: 0,
};

function truncar(texto: string, max = 90): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max).trim() + "…";
}

interface LinhaProps {
  exercicio: Exercicio;
  index: number;
  onEditar: (ex: Exercicio) => void;
  onApagar: (ex: Exercicio) => void;
  aApagar: boolean;
}

function LinhaExercicio({ exercicio, index, onEditar, onApagar, aApagar }: LinhaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercicio.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    background: "rgba(245,242,236,0.9)",
    borderRadius: "14px",
    padding: "14px 16px",
    border: "1px solid rgba(160,144,128,0.15)",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const cor = TIPO_COR[exercicio.tipo] ?? TIPO_COR.escolha_multipla;

  return (
    <div ref={setNodeRef} style={style}>
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
        style={{
          background: "transparent",
          border: "none",
          cursor: "grab",
          fontSize: "16px",
          color: "var(--texto-secundario)",
          padding: "4px 6px",
          touchAction: "none",
        }}
      >
        ⋮⋮
      </button>
      <span
        style={{
          fontFamily: "Nunito, sans-serif",
          fontWeight: 800,
          fontSize: "12px",
          color: "var(--texto-secundario)",
          width: "22px",
          textAlign: "center",
        }}
      >
        {index + 1}
      </span>
      <span
        style={{
          padding: "3px 10px",
          borderRadius: "999px",
          background: cor.bg,
          color: cor.texto,
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.04em",
          flexShrink: 0,
        }}
      >
        {TIPO_LABEL[exercicio.tipo] ?? exercicio.tipo}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "13px", fontWeight: 700 }}>
          {truncar(exercicio.conteudo?.pergunta ?? "(sem pergunta)")}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onEditar(exercicio)}
        style={{
          padding: "6px 12px",
          borderRadius: "10px",
          border: "1.5px solid var(--roxo-tint)",
          background: "rgba(167,139,250,0.08)",
          color: "var(--roxo-texto)",
          fontFamily: "Nunito, sans-serif",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.04em",
          cursor: "none",
          flexShrink: 0,
        }}
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => onApagar(exercicio)}
        disabled={aApagar}
        style={{
          padding: "6px 12px",
          borderRadius: "10px",
          border: "1.5px solid rgba(239,68,68,0.35)",
          background: "rgba(239,68,68,0.08)",
          color: "#7a2a2a",
          fontFamily: "Nunito, sans-serif",
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: "0.04em",
          cursor: aApagar ? "not-allowed" : "none",
          opacity: aApagar ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        {aApagar ? "A apagar…" : "Apagar"}
      </button>
    </div>
  );
}

export default function AdminExerciciosPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const licaoId = params.id;

  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [licao, setLicao] = useState<LicaoInfo | null>(null);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aApagar, setAApagar] = useState<string | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Exercicio | null>(null);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [aGuardar, setAGuardar] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const carregar = async () => {
    setAviso(null);
    try {
      const res = await fetch(`/api/admin/licoes/${licaoId}/exercicios`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível carregar os exercícios.");
        return;
      }
      const json = await res.json();
      setLicao(json.licao);
      setExercicios(json.exercicios);
    } catch {
      setAviso("Não foi possível carregar os exercícios.");
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      supabase
        .from("profiles")
        .select("tipo, roles")
        .eq("id", user.id)
        .single()
        .then(({ data: profile }) => {
          const isAdmin =
            (Array.isArray(profile?.roles) && profile.roles.includes("admin")) ||
            profile?.tipo === "admin";
          if (!isAdmin) {
            router.push("/dashboard");
            return;
          }
          setAuthChecked(true);
          carregar().finally(() => setLoading(false));
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, licaoId]);

  const abrirNovo = () => {
    const proxima = exercicios.length
      ? Math.max(...exercicios.map((e) => e.ordem)) + 1
      : 0;
    setEmEdicao(null);
    setForm({ ...VAZIO, ordem: proxima });
    setFormAberto(true);
  };

  const abrirEdicao = (ex: Exercicio) => {
    setEmEdicao(ex);
    const conteudo = ex.conteudo ?? {};
    const base: FormState = {
      tipo: ex.tipo,
      pergunta: conteudo.pergunta ?? "",
      opcoes:
        Array.isArray(conteudo.opcoes) && conteudo.opcoes.length >= 2
          ? [...conteudo.opcoes]
          : ["", ""],
      respostaIndex:
        typeof conteudo.resposta_correcta === "number"
          ? conteudo.resposta_correcta
          : 0,
      respostaBool:
        typeof conteudo.resposta_correcta === "boolean"
          ? conteudo.resposta_correcta
          : true,
      explicacao: conteudo.explicacao ?? "",
      dificuldade: ex.dificuldade ?? 1,
      ordem: ex.ordem,
    };
    setForm(base);
    setFormAberto(true);
  };

  const fecharForm = () => {
    setFormAberto(false);
    setEmEdicao(null);
    setForm(VAZIO);
  };

  const guardar = async () => {
    if (aGuardar) return;
    setAGuardar(true);
    setAviso(null);

    const payload: Record<string, unknown> = {
      tipo: form.tipo,
      pergunta: form.pergunta,
      explicacao: form.explicacao,
      dificuldade: form.dificuldade,
      ordem: form.ordem,
    };

    if (form.tipo === "verdadeiro_falso") {
      payload.resposta_correcta = form.respostaBool;
    } else {
      payload.opcoes = form.opcoes;
      payload.resposta_correcta = form.respostaIndex;
    }

    try {
      const url = emEdicao
        ? `/api/admin/licoes/${licaoId}/exercicios/${emEdicao.id}`
        : `/api/admin/licoes/${licaoId}/exercicios`;
      const method = emEdicao ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível guardar.");
        return;
      }
      fecharForm();
      await carregar();
    } catch {
      setAviso("Não foi possível guardar.");
    } finally {
      setAGuardar(false);
    }
  };

  const apagar = async (ex: Exercicio) => {
    if (aApagar) return;
    const ok = window.confirm(
      `Apagar este exercício? A acção não pode ser desfeita.`
    );
    if (!ok) return;
    setAApagar(ex.id);
    setAviso(null);
    try {
      const res = await fetch(
        `/api/admin/licoes/${licaoId}/exercicios/${ex.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível apagar.");
        return;
      }
      await carregar();
    } catch {
      setAviso("Não foi possível apagar.");
    } finally {
      setAApagar(null);
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const antigoIndex = exercicios.findIndex((e) => e.id === active.id);
    const novoIndex = exercicios.findIndex((e) => e.id === over.id);
    if (antigoIndex === -1 || novoIndex === -1) return;

    const anterior = exercicios;
    const reordenado = arrayMove(exercicios, antigoIndex, novoIndex).map(
      (e, i) => ({ ...e, ordem: i })
    );
    setExercicios(reordenado);
    setAviso(null);

    try {
      const res = await fetch(
        `/api/admin/licoes/${licaoId}/exercicios/reordenar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exercicios: reordenado.map((e) => ({ id: e.id, ordem: e.ordem })),
          }),
        }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setAviso(json?.erro ?? "Não foi possível reordenar.");
        setExercicios(anterior);
      }
    } catch {
      setAviso("Não foi possível reordenar.");
      setExercicios(anterior);
    }
  };

  const itens = useMemo(() => exercicios.map((e) => e.id), [exercicios]);

  if (!authChecked) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--fundo-pai)",
        position: "relative",
        zIndex: 1,
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
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
          <h1 className="font-editorial" style={{ fontSize: "26px", fontWeight: 500 }}>
            Exercícios de {licao?.titulo ?? "…"}
          </h1>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--texto-secundario)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Exercícios ({exercicios.length})
          </p>
          <button
            type="button"
            onClick={abrirNovo}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1.5px solid var(--roxo-tint)",
              background: "rgba(167,139,250,0.12)",
              color: "var(--roxo-texto)",
              fontFamily: "Nunito, sans-serif",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              cursor: "none",
            }}
          >
            Novo exercício
          </button>
        </div>

        {loading ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
            }}
          >
            A carregar exercícios…
          </p>
        ) : exercicios.length === 0 ? (
          <p
            style={{
              fontSize: "13px",
              color: "var(--texto-secundario)",
              fontWeight: 600,
              padding: "32px 0",
              textAlign: "center",
            }}
          >
            Esta lição ainda não tem exercícios. Cria o primeiro.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={itens} strategy={verticalListSortingStrategy}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {exercicios.map((ex, i) => (
                  <LinhaExercicio
                    key={ex.id}
                    exercicio={ex}
                    index={i}
                    onEditar={abrirEdicao}
                    onApagar={apagar}
                    aApagar={aApagar === ex.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {formAberto && (
        <FormularioExercicio
          form={form}
          setForm={setForm}
          emEdicao={!!emEdicao}
          aGuardar={aGuardar}
          onFechar={fecharForm}
          onGuardar={guardar}
        />
      )}
    </div>
  );
}

interface FormularioProps {
  form: FormState;
  setForm: (atualizador: (prev: FormState) => FormState) => void;
  emEdicao: boolean;
  aGuardar: boolean;
  onFechar: () => void;
  onGuardar: () => void;
}

function FormularioExercicio({
  form,
  setForm,
  emEdicao,
  aGuardar,
  onFechar,
  onGuardar,
}: FormularioProps) {
  const isMultipla =
    form.tipo === "escolha_multipla" || form.tipo === "escolha_unica";

  const setOpcao = (i: number, valor: string) => {
    setForm((prev) => {
      const opcoes = [...prev.opcoes];
      opcoes[i] = valor;
      return { ...prev, opcoes };
    });
  };

  const adicionarOpcao = () => {
    setForm((prev) => ({ ...prev, opcoes: [...prev.opcoes, ""] }));
  };

  const removerOpcao = (i: number) => {
    setForm((prev) => {
      if (prev.opcoes.length <= 2) return prev;
      const opcoes = prev.opcoes.filter((_, idx) => idx !== i);
      const respostaIndex =
        prev.respostaIndex >= opcoes.length
          ? opcoes.length - 1
          : prev.respostaIndex >= i && prev.respostaIndex > 0
          ? prev.respostaIndex - 1
          : prev.respostaIndex;
      return { ...prev, opcoes, respostaIndex };
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40,34,28,0.5)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 20px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "var(--fundo-pai)",
          borderRadius: "18px",
          padding: "28px",
          maxWidth: "560px",
          width: "100%",
          boxShadow: "0 24px 48px rgba(40,34,28,0.2)",
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
          <h2 className="font-editorial" style={{ fontSize: "20px", fontWeight: 500 }}>
            {emEdicao ? "Editar exercício" : "Novo exercício"}
          </h2>
          <button
            type="button"
            onClick={onFechar}
            style={{
              background: "transparent",
              border: "none",
              cursor: "none",
              fontSize: "20px",
              color: "var(--texto-secundario)",
            }}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Campo label="Tipo">
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tipo: e.target.value as Tipo,
                }))
              }
              style={inputEstilo}
            >
              <option value="escolha_multipla">Escolha múltipla</option>
              <option value="escolha_unica">Escolha única</option>
              <option value="verdadeiro_falso">Verdadeiro / Falso</option>
            </select>
          </Campo>

          <Campo label="Pergunta">
            <textarea
              value={form.pergunta}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, pergunta: e.target.value }))
              }
              rows={3}
              style={{ ...inputEstilo, resize: "vertical" }}
              placeholder="Pergunta do exercício"
            />
          </Campo>

          {isMultipla && (
            <Campo label="Opções">
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {form.opcoes.map((opcao, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", gap: "6px", alignItems: "center" }}
                  >
                    <input
                      type="radio"
                      name="resposta"
                      checked={form.respostaIndex === i}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, respostaIndex: i }))
                      }
                      aria-label={`Marcar opção ${i + 1} como correcta`}
                    />
                    <input
                      type="text"
                      value={opcao}
                      onChange={(e) => setOpcao(i, e.target.value)}
                      placeholder={`Opção ${i + 1}`}
                      style={{ ...inputEstilo, flex: 1 }}
                    />
                    {form.opcoes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removerOpcao(i)}
                        aria-label={`Remover opção ${i + 1}`}
                        style={{
                          border: "1.5px solid rgba(239,68,68,0.35)",
                          background: "rgba(239,68,68,0.08)",
                          color: "#7a2a2a",
                          borderRadius: "8px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          fontWeight: 800,
                          cursor: "none",
                        }}
                      >
                        −
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={adicionarOpcao}
                  style={{
                    alignSelf: "flex-start",
                    border: "1.5px solid var(--roxo-tint)",
                    background: "rgba(167,139,250,0.08)",
                    color: "var(--roxo-texto)",
                    borderRadius: "8px",
                    padding: "5px 12px",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    cursor: "none",
                  }}
                >
                  + Adicionar opção
                </button>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--texto-secundario)",
                    fontWeight: 600,
                  }}
                >
                  Marca com o botão de rádio a opção correcta.
                </p>
              </div>
            </Campo>
          )}

          {form.tipo === "verdadeiro_falso" && (
            <Campo label="Resposta correcta">
              <div style={{ display: "flex", gap: "16px" }}>
                <label style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="vf"
                    checked={form.respostaBool === true}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, respostaBool: true }))
                    }
                  />
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>Verdadeiro</span>
                </label>
                <label style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="radio"
                    name="vf"
                    checked={form.respostaBool === false}
                    onChange={() =>
                      setForm((prev) => ({ ...prev, respostaBool: false }))
                    }
                  />
                  <span style={{ fontSize: "13px", fontWeight: 700 }}>Falso</span>
                </label>
              </div>
            </Campo>
          )}

          <Campo label="Explicação (opcional)">
            <textarea
              value={form.explicacao}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, explicacao: e.target.value }))
              }
              rows={2}
              style={{ ...inputEstilo, resize: "vertical" }}
              placeholder="Mostrada depois de responder"
            />
          </Campo>

          <div style={{ display: "flex", gap: "12px" }}>
            <Campo label="Dificuldade (1–5)">
              <input
                type="number"
                min={1}
                max={5}
                value={form.dificuldade}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dificuldade: Math.max(
                      1,
                      Math.min(5, Number(e.target.value) || 1)
                    ),
                  }))
                }
                style={inputEstilo}
              />
            </Campo>
            <Campo label="Ordem">
              <input
                type="number"
                min={0}
                value={form.ordem}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    ordem: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                style={inputEstilo}
              />
            </Campo>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "22px",
          }}
        >
          <button
            type="button"
            onClick={onFechar}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1.5px solid rgba(160,144,128,0.35)",
              background: "transparent",
              color: "var(--texto-secundario)",
              fontFamily: "Nunito, sans-serif",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              cursor: "none",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onGuardar}
            disabled={aGuardar}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "1.5px solid var(--roxo-tint)",
              background: "rgba(167,139,250,0.18)",
              color: "var(--roxo-texto)",
              fontFamily: "Nunito, sans-serif",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              cursor: aGuardar ? "not-allowed" : "none",
              opacity: aGuardar ? 0.6 : 1,
            }}
          >
            {aGuardar ? "A guardar…" : emEdicao ? "Guardar alterações" : "Criar exercício"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputEstilo: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1.5px solid rgba(160,144,128,0.25)",
  background: "rgba(245,242,236,0.9)",
  fontFamily: "Nunito, sans-serif",
  fontSize: "13px",
  fontWeight: 600,
  color: "var(--texto)",
  outline: "none",
};

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        flex: 1,
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 800,
          color: "var(--texto-secundario)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
