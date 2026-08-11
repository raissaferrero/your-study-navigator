import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — NEXO" },
      { name: "description", content: "Dashboard na plataforma NEXO." },
      { property: "og:title", content: "Dashboard — NEXO" },
      { property: "og:description", content: "Dashboard na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Dashboard"
      description="Evolução por área, constância, tempo real de estudo versus planejado e projeção até a prova. Depende do acúmulo de dados de execução — por isso vem depois do Meu Dia."
    />
  ),
});
