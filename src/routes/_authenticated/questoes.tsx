import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/questoes")({
  head: () => ({
    meta: [
      { title: "Questões — NEXO" },
      { name: "description", content: "Questões na plataforma NEXO." },
      { property: "og:title", content: "Questões — NEXO" },
      { property: "og:description", content: "Questões na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Questões"
      description="Banco de questões com filtros por tema, dificuldade e prova, além do registro de acertos que vai calibrar o motor de priorização. Ainda não implementado — quando estiver, seu desempenho real passa a pesar mais que a autoavaliação do onboarding."
    />
  ),
});
