"use client";

import { useRouter } from "next/navigation";
import EntradaForm, { PayloadEntrada } from "../_components/EntradaForm";

interface Props {
  tagsDisponiveis: string[];
}

export default function NovaEntradaClient({ tagsDisponiveis }: Props) {
  const router = useRouter();

  const criar = async (payload: PayloadEntrada): Promise<string | null> => {
    try {
      const res = await fetch("/api/admin/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, autor: "ines" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return json?.erro ?? "Não foi possível criar a entrada.";
      }
      const id = json?.entrada?.id;
      if (id) {
        router.push(`/admin/diario/${id}`);
      } else {
        router.push("/admin/diario");
      }
      router.refresh();
      return null;
    } catch {
      return "Não foi possível ligar ao servidor.";
    }
  };

  return (
    <EntradaForm
      tagsDisponiveis={tagsDisponiveis}
      onSubmit={criar}
      onCancel={() => router.push("/admin/diario")}
      textoSubmit="Guardar entrada"
    />
  );
}
