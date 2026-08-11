import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/revisoes")({
  head: () => ({
    meta: [
      { title: "Revisões — NEXO" },
      { name: "description", content: "Revisões na plataforma NEXO." },
      { property: "og:title", content: "Revisões — NEXO" },
      { property: "og:description", content: "Revisões na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Revisões"
      description="Fila de revisão espaçada. Hoje as revisões já entram no seu dia pelo motor de planejamento; esta tela trará o controle fino dos intervalos e do histórico por tema."
    />
  ),
});
