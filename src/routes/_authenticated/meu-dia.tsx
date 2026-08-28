import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  Play,
  Check,
  SkipForward,
  RefreshCw,
  Clock,
  Info,
  ChevronDown,
} from "lucide-react";
import {
  completeActivity,
  getActivities,
  getPlanningContext,
  isoDate,
  replanToday,
  skipActivity,
  startActivity,
  type Activity,
} from "@/lib/nexo/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AgendaProximosDias } from "@/components/nexo/agenda-proximos-dias";
import { SessaoQuestoes } from "@/components/nexo/sessao-questoes";

export const Route = createFileRoute("/_authenticated/meu-dia")({
  head: () => ({
    meta: [
      { title: "Meu Dia — NEXO" },
      { name: "description", content: "Seu plano de estudo de hoje, priorizado pela NEXO." },
      { property: "og:title", content: "Meu Dia — NEXO" },
      { property: "og:description", content: "Seu plano de estudo de hoje, priorizado pela NEXO." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MeuDia,
});

const TYPE_LABEL: Record<string, string> = {
  revisao: "Revisão",
  estudo: "Teoria",
  questoes: "Questões",
  flashcards: "Flashcards",
  resumo: "Resumo",
  simulado: "Simulado",
};

function hhmm(t: string) {
  return t.slice(0, 5);
}

function MeuDia() {
  const queryClient = useQueryClient();
  const today = isoDate(new Date());
  const [replanOpen, setReplanOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [hoursToday, setHoursToday] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", today],
    queryFn: () => getActivities(today, today),
  });
  const { data: ctx } = useQuery({ queryKey: ["planning-context"], queryFn: getPlanningContext });

  const done = activities.filter((a) => a.status === "concluida");
  const plannedMinutes = activities.reduce((s, a) => s + a.planned_minutes, 0);
  const doneMinutes = done.reduce((s, a) => s + (a.actual_minutes ?? a.planned_minutes), 0);
  const pct = plannedMinutes > 0 ? Math.round((doneMinutes / plannedMinutes) * 100) : 0;
  const current =
    activities.find((a) => a.status === "em_andamento") ??
    activities.find((a) => a.status === "pendente");

  const nextExam = (ctx?.exams ?? [])
    .filter((e) => e.exam_date && e.exam_date >= today)
    .sort((a, b) => (a.exam_date ?? "").localeCompare(b.exam_date ?? ""))[0];
  const daysToExam = nextExam?.exam_date
    ? Math.round(
        (new Date(`${nextExam.exam_date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) /
          86400000,
      )
    : null;

  async function run(id: string, fn: () => Promise<unknown>, message: string) {
    setBusy(id);
    try {
      await fn();
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setBusy(null);
    }
  }

  async function doReplan() {
    if (!reason.trim()) {
      toast.error("Descreva o que mudou para eu replanejar com critério.");
      return;
    }
    setBusy("replan");
    try {
      const result = await replanToday({
        reason: reason.trim(),
        hoursToday: hoursToday ? Number(hoursToday) : null,
      });
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
      setReplanOpen(false);
      setReason("");
      setHoursToday("");
      toast.success(`${result.kept} atividade(s) mantidas, ${result.moved} movida(s) para amanhã.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Falha ao replanejar.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-caps">
            {new Date(`${today}T00:00:00`).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Meu Dia</h1>
        </div>
        <Dialog open={replanOpen} onOpenChange={setReplanOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Replanejar hoje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>O que mudou hoje?</DialogTitle>
              <DialogDescription>
                Vou manter o que é crítico e mover o resto — sem apagar o que você já executou.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo</Label>
                <Input
                  id="reason"
                  placeholder="Plantão inesperado, cansaço, imprevisto..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Horas disponíveis a partir de agora (opcional)</Label>
                <Input
                  id="hours"
                  type="number"
                  min={0}
                  max={16}
                  step={0.5}
                  value={hoursToday}
                  onChange={(e) => setHoursToday(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={doReplan} disabled={busy === "replan"}>
                {busy === "replan" ? "Replanejando..." : "Replanejar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <section className="panel mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="label-caps">Progresso do dia</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {done.length} de {activities.length} atividades · {doneMinutes} de {plannedMinutes} min
            </p>
          </div>
          {daysToExam !== null && (
            <div className="text-right">
              <p className="label-caps">{nextExam?.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {daysToExam === 0 ? "é hoje" : `em ${daysToExam} dias`}
              </p>
            </div>
          )}
        </div>
        <Progress value={pct} className="mt-4" />
      </section>

      {current && (
        <section className="panel mt-4 border-primary/40 p-5">
          <p className="label-caps text-primary">Agora</p>
          <h2 className="mt-2 font-display text-2xl">{current.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hhmm(current.start_time)}–{hhmm(current.end_time)} · {current.planned_minutes} min ·{" "}
            {TYPE_LABEL[current.type] ?? current.type}
          </p>
          {current.rationale && (
            <p className="mt-3 flex gap-2 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {current.rationale}
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {current.status === "pendente" ? (
              <Button
                onClick={() => run(current.id, () => startActivity(current.id), "Bom estudo.")}
                disabled={busy === current.id}
              >
                <Play className="mr-2 h-4 w-4" /> Iniciar
              </Button>
            ) : (
              <Button
                onClick={() => run(current.id, () => completeActivity(current.id), "Atividade concluída.")}
                disabled={busy === current.id}
              >
                <Check className="mr-2 h-4 w-4" /> Concluir
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => run(current.id, () => skipActivity(current.id), "Atividade adiada.")}
              disabled={busy === current.id}
            >
              <SkipForward className="mr-2 h-4 w-4" /> Adiar
            </Button>
          </div>
        </section>
      )}

      <section className="mt-8">
        <p className="label-caps">Roteiro de hoje</p>
        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
        ) : activities.length === 0 ? (
          <div className="panel mt-4 p-6 text-sm leading-relaxed text-muted-foreground">
            Nenhuma atividade planejada para hoje. Isso costuma acontecer quando a disponibilidade do dia
            é zero. Ajuste sua rotina em Configurações ou use “Replanejar hoje”.
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {activities.map((activity) => (
              <ActivityRow
                key={activity.id}
                activity={activity}
                busy={busy === activity.id}
                expanded={expanded === activity.id}
                onToggle={() => setExpanded(expanded === activity.id ? null : activity.id)}
                onStart={() => run(activity.id, () => startActivity(activity.id), "Bom estudo.")}
                onComplete={() =>
                  run(activity.id, () => completeActivity(activity.id), "Atividade concluída.")
                }
                onSkip={() => run(activity.id, () => skipActivity(activity.id), "Atividade adiada.")}
              />
            ))}
          </ol>
        )}
      </section>

      <AgendaProximosDias today={today} />
    </div>
  );
}

function ActivityRow({
  activity,
  busy,
  expanded,
  onToggle,
  onStart,
  onComplete,
  onSkip,
}: {
  activity: Activity;
  busy: boolean;
  expanded: boolean;
  onToggle: () => void;
  onStart: () => void;
  onComplete: () => void;
  onSkip: () => void;
}) {
  const doneState = activity.status === "concluida";
  const skipped = activity.status === "adiada";

  return (
    <li
      className={cn(
        "panel p-4 transition-colors",
        doneState && "opacity-60",
        skipped && "opacity-50",
        activity.status === "em_andamento" && "border-primary/40",
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 shrink-0 pt-0.5">
          <p className="text-sm tabular-nums text-foreground">{hhmm(activity.start_time)}</p>
          <p className="text-xs text-muted-foreground">{activity.planned_minutes}min</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-caps">{TYPE_LABEL[activity.type] ?? activity.type}</span>
            {activity.priority === "alta" && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-primary">
                prioridade
              </span>
            )}
          </div>
          <p className={cn("mt-1 text-sm", doneState && "line-through")}>{activity.title}</p>
          {activity.rationale && (
            <button
              onClick={onToggle}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Por que isto agora
              <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
            </button>
          )}
          {expanded && activity.rationale && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activity.rationale}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {activity.status === "pendente" && (
            <Button size="icon" variant="ghost" onClick={onStart} disabled={busy} aria-label="Iniciar">
              <Play className="h-4 w-4" />
            </Button>
          )}
          {activity.status !== "concluida" && (
            <Button size="icon" variant="ghost" onClick={onComplete} disabled={busy} aria-label="Concluir">
              <Check className="h-4 w-4" />
            </Button>
          )}
          {activity.status === "pendente" && (
            <Button size="icon" variant="ghost" onClick={onSkip} disabled={busy} aria-label="Adiar">
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
          {doneState && (
            <span className="flex items-center gap-1 pr-2 text-xs text-primary">
              <Clock className="h-3 w-3" />
              {activity.actual_minutes ?? activity.planned_minutes}min
            </span>
          )}
        </div>
      </div>
    </li>
  );
}
