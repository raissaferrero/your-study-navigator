import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/lib/nexo/api";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de progresso — NEXO" },
      {
        name: "description",
        content: "Constância, horas realizadas versus planejadas e evolução por disciplina.",
      },
      { property: "og:title", content: "Dashboard de progresso — NEXO" },
      {
        property: "og:description",
        content: "Constância, horas realizadas versus planejadas e evolução por disciplina.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function fmtH(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? String(m).padStart(2, "0") : ""}` : `${m}min`;
}

const RANGES = [
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
];

function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => getDashboardData(days),
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Sua execução real comparada ao plano do motor NEXO.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {RANGES.map((r) => (
            <Button
              key={r.days}
              size="sm"
              variant={days === r.days ? "secondary" : "ghost"}
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </header>

      {isLoading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Horas estudadas" value={fmtH(data.totals.doneMinutes)} hint={`de ${fmtH(data.totals.plannedMinutes)} planejados`} />
            <Metric label="Aderência ao plano" value={`${data.totals.adherence}%`} hint={`${data.totals.completed} atividades concluídas`} />
            <Metric label="Constância" value={`${data.totals.streak} dia${data.totals.streak === 1 ? "" : "s"}`} hint="sequência atual com estudo" />
            <Metric label="Pendências" value={`${data.totals.pending + data.totals.skipped}`} hint={`${data.totals.skipped} adiadas`} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Minutos por dia</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.daily} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="realizado" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="planejado"
                    stroke="hsl(var(--muted-foreground))"
                    fill="none"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="realizado"
                    stroke="hsl(var(--primary))"
                    fill="url(#realizado)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tempo por disciplina</CardTitle>
              </CardHeader>
              <CardContent className="h-72">
                {data.bySubject.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma atividade concluída com disciplina vinculada ainda.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.bySubject.slice(0, 8)} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="minutes" name="minutos" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Domínio médio por disciplina</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.bySubject.filter((s) => s.mastery != null).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Registre revisões em Revisões para acompanhar o domínio.
                  </p>
                ) : (
                  data.bySubject
                    .filter((s) => s.mastery != null)
                    .map((s) => (
                      <div key={s.name} className="space-y-1.5">
                        <div className="flex justify-between text-sm">
                          <span>{s.name}</span>
                          <span className="text-muted-foreground">{s.mastery}%</span>
                        </div>
                        <Progress value={s.mastery ?? 0} />
                      </div>
                    ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contagem regressiva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.exams.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Cadastre suas provas-alvo em Configurações.
                </p>
              ) : (
                data.exams.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{e.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {e.date ? e.date.split("-").reverse().join("/") : "sem data definida"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {e.daysLeft == null
                        ? "—"
                        : e.daysLeft >= 0
                          ? `faltam ${e.daysLeft} dias`
                          : "já realizada"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card>
      <CardContent className="space-y-1 p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-serif text-2xl">{value}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}
