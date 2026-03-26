import type { Dimensao } from "@/lib/dimensoes";

export const licao = {
  slug: "a-vida-secreta-das-plantas",
  titulo: "A Vida Secreta das Plantas",
  dimensao: "naturalista" as Dimensao,
  curriculo: "PT",
  nivel: 3,
  duracao: "10 min",
  competencia: {
    dimensao: "naturalista",
    area: "Ciências Naturais",
    nivel: 3,
    descricao: "Compreende a fotossíntese, as partes da planta e o ciclo da água.",
    curriculo: "PT",
  },
  conteudo: `
O Tomás estava no jardim quando percebeu algo estranho: as plantas estavam completamente quietas, mas estavam a trabalhar sem parar.

"As plantas **respiram**," explicou a avó. "Só que ao contrário dos animais."

Durante o dia, as plantas absorvem **dióxido de carbono** (CO₂) do ar e luz do sol, e transformam tudo isso em energia — um processo chamado **fotossíntese**. O resultado? Libertam **oxigénio** — o ar que nós respiramos.

À noite, fazem o contrário: absorvem oxigénio e libertam CO₂, como nós.

As **raízes** bebem água do solo. O **caule** transporta essa água até às folhas. As **folhas** são as fábricas onde acontece a fotossíntese.

E a água? Não para quieta. Evapora das folhas, sobe para as nuvens, cai em chuva — o **ciclo da água**, sempre a recomeçar.

As plantas não falam, mas contam a história de toda a vida na Terra.
  `.trim(),
  exercicios: [
    {
      pergunta: "O que é que as plantas precisam para fazer fotossíntese?",
      opcoes: ["luz solar", "vento", "terra", "frio"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Qual parte da planta absorve água do solo?",
      opcoes: ["raiz", "folha", "flor", "caule"],
      resposta_correcta: 0,
    },
    {
      pergunta: "O que libertam as plantas durante o dia?",
      opcoes: ["oxigénio", "dióxido de carbono", "azoto", "vapor"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Como se chama o processo em que a água dos rios sobe para as nuvens?",
      opcoes: ["evaporação", "fotossíntese", "respiração", "germinação"],
      resposta_correcta: 0,
    },
    {
      pergunta: "Onde fica guardada a energia que a planta produz?",
      opcoes: ["fruto e folhas", "flores", "raízes", "casca"],
      resposta_correcta: 0,
    },
  ],
};
