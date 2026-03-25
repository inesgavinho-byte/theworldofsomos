"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ARTIGOS_CONTEUDO: Record<string, { titulo: string; categoria: string; data: string; tempo: string; cor: string; corTexto: string; conteudo: string[] }> = {
  "como-falar-filho-dificuldades": {
    titulo: "Como falar com o teu filho sobre dificuldades na escola",
    categoria: "Família",
    data: "20 março 2026",
    tempo: "5 min",
    cor: "#a78bfa",
    corTexto: "#534ab7",
    conteudo: [
      "Há um momento que quase todos os pais conhecem: o filho chega a casa calado, deixa a mochila no chão com mais força do que o habitual, e quando perguntamos 'como foi?', a resposta é um murro de uma palavra. 'Bem.'",
      "Nesse momento, a maioria de nós faz uma de duas coisas: pressiona para saber mais, ou deixa estar. As duas estratégias têm os seus problemas.",
      "Pressionar cria resistência. Deixar estar cria distância.",
      "Existe uma terceira via, menos óbvia: criar espaço antes de criar conversa.",
      "Crianças que passaram por um dia difícil na escola não precisam primeiro de soluções — precisam de sentir que o espaço em casa é seguro o suficiente para dizer que correram mal. E isso não acontece automaticamente. Tem de ser construído.",
      "Como criar esse espaço? Há três práticas simples mas transformadoras.",
      "A primeira é nomear sem avaliar. Em vez de 'foste mal ao teste?', experimenta 'pareces cansado hoje'. Nomear o estado sem avaliar o desempenho dá à criança a autorização de sentir sem ter de se justificar.",
      "A segunda é separar o momento da conversa. Se o teu filho acabou de chegar, espera. Dá-lhe 20 minutos de ar. A maioria das conversas importantes acontece não à mesa do jantar mas enquanto se faz outra coisa — um passeio, lavar a loiça, uma viagem de carro.",
      "A terceira é partilhar as tuas próprias dificuldades. Não para te queixares, mas para normalizares o erro. 'Hoje também correu mal uma reunião minha — fiquei frustrada, mas depois percebi o que posso fazer diferente.' Esta partilha simples muda tudo.",
      "A dificuldade escolar não é um sinal de falha. É um sinal de que a criança está a tentar algo que ainda não domina. O nosso papel como pais não é eliminar essa dificuldade — é ser a base segura a partir da qual ela pode continuar a tentar.",
    ],
  },
  "neurociencia-aprendizagem": {
    titulo: "O que a neurociência nos diz sobre como as crianças aprendem",
    categoria: "Ciência",
    data: "15 março 2026",
    tempo: "8 min",
    cor: "#60a5fa",
    corTexto: "#185fa5",
    conteudo: [
      "Durante décadas, acreditou-se que o cérebro era relativamente fixo após a infância — que as capacidades eram determinadas geneticamente e que pouco se podia fazer para as alterar fundamentalmente.",
      "A neurociência moderna destruiu completamente essa ideia.",
      "O cérebro humano é plástico. Isso significa que se altera fisicamente em resposta ao que fazemos, pensamos e experienciamos. Cada vez que uma criança aprende algo novo, forma-se literalmente uma nova ligação entre neurónios — ou uma ligação existente fica mais forte.",
      "Isto tem implicações profundas para a forma como pensamos sobre educação.",
      "Primeiro: o esforço importa mais do que o talento. Estudos do laboratório de Carol Dweck em Stanford mostraram consistentemente que crianças que acreditam que as capacidades podem crescer com esforço — o que ela chama 'mentalidade de crescimento' — obtêm melhores resultados académicos a longo prazo do que crianças com igual inteligência mas que acreditam que o talento é fixo.",
      "Segundo: o sono não é opcional para a aprendizagem — é parte da aprendizagem. Durante o sono, o cérebro processa e consolida as memórias formadas durante o dia. Crianças que dormem mal aprendem menos, mesmo que passem mais horas a estudar.",
      "Terceiro: o stress crónico prejudica a aprendizagem de formas mensuráveis. O cortisol — a hormona do stress — interfere com a formação de novas memórias e com o pensamento criativo. Uma criança constantemente ansiosa está literalmente a aprender com um cérebro em modo de sobrevivência, não de exploração.",
      "O que isto significa para os pais? Significa que as condições emocionais em que a aprendizagem acontece são tão importantes como o conteúdo. Um ambiente seguro, com adultos que acreditam nas capacidades da criança, não é um luxo — é a base neurológica para que a aprendizagem aconteça.",
    ],
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ArtigoPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const artigo = ARTIGOS_CONTEUDO[slug];

  if (!artigo) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative" }}>
        <div style={{ textAlign: "center" }}>
          <h2 className="font-editorial" style={{ fontSize: "28px", fontWeight: 500, marginBottom: "12px" }}>
            Artigo não encontrado
          </h2>
          <Link href="/leituras">
            <button style={{ background: "var(--texto-principal)", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: 800, fontFamily: "Nunito, sans-serif", cursor: "none" }}>
              Voltar às leituras
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--fundo-pai)", position: "relative", zIndex: 1 }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px", maxWidth: "720px", margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", cursor: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: 700, fontFamily: "Nunito, sans-serif", color: "var(--texto-secundario)" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L11 6M5 12L11 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Leituras
        </button>
        <Link href="/">
          <span className="font-editorial" style={{ fontSize: "18px", fontWeight: 500 }}>SOMOS</span>
        </Link>
      </nav>

      {/* Article */}
      <article style={{ maxWidth: "680px", margin: "0 auto", padding: "20px 40px 80px" }}>
        {/* Meta */}
        <div className="badge-dimensao" style={{ background: `${artigo.cor}15`, color: artigo.corTexto, marginBottom: "20px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: artigo.cor }} />
          {artigo.categoria} · {artigo.tempo} · {artigo.data}
        </div>

        {/* Title */}
        <h1 className="font-editorial" style={{ fontSize: "40px", fontWeight: 500, lineHeight: 1.1, marginBottom: "32px", letterSpacing: "-0.5px" }}>
          {artigo.titulo}
        </h1>

        {/* Divider */}
        <div style={{ width: "40px", height: "2px", background: artigo.cor, borderRadius: "1px", marginBottom: "32px" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {artigo.conteudo.map((paragrafo, i) => (
            <p key={i} style={{
              fontSize: i === 0 ? "18px" : "16px",
              lineHeight: 1.75,
              color: "var(--texto-principal)",
              fontWeight: i === 0 ? 600 : 400,
              fontFamily: i === 0 ? "Nunito, sans-serif" : "Cormorant Garamond, serif",
            }}>
              {paragrafo}
            </p>
          ))}
        </div>

        {/* Back CTA */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(160,144,128,0.15)" }}>
          <Link href="/leituras">
            <button style={{ background: "var(--texto-principal)", color: "white", border: "none", borderRadius: "12px", padding: "13px 24px", fontSize: "14px", fontWeight: 800, fontFamily: "Nunito, sans-serif", cursor: "none" }}>
              ← Mais leituras
            </button>
          </Link>
        </div>
      </article>
    </div>
  );
}
