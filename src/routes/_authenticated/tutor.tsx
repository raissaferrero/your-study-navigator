import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "Tutor NEXO — NEXO" },
      { name: "description", content: "Tutor NEXO na plataforma NEXO." },
      { property: "og:title", content: "Tutor NEXO — NEXO" },
      { property: "og:description", content: "Tutor NEXO na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Tutor NEXO"
      description="Conversa com a NEXO sobre o seu plano: pedir explicações, ajustar rotina e entender decisões do planejamento em linguagem natural."
    />
  ),
});
