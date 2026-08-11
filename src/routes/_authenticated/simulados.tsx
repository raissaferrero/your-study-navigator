import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/simulados")({
  head: () => ({
    meta: [
      { title: "Simulados — NEXO" },
      { name: "description", content: "Simulados na plataforma NEXO." },
      { property: "og:title", content: "Simulados — NEXO" },
      { property: "og:description", content: "Simulados na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Simulados"
      description="Simulados cronometrados com correção e diagnóstico por área, incluindo o encaixe automático na agenda conforme a proximidade da prova."
    />
  ),
});
