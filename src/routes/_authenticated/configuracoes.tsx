import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — NEXO" },
      { name: "description", content: "Configurações na plataforma NEXO." },
      { property: "og:title", content: "Configurações — NEXO" },
      { property: "og:description", content: "Configurações na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Configurações"
      description="Edição de provas-alvo, disponibilidade semanal, plantões e nível de autonomia. Por enquanto esses dados são definidos na configuração inicial."
    />
  ),
});
