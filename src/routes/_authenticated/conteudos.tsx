import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  addSubject,
  addTopic,
  deleteSubject,
  deleteTopic,
  getPlanningContext,
  updateTopic,
  type Subject,
  type Topic,
} from "@/lib/nexo/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/conteudos")({
  head: () => ({
    meta: [
      { title: "Conteúdos — NEXO" },
      { name: "description", content: "Suas disciplinas e temas que alimentam o planejamento." },
      { property: "og:title", content: "Conteúdos — NEXO" },
      {
        property: "og:description",
        content: "Suas disciplinas e temas que alimentam o planejamento.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Conteudos,
});

const DIFFICULTIES = [
  { value: 1, label: "Muito fácil" },
  { value: 2, label: "Fácil" },
  { value: 3, label: "Média" },
  { value: 4, label: "Difícil" },
  { value: 5, label: "Muito difícil" },
];

function Conteudos() {
  const queryClient = useQueryClient();
  const { data: ctx, isLoading } = useQuery({
    queryKey: ["planning-context"],
    queryFn: getPlanningContext,
  });

  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [subjectName, setSubjectName] = useState("");
  const [subjectArea, setSubjectArea] = useState("Medicina");

  const topicsBySubject = useMemo(() => {
    const map = new Map<string, Topic[]>();
    for (const topic of ctx?.topics ?? []) {
      const key = topic.subject_id ?? "sem-disciplina";
      const list = map.get(key) ?? [];
      list.push(topic);
      map.set(key, list);
    }
    return map;
  }, [ctx?.topics]);

  async function run(key: string, fn: () => Promise<unknown>, message: string) {
    setBusy(key);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["planning-context"] });
      await queryClient.invalidateQueries({ queryKey: ["review-queue"] });
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(null);
    }
  }

  const subjects = ctx?.subjects ?? [];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header>
        <p className="label-caps flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" /> Base de conteúdo
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Conteúdos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Disciplinas e temas são a matéria-prima do planejamento: dificuldade e domínio definem o que a
          NEXO prioriza em Meu Dia e quando cada tema volta em Revisões.
        </p>
      </header>

      <section className="panel mt-8 p-5">
        <p className="label-caps">Nova disciplina</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="subjectName">Nome</Label>
            <Input
              id="subjectName"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder="Ex.: Cardiologia"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjectArea">Área</Label>
            <Input
              id="subjectArea"
              value={subjectArea}
              onChange={(e) => setSubjectArea(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={busy === "subject"}
            onClick={() => {
              if (!subjectName.trim()) {
                toast.error("Informe o nome da disciplina.");
                return;
              }
              run(
                "subject",
                async () => {
                  await addSubject({ name: subjectName.trim(), area: subjectArea.trim() || "Medicina" });
                  setSubjectName("");
                },
                "Disciplina adicionada.",
              );
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Adicionar
          </Button>
        </div>
      </section>

      {isLoading ? (
        <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>
      ) : subjects.length === 0 ? (
        <div className="panel mt-4 p-6 text-sm leading-relaxed text-muted-foreground">
          Nenhuma disciplina ainda. Crie a primeira acima para começar a mapear seus temas.
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {subjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              topics={topicsBySubject.get(subject.id) ?? []}
              expanded={open === subject.id}
              busy={busy}
              onToggle={() => setOpen(open === subject.id ? null : subject.id)}
              run={run}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SubjectCard({
  subject,
  topics,
  expanded,
  busy,
  onToggle,
  run,
}: {
  subject: Subject;
  topics: Topic[];
  expanded: boolean;
  busy: string | null;
  onToggle: () => void;
  run: (key: string, fn: () => Promise<unknown>, message: string) => Promise<void>;
}) {
  const [topicName, setTopicName] = useState("");
  const [topicDifficulty, setTopicDifficulty] = useState("3");

  const avgMastery = topics.filter((t) => t.mastery !== null);
  const mastery =
    avgMastery.length > 0
      ? Math.round(avgMastery.reduce((s, t) => s + (t.mastery ?? 0), 0) / avgMastery.length)
      : null;

  return (
    <li className="panel p-4">
      <div className="flex items-start justify-between gap-3">
        <button className="min-w-0 flex-1 text-left" onClick={onToggle}>
          <p className="text-sm text-foreground">{subject.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {subject.area || "—"} · {topics.length} tema{topics.length === 1 ? "" : "s"}
            {mastery !== null && ` · domínio médio ${mastery}%`}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <button
            aria-label={`Remover ${subject.name}`}
            className="text-muted-foreground transition-colors hover:text-destructive"
            disabled={busy === subject.id}
            onClick={() =>
              run(subject.id, () => deleteSubject(subject.id), "Disciplina removida.")
            }
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button aria-label="Expandir" onClick={onToggle} className="text-muted-foreground">
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum tema nesta disciplina ainda.</p>
          ) : (
            <ul className="space-y-2">
              {topics.map((topic) => (
                <li key={topic.id} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate">{topic.name}</span>
                  <Select
                    value={String(topic.difficulty)}
                    onValueChange={(v) =>
                      run(
                        topic.id,
                        () => updateTopic(topic.id, { difficulty: Number(v) }),
                        "Dificuldade atualizada.",
                      )
                    }
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTIES.map((d) => (
                        <SelectItem key={d.value} value={String(d.value)}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
                    {topic.mastery !== null ? `${Math.round(topic.mastery)}%` : "sem dado"}
                  </span>
                  <button
                    aria-label={`Remover ${topic.name}`}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    disabled={busy === topic.id}
                    onClick={() => run(topic.id, () => deleteTopic(topic.id), "Tema removido.")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor={`topic-${subject.id}`}>Novo tema</Label>
              <Input
                id={`topic-${subject.id}`}
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="Ex.: Insuficiência cardíaca"
              />
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={topicDifficulty} onValueChange={setTopicDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTIES.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={busy === `topic-${subject.id}`}
              onClick={() => {
                if (!topicName.trim()) {
                  toast.error("Informe o nome do tema.");
                  return;
                }
                run(
                  `topic-${subject.id}`,
                  async () => {
                    await addTopic({
                      name: topicName.trim(),
                      subject_id: subject.id,
                      difficulty: Number(topicDifficulty),
                    });
                    setTopicName("");
                  },
                  "Tema adicionado.",
                );
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}
