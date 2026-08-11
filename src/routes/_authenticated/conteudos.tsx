import { createFileRoute } from "@tanstack/react-router";
import { EmBreve } from "@/components/nexo/em-breve";

export const Route = createFileRoute("/_authenticated/conteudos")({
  head: () => ({
    meta: [
      { title: "Conteúdos — NEXO" },
      { name: "description", content: "Conteúdos na plataforma NEXO." },
      { property: "og:title", content: "Conteúdos — NEXO" },
      { property: "og:description", content: "Conteúdos na plataforma NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <EmBreve
      title="Conteúdos"
      description="Aqui vão viver seus materiais: upload de PDFs e apostilas, extração de temas, resumos e mapa de conteúdo por prova. A base de dados (matérias e temas) já existe e alimenta o planejamento; a camada de ingestão de documentos entra na próxima fase."
    />
  ),
});
