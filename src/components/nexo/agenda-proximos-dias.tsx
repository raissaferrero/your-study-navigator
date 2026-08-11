import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { addDays, getActivities, isoDate, type Activity } from "@/lib/nexo/api";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

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

function parseISO(iso: string) {
  return new Date(`${iso}T00:00:00`);
}

export function AgendaProximosDias({ today }: { today: string }) {
  const rangeEnd = addDays(today, 90);
  const [selected, setSelected] = useState<Date>(parseISO(addDays(today, 1)));

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", "agenda", today, rangeEnd],
    queryFn: () => getActivities(today, rangeEnd),
  });

  const byDate = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of activities) {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    }
    for (const list of map.values()) list.sort((x, y) => x.start_time.localeCompare(y.start_time));
    return map;
  }, [activities]);

  const selectedISO = isoDate(selected);
  const dayActivities = byDate.get(selectedISO) ?? [];
  const totalMin = dayActivities.reduce((s, a) => s + a.planned_minutes, 0);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;

  const plannedDays = useMemo(
    () => Array.from(byDate.keys()).map((iso) => parseISO(iso)),
    [byDate],
  );

  return (
    <section className="mt-10">
      <p className="label-caps flex items-center gap-2">
        <CalendarDays className="h-3.5 w-3.5" /> Próximos dias
      </p>
      <div className="mt-3 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="panel p-2">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => d && setSelected(d)}
            startMonth={parseISO(today)}
            endMonth={parseISO(rangeEnd)}
            disabled={{ before: parseISO(today), after: parseISO(rangeEnd) }}
            modifiers={{ planned: plannedDays }}
            modifiersClassNames={{
              planned: "font-semibold text-primary underline underline-offset-4 decoration-primary/50",
            }}
            className={cn("p-3 pointer-events-auto")}
          />
        </div>
        <div className="panel p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-xl">
              {selected.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </p>
            <p className="text-sm text-muted-foreground">
              {dayActivities.length} atividade{dayActivities.length === 1 ? "" : "s"}
              {totalMin > 0 && ` · ${hours > 0 ? `${hours}h` : ""}${mins > 0 ? `${mins}min` : ""}`}
            </p>
          </div>

          {isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
          ) : dayActivities.length === 0 ? (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Nenhuma atividade planejada para este dia ainda.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {dayActivities.map((a) => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className="w-14 shrink-0 tabular-nums text-muted-foreground">
                    {hhmm(a.start_time)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_LABEL[a.type] ?? a.type} · {a.planned_minutes} min
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
