import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NEXO — você não precisa decidir o que estudar" },
      {
        name: "description",
        content:
          "Plataforma inteligente de preparação para residência médica: seu dia já vem pronto, com prioridades, revisões e execução direta.",
      },
      { property: "og:title", content: "NEXO — preparação inteligente para residência médica" },
      {
        property: "og:description",
        content: "Abrir, ver o que fazer, clicar e estudar. A NEXO organiza o resto.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="font-display text-2xl tracking-tight">NEXO</span>
        <Link to="/auth" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
          Entrar
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-24 pt-16 md:pt-28">
        <p className="label-caps">Preparação para residência médica</p>
        <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.05] md:text-7xl">
          Você não precisa decidir o que estudar.
          <span className="text-primary"> Precisa apenas começar.</span>
        </h1>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-muted-foreground">
          A NEXO entende sua rotina, define prioridades, conduz a execução e adapta o planejamento
          conforme seu desempenho real. Você abre e o dia já está pronto.
        </p>

        <div className="mt-10">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Criar minha conta
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-24 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {[
            {
              t: "Meu Dia",
              d: "Uma lista cronológica com horário, tipo e ação direta para cada atividade.",
            },
            {
              t: "Motor de prioridade",
              d: "Provas, prazos, disponibilidade, plantões e suas áreas frágeis definem a ordem.",
            },
            {
              t: "Replanejamento",
              d: "Menos tempo hoje? A NEXO preserva o crítico e reorganiza o resto.",
            },
          ].map((f) => (
            <div key={f.t} className="bg-surface p-8">
              <h2 className="font-display text-2xl">{f.t}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
