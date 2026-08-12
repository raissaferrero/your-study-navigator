import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, CalendarClock, Sparkles } from "lucide-react";
import { getReviewQueue, registerReview, type ReviewItem } from "@/lib/nexo/api";
import { REVIEW_QUALITY_LABEL, type ReviewQuality } from "@/lib/nexo/engine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/revisoes")({
  head: () => ({
    meta: [
      { title: "Revisões — NEXO" },
      { name: "description", content: "Fila de revisão espaçada dos seus temas." },
      { property: "og:title", content: "Revisões — NEXO" },
      { property: "og:description", content: "Fila de revisão espaçada dos seus temas." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Revisoes,
});

const QUALITIES: ReviewQuality[] = ["dificil", "medio", "facil"];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Revisoes() {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["review-queue"], queryFn: getReviewQueue });

  async function review(item: ReviewItem, quality: ReviewQuality) {
    setBusy(item.topic.id);
    try {
      const result = await registerReview(item.topic, quality);
      await queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      toast.success(`Próxima revisão em ${result.days} dia${result.days === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar a revisão.");
    } finally {
      setBusy(null);
    }
  }

  const due = data?.due ?? [];
  const upcoming = data?.upcoming ?? [];
  const untouched = data?.untouched ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header>
        <p className="label-caps flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Revisão espaçada
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Revisões</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Cada tema volta em um intervalo calculado pela sua própria avaliação. Quanto mais difícil você
          achou, mais cedo ele reaparece — nada aqui é estimado sem o seu retorno.
        </p>
      </header>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <>
          <section className="mt-8">
            <p className="label-caps">Para revisar hoje ({due.length})</p>
            {due.length === 0 ? (
              <div className="panel mt-3 p-6 text-sm leading-relaxed text-muted-foreground">
                Nenhuma revisão vencida. Volte quando o próximo intervalo fechar.
              </div>
            ) : (
              <ul className="mt-3 space-y-2">
                {due.map((item) => (
                  <li key={item.topic.id} className="panel p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{item.topic.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.subjectName ?? "Sem disciplina"}
                          {item.topic.mastery !== null && ` · domínio ${Math.round(item.topic.mastery)}%`}
                          {item.overdueDays !== null && item.overdueDays > 0
                            ? ` · atrasada ${item.overdueDays} dia${item.overdueDays === 1 ? "" : "s"}`
                            : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {QUALITIES.map((q) => (
                          <Button
                            key={q}
                            size="sm"
                            variant={q === "facil" ? "default" : "outline"}
                            disabled={busy === item.topic.id}
                            onClick={() => review(item, q)}
                          >
                            {REVIEW_QUALITY_LABEL[q]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-10">
            <p className="label-caps flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5" /> Agendadas ({upcoming.length})
            </p>
            {upcoming.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Assim que você registrar uma revisão, ela aparece aqui com a próxima data.
              </p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {upcoming.map((item) => (
                  <li
                    key={item.topic.id}
                    className={cn("panel flex items-center justify-between gap-3 px-4 py-3 text-sm")}
                  >
                    <span className="min-w-0 truncate">
                      {item.topic.name}
                      <span className="text-muted-foreground"> · {item.subjectName ?? "—"}</span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(item.dueDate)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {untouched.length > 0 && (
            <section className="mt-10">
              <p className="label-caps flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" /> Ainda sem estudo registrado ({untouched.length})
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Estes temas entram na fila de revisão depois do primeiro estudo concluído em Meu Dia.
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {untouched.map((item) => (
                  <li
                    key={item.topic.id}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {item.topic.name}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
