import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Plus, Trash2, Wand2 } from "lucide-react";
import {
  addExam,
  addException,
  deleteExam,
  deleteException,
  generatePlan,
  getPlanningContext,
  saveAvailability,
  updateProfileSettings,
} from "@/lib/nexo/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — NEXO" },
      { name: "description", content: "Ajuste rotina, provas-alvo e preferências de estudo." },
      { property: "og:title", content: "Configurações — NEXO" },
      { property: "og:description", content: "Ajuste rotina, provas-alvo e preferências de estudo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Configuracoes,
});

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const PREFERENCES = [
  { id: "questoes", label: "Questões" },
  { id: "estudo", label: "Teoria" },
  { id: "flashcards", label: "Flashcards" },
  { id: "revisao", label: "Revisões" },
  { id: "simulado", label: "Simulados" },
  { id: "resumo", label: "Resumos" },
];
const AUTONOMY = [
  { id: "automatico", label: "Automático", hint: "A NEXO monta e ajusta o plano por você." },
  { id: "assistido", label: "Assistido", hint: "A NEXO sugere e você confirma as mudanças." },
  { id: "manual", label: "Manual", hint: "Você decide tudo; a NEXO apenas aponta riscos." },
];
const PRIORITIES = [
  { id: "alta", label: "Alta" },
  { id: "media", label: "Média" },
  { id: "baixa", label: "Baixa" },
];

