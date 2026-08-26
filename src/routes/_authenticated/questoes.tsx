import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, ListChecks, Plus, Trash2, Upload, X } from "lucide-react";
import {
  addQuestion,
  addQuestions,
  answerQuestion,
  computeStats,
  deleteQuestion,
  getAttempts,
  getQuestions,
  parseQuestionsText,
  type Question,
  type QuestionInput,
} from "@/lib/nexo/questions";
import { getPlanningContext } from "@/lib/nexo/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/questoes")({
  head: () => ({
    meta: [
      { title: "Questões — NEXO" },
      {
        name: "description",
        content: "Banco de questões por área, importação de provas anteriores e resolução com feedback.",
      },
      { property: "og:title", content: "Questões — NEXO" },
      {
        property: "og:description",
        content: "Banco de questões por área, importação de provas anteriores e resolução com feedback.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Questoes,
});

const NONE = "__none__";

type BaseForm = {
  area: string;
  subject_id: string;
  topic_id: string;
  exam_id: string;
  source: string;
  year: string;
  institution: string;
  difficulty: string;
};

const EMPTY_BASE: BaseForm = {
  area: "",
  subject_id: NONE,
  topic_id: NONE,
  exam_id: NONE,
  source: "",
  year: "",
  institution: "",
  difficulty: "3",
};

function baseToInput(base: BaseForm) {
  return {
    area: base.area.trim(),
    subject_id: base.subject_id === NONE ? null : base.subject_id,
    topic_id: base.topic_id === NONE ? null : base.topic_id,
    exam_id: base.exam_id === NONE ? null : base.exam_id,
    source: base.source.trim() || null,
    year: base.year ? Number(base.year) : null,
    institution: base.institution.trim() || null,
    difficulty: Number(base.difficulty),
  };
}

function Questoes() {
  const queryClient = useQueryClient();
  const questionsQuery = useQuery({ queryKey: ["questions"], queryFn: getQuestions });
  const attemptsQuery = useQuery({ queryKey: ["question-attempts"], queryFn: getAttempts });
  const ctxQuery = useQuery({ queryKey: ["planning-context"], queryFn: getPlanningContext });

  const questions = questionsQuery.data ?? [];
  const attempts = attemptsQuery.data ?? [];
  const subjects = ctxQuery.data?.subjects ?? [];
  const topics = ctxQuery.data?.topics ?? [];
  const exams = ctxQuery.data?.exams ?? [];

  const stats = useMemo(() => computeStats(questions, attempts), [questions, attempts]);
  const areas = useMemo(
    () => [...new Set(questions.map((q) => q.area || "Sem área"))].sort(),
    [questions],
  );

  async function refresh() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["questions"] }),
      queryClient.invalidateQueries({ queryKey: ["question-attempts"] }),
      queryClient.invalidateQueries({ queryKey: ["planning-context"] }),
    ]);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl">Questões</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cadastre questões por área, importe provas anteriores em lote e resolva com feedback
          imediato. Cada resposta ajusta o domínio do tema vinculado e alimenta a priorização do
          plano.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <StatCard label="Questões" value={String(stats.total)} />
        <StatCard label="Resolvidas" value={String(stats.answered)} />
        <StatCard label="Acertos" value={String(stats.correct)} />
        <StatCard label="Aproveitamento" value={`${stats.accuracy}%`} />
      </div>

      <Tabs defaultValue="resolver">
        <TabsList>
          <TabsTrigger value="resolver">Resolver</TabsTrigger>
          <TabsTrigger value="cadastrar">Cadastrar</TabsTrigger>
          <TabsTrigger value="importar">Importar prova</TabsTrigger>
        </TabsList>

        <TabsContent value="resolver" className="mt-6">
          <Resolver
            questions={questions}
            areas={areas}
            loading={questionsQuery.isLoading}
            onAnswered={refresh}
            onDeleted={refresh}
          />
        </TabsContent>

        <TabsContent value="cadastrar" className="mt-6">
          <Cadastrar
            subjects={subjects}
            topics={topics}
            exams={exams}
            onSaved={refresh}
          />
        </TabsContent>

        <TabsContent value="importar" className="mt-6">
          <Importar subjects={subjects} topics={topics} exams={exams} onSaved={refresh} />
        </TabsContent>
      </Tabs>

      {stats.byArea.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-sm font-medium">Desempenho por área</h2>
          <div className="space-y-3">
            {stats.byArea.map((a) => {
              const pct = a.answered ? Math.round((a.correct / a.answered) * 100) : 0;
              return (
                <div key={a.area} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{a.area}</span>
                    <span className="text-muted-foreground">
                      {a.answered}/{a.total} resolvidas · {pct}% de acerto
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl">{value}</p>
    </div>
  );
}

// ---------- Resolver ----------

function Resolver({
  questions,
  areas,
  loading,
  onAnswered,
  onDeleted,
}: {
  questions: Question[];
  areas: string[];
  loading: boolean;
  onAnswered: () => Promise<void>;
  onDeleted: () => Promise<void>;
}) {
  const [area, setArea] = useState<string>("todas");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const filtered = useMemo(
    () => questions.filter((q) => area === "todas" || (q.area || "Sem área") === area),
    [questions, area],
  );
  const current = filtered[Math.min(index, Math.max(filtered.length - 1, 0))];

  function reset(next: number) {
    setIndex(next);
    setSelected(null);
    setRevealed(false);
    setStartedAt(Date.now());
  }

  if (loading) return <p className="text-sm text-muted-foreground">Carregando questões…</p>;

  if (!current) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <ListChecks className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Nenhuma questão nesta seleção. Cadastre uma questão ou importe uma prova anterior.
        </p>
      </div>
    );
  }

  const options = (current.options as unknown as string[]) ?? [];

  async function confirm() {
    if (selected == null || !current) return;
    setBusy(true);
    try {
      const seconds = Math.round((Date.now() - startedAt) / 1000);
      const { isCorrect } = await answerQuestion(current, selected, seconds);
      setRevealed(true);
      toast[isCorrect ? "success" : "error"](isCorrect ? "Acertou!" : "Resposta incorreta.");
      await onAnswered();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={area}
          onValueChange={(v) => {
            setArea(v);
            reset(0);
          }}
        >
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as áreas</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {Math.min(index + 1, filtered.length)} de {filtered.length}
        </span>
      </div>

      <article className="space-y-5 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {current.area && <span className="rounded-full bg-muted px-2 py-1">{current.area}</span>}
          {current.source && (
            <span className="rounded-full bg-muted px-2 py-1">
              {current.source}
              {current.year ? ` · ${current.year}` : ""}
            </span>
          )}
          {current.institution && (
            <span className="rounded-full bg-muted px-2 py-1">{current.institution}</span>
          )}
        </div>

        <p className="whitespace-pre-line text-[15px] leading-relaxed">{current.statement}</p>

        <div className="space-y-2">
          {options.map((opt, i) => {
            const isCorrect = revealed && i === current.correct_index;
            const isWrong = revealed && i === selected && i !== current.correct_index;
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => setSelected(i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border border-border p-3 text-left text-sm transition-colors",
                  selected === i && !revealed && "border-primary bg-primary/5",
                  isCorrect && "border-primary bg-primary/10",
                  isWrong && "border-destructive bg-destructive/10",
                  !revealed && "hover:border-primary/60",
                )}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                  {isCorrect ? (
                    <Check className="h-3 w-3" />
                  ) : isWrong ? (
                    <X className="h-3 w-3" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {revealed && current.explanation && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="mb-1 font-medium">Comentário</p>
            <p className="whitespace-pre-line text-muted-foreground">{current.explanation}</p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {!revealed ? (
            <Button onClick={confirm} disabled={selected == null || busy}>
              Responder
            </Button>
          ) : (
            <Button onClick={() => reset(index + 1 < filtered.length ? index + 1 : 0)}>
              Próxima questão
            </Button>
          )}
          <Button variant="ghost" onClick={() => reset(index + 1 < filtered.length ? index + 1 : 0)}>
            Pular
          </Button>
          <Button
            variant="ghost"
            className="ml-auto text-muted-foreground"
            onClick={async () => {
              if (!current) return;
              await deleteQuestion(current.id);
              await onDeleted();
              reset(0);
              toast.success("Questão removida.");
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
        </div>
      </article>
    </div>
  );
}

// ---------- Campos comuns ----------

type Ctx = {
  subjects: { id: string; name: string }[];
  topics: { id: string; name: string; subject_id: string | null }[];
  exams: { id: string; name: string }[];
};

function BaseFields({
  base,
  setBase,
  subjects,
  topics,
  exams,
}: Ctx & { base: BaseForm; setBase: (b: BaseForm) => void }) {
  const availableTopics = topics.filter(
    (t) => base.subject_id === NONE || t.subject_id === base.subject_id,
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Área</Label>
        <Input
          value={base.area}
          onChange={(e) => setBase({ ...base, area: e.target.value })}
          placeholder="Clínica Médica, Pediatria…"
        />
      </div>
      <div className="space-y-2">
        <Label>Disciplina</Label>
        <Select
          value={base.subject_id}
          onValueChange={(v) => setBase({ ...base, subject_id: v, topic_id: NONE })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem disciplina</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Tema vinculado</Label>
        <Select value={base.topic_id} onValueChange={(v) => setBase({ ...base, topic_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem tema</SelectItem>
            {availableTopics.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Prova-alvo</Label>
        <Select value={base.exam_id} onValueChange={(v) => setBase({ ...base, exam_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Opcional" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>Sem vínculo</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Origem (prova)</Label>
        <Input
          value={base.source}
          onChange={(e) => setBase({ ...base, source: e.target.value })}
          placeholder="USP, ENARE, UNIFESP…"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ano</Label>
          <Input
            value={base.year}
            inputMode="numeric"
            onChange={(e) => setBase({ ...base, year: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            placeholder="2025"
          />
        </div>
        <div className="space-y-2">
          <Label>Dificuldade</Label>
          <Select value={base.difficulty} onValueChange={(v) => setBase({ ...base, difficulty: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Instituição</Label>
        <Input
          value={base.institution}
          onChange={(e) => setBase({ ...base, institution: e.target.value })}
          placeholder="Hospital / banca"
        />
      </div>
    </div>
  );
}

// ---------- Cadastrar ----------

function Cadastrar({ subjects, topics, exams, onSaved }: Ctx & { onSaved: () => Promise<void> }) {
  const [base, setBase] = useState<BaseForm>(EMPTY_BASE);
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    const filled = options.map((o) => o.trim()).filter(Boolean);
    if (!statement.trim()) {
      toast.error("Escreva o enunciado.");
      return;
    }
    if (filled.length < 2) {
      toast.error("Informe ao menos 2 alternativas.");
      return;
    }
    if (correct >= filled.length) {
      toast.error("Marque uma alternativa correta válida.");
      return;
    }
    setBusy(true);
    try {
      await addQuestion({
        ...baseToInput(base),
        statement: statement.trim(),
        options: filled,
        correct_index: correct,
        explanation: explanation.trim() || null,
      });
      await onSaved();
      setStatement("");
      setOptions(["", "", "", ""]);
      setCorrect(0);
      setExplanation("");
      toast.success("Questão cadastrada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <BaseFields base={base} setBase={setBase} subjects={subjects} topics={topics} exams={exams} />

      <div className="space-y-2">
        <Label>Enunciado</Label>
        <Textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          rows={5}
          placeholder="Paciente de 62 anos, hipertenso, procura o pronto-socorro com…"
        />
      </div>

      <div className="space-y-3">
        <Label>Alternativas (clique na letra para marcar a correta)</Label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(i)}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-sm",
                correct === i && "border-primary bg-primary text-primary-foreground",
              )}
            >
              {String.fromCharCode(65 + i)}
            </button>
            <Input
              value={opt}
              onChange={(e) =>
                setOptions(options.map((o, idx) => (idx === i ? e.target.value : o)))
              }
              placeholder={`Alternativa ${String.fromCharCode(65 + i)}`}
            />
            {options.length > 2 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setOptions(options.filter((_, idx) => idx !== i));
                  if (correct >= options.length - 1) setCorrect(0);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <Button variant="outline" size="sm" onClick={() => setOptions([...options, ""])}>
            <Plus className="mr-2 h-4 w-4" /> Alternativa
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <Label>Comentário / explicação</Label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={3}
          placeholder="Por que a alternativa correta é a correta."
        />
      </div>

      <Button onClick={save} disabled={busy}>
        {busy ? "Salvando…" : "Salvar questão"}
      </Button>
    </div>
  );
}

// ---------- Importar ----------

const EXEMPLO = `Qual é a conduta inicial na cetoacidose diabética?
A) Insulina subcutânea isolada
*B) Hidratação venosa com soro fisiológico
C) Bicarbonato de sódio em bolus
D) Metformina em dose alta
#: A reposição volêmica precede a insulinoterapia.

---

Sobre a pneumonia adquirida na comunidade, assinale a correta:
A) Sempre exige internação
*B) O CURB-65 auxilia na decisão de internação
C) Não requer antibiótico
D) Radiografia é contraindicada`;

function Importar({ subjects, topics, exams, onSaved }: Ctx & { onSaved: () => Promise<void> }) {
  const [base, setBase] = useState<BaseForm>(EMPTY_BASE);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState(false);

  const preview = useMemo(
    () => (raw.trim() ? parseQuestionsText(raw, baseToInput(base)) : null),
    [raw, base],
  );

  async function importAll() {
    if (!preview || preview.questions.length === 0) return;
    setBusy(true);
    try {
      const count = await addQuestions(preview.questions as QuestionInput[]);
      await onSaved();
      setRaw("");
      toast.success(`${count} questões importadas.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível importar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">Formato de importação</p>
        <p>
          Cole o texto da prova. Separe cada questão com uma linha em branco ou{" "}
          <code className="rounded bg-background px-1">---</code>. Alternativas começam com{" "}
          <code className="rounded bg-background px-1">A)</code>,{" "}
          <code className="rounded bg-background px-1">B)</code>… e a correta recebe{" "}
          <code className="rounded bg-background px-1">*</code> antes da letra. O comentário
          opcional começa com <code className="rounded bg-background px-1">#:</code>.
        </p>
      </div>

      <BaseFields base={base} setBase={setBase} subjects={subjects} topics={topics} exams={exams} />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Texto da prova</Label>
          <Button variant="ghost" size="sm" onClick={() => setRaw(EXEMPLO)}>
            Usar exemplo
          </Button>
        </div>
        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={14}
          className="font-mono text-xs"
          placeholder="Cole aqui as questões…"
        />
      </div>

      {preview && (
        <div className="space-y-2 text-sm">
          <p>
            <strong>{preview.questions.length}</strong> questões reconhecidas
            {preview.errors.length > 0 && ` · ${preview.errors.length} com problema`}
          </p>
          {preview.errors.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-destructive">
              {preview.errors.slice(0, 6).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          {preview.questions.length > 0 && (
            <ul className="space-y-1 text-muted-foreground">
              {preview.questions.slice(0, 5).map((q, i) => (
                <li key={i} className="truncate">
                  • {q.statement}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Button onClick={importAll} disabled={busy || !preview || preview.questions.length === 0}>
        <Upload className="mr-2 h-4 w-4" />
        {busy ? "Importando…" : "Importar questões"}
      </Button>
    </div>
  );
}