function Configuracoes() {
  const queryClient = useQueryClient();
  const { data: ctx, isLoading } = useQuery({
    queryKey: ["planning-context"],
    queryFn: getPlanningContext,
  });

  const [name, setName] = useState("");
  const [goalDetail, setGoalDetail] = useState("");
  const [autonomy, setAutonomy] = useState("automatico");
  const [prefs, setPrefs] = useState<string[]>([]);
  const [hours, setHours] = useState<string[]>(Array(7).fill("0"));
  const [busy, setBusy] = useState<string | null>(null);

  const [examName, setExamName] = useState("");
  const [examInstitution, setExamInstitution] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examPriority, setExamPriority] = useState("media");

  const [exDate, setExDate] = useState("");
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");
  const [exDescription, setExDescription] = useState("");

  useEffect(() => {
    if (!ctx) return;
    setName(ctx.profile?.name ?? "");
    setGoalDetail(ctx.profile?.goal_detail ?? "");
    setAutonomy(ctx.profile?.autonomy ?? "automatico");
    setPrefs(((ctx.profile?.preferences ?? []) as string[]) ?? []);
    const next = Array(7).fill("0");
    for (const row of ctx.availability) next[row.weekday] = String(Number(row.hours));
    setHours(next);
  }, [ctx]);

  async function run(key: string, fn: () => Promise<unknown>, message: string) {
    setBusy(key);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["planning-context"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(null);
    }
  }

  function togglePref(id: string) {
    setPrefs((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    );
  }

  const weekTotal = hours.reduce((sum, h) => sum + (Number(h) || 0), 0);

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-6 py-10 text-sm text-muted-foreground">Carregando...</p>;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <header>
        <p className="label-caps">Sua rotina</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Configurações</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Tudo que você ajusta aqui alimenta o motor de planejamento. Depois de mudar rotina ou provas,
          regenere o plano para as mudanças valerem nos próximos dias.
        </p>
      </header>

      {/* Perfil */}
      <section className="panel mt-8 p-5">
        <p className="label-caps">Perfil</p>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalDetail">Objetivo em uma frase</Label>
            <Textarea
              id="goalDetail"
              rows={2}
              value={goalDetail}
              onChange={(e) => setGoalDetail(e.target.value)}
              placeholder="Ex.: aprovação em Clínica Médica em instituição pública de SP."
            />
          </div>
          <div className="space-y-2">
            <Label>Nível de autonomia da NEXO</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {AUTONOMY.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setAutonomy(o.id)}
                  className={cn(
                    "rounded-md border p-3 text-left text-sm transition-colors",
                    autonomy === o.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="block font-medium">{o.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{o.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Formatos preferidos</Label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => togglePref(p.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    prefs.includes(p.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <Button
            disabled={busy === "profile"}
            onClick={() =>
              run(
                "profile",
                () =>
                  updateProfileSettings({
                    name: name.trim(),
                    goal_detail: goalDetail.trim() || null,
                    autonomy,
                    preferences: prefs,
                  }),
                "Perfil atualizado.",
              )
            }
          >
            Salvar perfil
          </Button>
        </div>
      </section>

      {/* Rotina semanal */}
      <section className="panel mt-4 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="label-caps">Disponibilidade semanal</p>
          <p className="text-sm text-muted-foreground">{weekTotal.toFixed(1)} h por semana</p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className="flex items-center justify-between gap-3">
              <Label htmlFor={`day-${i}`} className="text-sm text-muted-foreground">
                {day}
              </Label>
              <Input
                id={`day-${i}`}
                type="number"
                min={0}
                max={16}
                step={0.5}
                className="w-24"
                value={hours[i]}
                onChange={(e) =>
                  setHours((current) => current.map((h, idx) => (idx === i ? e.target.value : h)))
                }
              />
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          disabled={busy === "availability"}
          onClick={() =>
            run(
              "availability",
              () => saveAvailability(hours.map((h) => Number(h) || 0)),
              "Disponibilidade atualizada.",
            )
          }
        >
          Salvar rotina
        </Button>
      </section>

      {/* Provas-alvo */}
      <section className="panel mt-4 p-5">
        <p className="label-caps">Provas-alvo</p>
        {(ctx?.exams.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma prova cadastrada.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ctx?.exams.map((exam) => (
              <li
                key={exam.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{exam.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exam.institution ? `${exam.institution} · ` : ""}
                    {exam.exam_date
                      ? new Date(`${exam.exam_date}T00:00:00`).toLocaleDateString("pt-BR")
                      : "sem data"}{" "}
                    · prioridade {exam.priority}
                  </p>
                </div>
                <button
                  aria-label={`Remover ${exam.name}`}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  disabled={busy === exam.id}
                  onClick={() => run(exam.id, () => deleteExam(exam.id), "Prova removida.")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="examName">Nome da prova</Label>
            <Input id="examName" value={examName} onChange={(e) => setExamName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examInstitution">Instituição</Label>
            <Input
              id="examInstitution"
              value={examInstitution}
              onChange={(e) => setExamInstitution(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="examDate">Data</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Prioridade</Label>
            <Select value={examPriority} onValueChange={setExamPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          disabled={busy === "exam"}
          onClick={() => {
            if (!examName.trim()) {
              toast.error("Informe o nome da prova.");
              return;
            }
            run(
              "exam",
              async () => {
                await addExam({
                  name: examName.trim(),
                  institution: examInstitution.trim() || null,
                  exam_date: examDate || null,
                  specialty: null,
                  priority: examPriority,
                });
                setExamName("");
                setExamInstitution("");
                setExamDate("");
              },
              "Prova adicionada.",
            );
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Adicionar prova
        </Button>
      </section>

      {/* Plantões e compromissos */}
      <section className="panel mt-4 p-5">
        <p className="label-caps">Plantões e compromissos</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Blocos com horário descontam do tempo daquele dia. Sem horário, o dia inteiro fica indisponível.
        </p>
        {(ctx?.exceptions.length ?? 0) === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum compromisso cadastrado.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ctx?.exceptions.map((ex) => (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{ex.description || "Compromisso"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(`${ex.date}T00:00:00`).toLocaleDateString("pt-BR")}
                    {ex.start_time && ex.end_time
                      ? ` · ${ex.start_time.slice(0, 5)}–${ex.end_time.slice(0, 5)}`
                      : " · dia inteiro"}
                  </p>
                </div>
                <button
                  aria-label="Remover compromisso"
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  disabled={busy === ex.id}
                  onClick={() => run(ex.id, () => deleteException(ex.id), "Compromisso removido.")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exDate">Data</Label>
            <Input id="exDate" type="date" value={exDate} onChange={(e) => setExDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exDescription">Descrição</Label>
            <Input
              id="exDescription"
              value={exDescription}
              onChange={(e) => setExDescription(e.target.value)}
              placeholder="Plantão, aula, viagem..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exStart">Início (opcional)</Label>
            <Input id="exStart" type="time" value={exStart} onChange={(e) => setExStart(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exEnd">Fim (opcional)</Label>
            <Input id="exEnd" type="time" value={exEnd} onChange={(e) => setExEnd(e.target.value)} />
          </div>
        </div>
        <Button
          variant="outline"
          className="mt-4"
          disabled={busy === "exception"}
          onClick={() => {
            if (!exDate) {
              toast.error("Informe a data do compromisso.");
              return;
            }
            run(
              "exception",
              async () => {
                await addException({
                  date: exDate,
                  start_time: exStart ? `${exStart}:00` : null,
                  end_time: exEnd ? `${exEnd}:00` : null,
                  description: exDescription.trim() || null,
                });
                setExDate("");
                setExStart("");
                setExEnd("");
                setExDescription("");
              },
              "Compromisso adicionado.",
            );
          }}
        >
          <CalendarPlus className="mr-2 h-4 w-4" /> Adicionar compromisso
        </Button>
      </section>

      {/* Regenerar plano */}
      <section className="panel mt-4 p-5">
        <p className="label-caps">Replanejamento</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Regenera os próximos 7 dias com os dados atuais. Atividades já iniciadas ou concluídas são
          preservadas.
        </p>
        <Button
          className="mt-4"
          disabled={busy === "plan"}
          onClick={() =>
            run(
              "plan",
              async () => {
                const created = await generatePlan({ days: 7, reason: "Ajuste nas configurações" });
                await queryClient.invalidateQueries({ queryKey: ["activities"] });
                if (created === 0) {
                  throw new Error("Nenhuma atividade gerada — verifique sua disponibilidade semanal.");
                }
              },
              "Plano regenerado para os próximos 7 dias.",
            )
          }
        >
          <Wand2 className="mr-2 h-4 w-4" />
          {busy === "plan" ? "Regenerando..." : "Regenerar plano"}
        </Button>
      </section>
    </div>
  );
}
