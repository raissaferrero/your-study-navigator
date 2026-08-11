import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generatePlan } from "@/lib/nexo/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Configuração inicial — NEXO" },
      { name: "description", content: "Conte sua rotina e a NEXO monta seu planejamento." },
      { property: "og:title", content: "Configuração inicial — NEXO" },
      { property: "og:description", content: "Conte sua rotina e a NEXO monta seu planejamento." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Onboarding,
});

type ExamForm = {
  name: string;
  institution: string;
  exam_date: string;
  specialty: string;
  priority: "alta" | "media" | "baixa";
};

type ShiftForm = { date: string; start_time: string; end_time: string; description: string };

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const AREAS = [
  "Clínica Médica",
  "Cirurgia",
  "Pediatria",
  "Ginecologia e Obstetrícia",
  "Medicina Preventiva",
];
const PREFERENCES = [
  { id: "questoes", label: "Questões" },
  { id: "estudo", label: "Teoria" },
  { id: "flashcards", label: "Flashcards" },
  { id: "revisao", label: "Revisões" },
  { id: "simulado", label: "Simulados" },
  { id: "resumo", label: "Resumos" },
];

const STEPS = [
  "Objetivo",
  "Provas-alvo",
  "Disponibilidade",
  "Plantões",
  "Materiais",
  "Preferências",
  "Nível inicial",
  "Autonomia",
];

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState<null | "running" | "done">(null);
  const [progress, setProgress] = useState(0);

  const [goal, setGoal] = useState("residencia");
  const [goalDetail, setGoalDetail] = useState("");
  const [exams, setExams] = useState<ExamForm[]>([
    { name: "", institution: "", exam_date: "", specialty: "", priority: "alta" },
  ]);
  const [hours, setHours] = useState<number[]>([4, 4, 4, 4, 4, 4, 4]);
  const [shifts, setShifts] = useState<ShiftForm[]>([]);
  const [prefs, setPrefs] = useState<string[]>(["revisao", "estudo", "questoes"]);
  const [levels, setLevels] = useState<Record<string, string>>(
    Object.fromEntries(AREAS.map((a) => [a, "media"])),
  );
  const [hardTopics, setHardTopics] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState("");
  const [autonomy, setAutonomy] = useState("automatico");

  const last = step === STEPS.length - 1;

  async function finish() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sessão expirada.");

      const validExams = exams.filter((e) => e.name.trim().length > 0);
      if (validExams.length === 0) throw new Error("Cadastre ao menos uma prova-alvo.");

      await supabase.from("target_exams").delete().eq("user_id", uid);
      await supabase.from("target_exams").insert(
        validExams.map((e) => ({
          user_id: uid,
          name: e.name.trim(),
          institution: e.institution.trim() || null,
          exam_date: e.exam_date || null,
          specialty: e.specialty.trim() || null,
          priority: e.priority,
        })),
      );

      await supabase.from("availability").delete().eq("user_id", uid);
      await supabase
        .from("availability")
        .insert(hours.map((h, weekday) => ({ user_id: uid, weekday, hours: h })));

      await supabase.from("availability_exceptions").delete().eq("user_id", uid);
      const validShifts = shifts.filter((s) => s.date);
      if (validShifts.length > 0) {
        await supabase.from("availability_exceptions").insert(
          validShifts.map((s) => ({
            user_id: uid,
            date: s.date,
            start_time: s.start_time || null,
            end_time: s.end_time || null,
            description: s.description.trim() || null,
          })),
        );
      }

      await supabase.from("subjects").delete().eq("user_id", uid);
      const { data: subjects } = await supabase
        .from("subjects")
        .insert(AREAS.map((name) => ({ user_id: uid, name, area: "Medicina" })))
        .select();

      const topicRows: { user_id: string; subject_id: string; name: string; difficulty: number }[] = [];
      for (const subject of subjects ?? []) {
        const raw = hardTopics[subject.name] ?? "";
        for (const t of raw.split(",").map((s) => s.trim()).filter(Boolean)) {
          topicRows.push({ user_id: uid, subject_id: subject.id, name: t, difficulty: 5 });
        }
      }
      if (topicRows.length > 0) await supabase.from("topics").insert(topicRows);

      await supabase
        .from("profiles")
        .update({
          goal,
          goal_detail: goalDetail.trim() || null,
          autonomy,
          preferences: prefs,
          self_assessment: { areas: levels, geral: general.trim() || null },
          onboarding_completed: true,
        })
        .eq("id", uid);

      setProcessing("running");
      setProgress(15);
      const timer = setInterval(() => setProgress((p) => Math.min(p + 12, 90)), 350);
      await generatePlan({ reason: "Planejamento inicial após onboarding", days: 7 });
      clearInterval(timer);
      setProgress(100);
      setProcessing("done");
      await queryClient.invalidateQueries();
    } catch (error) {
      setProcessing(null);
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir.");
    } finally {
      setSaving(false);
    }
  }

  if (processing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-md text-center">
          {processing === "running" ? (
            <>
              <h1 className="font-display text-3xl">Montando sua rotina</h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Estou analisando seus objetivos, provas, disponibilidade e plantões para construir
                seu planejamento.
              </p>
              <Progress value={progress} className="mt-8" />
            </>
          ) : (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h1 className="mt-6 font-display text-3xl">Seu plano está pronto.</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Ainda estou em fase de calibração: os primeiros dias servem para aprender seu ritmo real.
              </p>
              <Button className="mt-8" onClick={() => navigate({ to: "/meu-dia" })}>
                Ver meu dia
              </Button>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-6 py-12">
      <div className="flex items-center justify-between">
        <span className="font-display text-2xl">NEXO</span>
        <span className="text-xs text-muted-foreground">
          Etapa {step + 1} de {STEPS.length}
        </span>
      </div>
      <Progress value={((step + 1) / STEPS.length) * 100} className="mt-4" />
      <p className="label-caps mt-6">{STEPS[step]}</p>

      <div className="mt-6 space-y-6">
        {step === 0 && (
          <>
            <h1 className="font-display text-3xl">O que você está se preparando para fazer?</h1>
            <div className="space-y-2">
              {[
                { id: "residencia", label: "Residência médica" },
                { id: "prova_especifica", label: "Prova específica" },
                { id: "outro", label: "Outro" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setGoal(o.id)}
                  className={cn(
                    "w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    goal === o.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {goal !== "residencia" && (
              <div className="space-y-2">
                <Label htmlFor="goalDetail">Descreva seu objetivo</Label>
                <Input id="goalDetail" value={goalDetail} onChange={(e) => setGoalDetail(e.target.value)} />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h1 className="font-display text-3xl">Quais provas você quer prestar?</h1>
            {exams.map((exam, i) => (
              <div key={i} className="panel space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="label-caps">Prova {i + 1}</span>
                  {exams.length > 1 && (
                    <button onClick={() => setExams(exams.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Nome da prova"
                  value={exam.name}
                  onChange={(e) =>
                    setExams(exams.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Instituição"
                    value={exam.institution}
                    onChange={(e) =>
                      setExams(exams.map((x, idx) => (idx === i ? { ...x, institution: e.target.value } : x)))
                    }
                  />
                  <Input
                    type="date"
                    value={exam.exam_date}
                    onChange={(e) =>
                      setExams(exams.map((x, idx) => (idx === i ? { ...x, exam_date: e.target.value } : x)))
                    }
                  />
                  <Input
                    placeholder="Especialidade (opcional)"
                    value={exam.specialty}
                    onChange={(e) =>
                      setExams(exams.map((x, idx) => (idx === i ? { ...x, specialty: e.target.value } : x)))
                    }
                  />
                  <div className="flex gap-2">
                    {(["alta", "media", "baixa"] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() =>
                          setExams(exams.map((x, idx) => (idx === i ? { ...x, priority: p } : x)))
                        }
                        className={cn(
                          "flex-1 rounded-md border px-2 py-2 text-xs capitalize transition-colors",
                          exam.priority === p ? "border-primary bg-primary/10" : "border-border",
                        )}
                      >
                        {p === "media" ? "média" : p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setExams([...exams, { name: "", institution: "", exam_date: "", specialty: "", priority: "media" }])
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar prova
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display text-3xl">Quantas horas você tem por dia?</h1>
            <div className="space-y-2">
              {WEEKDAYS.map((day, i) => (
                <div key={day} className="flex items-center justify-between gap-4 rounded-md border border-border px-4 py-2">
                  <span className="text-sm">{day}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={16}
                      step={0.5}
                      value={hours[i]}
                      onChange={(e) =>
                        setHours(hours.map((h, idx) => (idx === i ? Number(e.target.value) : h)))
                      }
                      className="w-20 text-right"
                    />
                    <span className="text-sm text-muted-foreground">h</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="font-display text-3xl">Você tem plantões ou compromissos fixos?</h1>
            <p className="text-sm text-muted-foreground">
              A NEXO desconta esses períodos ao planejar seus dias.
            </p>
            {shifts.map((shift, i) => (
              <div key={i} className="panel space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="label-caps">Compromisso {i + 1}</span>
                  <button onClick={() => setShifts(shifts.filter((_, idx) => idx !== i))}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input
                    type="date"
                    value={shift.date}
                    onChange={(e) =>
                      setShifts(shifts.map((x, idx) => (idx === i ? { ...x, date: e.target.value } : x)))
                    }
                  />
                  <Input
                    type="time"
                    value={shift.start_time}
                    onChange={(e) =>
                      setShifts(shifts.map((x, idx) => (idx === i ? { ...x, start_time: e.target.value } : x)))
                    }
                  />
                  <Input
                    type="time"
                    value={shift.end_time}
                    onChange={(e) =>
                      setShifts(shifts.map((x, idx) => (idx === i ? { ...x, end_time: e.target.value } : x)))
                    }
                  />
                </div>
                <Input
                  placeholder="Descrição"
                  value={shift.description}
                  onChange={(e) =>
                    setShifts(shifts.map((x, idx) => (idx === i ? { ...x, description: e.target.value } : x)))
                  }
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setShifts([...shifts, { date: "", start_time: "", end_time: "", description: "" }])
              }
            >
              <Plus className="mr-2 h-4 w-4" /> Adicionar plantão
            </Button>
          </>
        )}

        {step === 4 && (
          <>
            <h1 className="font-display text-3xl">Seus materiais</h1>
            <div className="panel flex gap-3 p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                O envio e o processamento de PDFs, apostilas e provas anteriores fazem parte da próxima
                fase de implementação (Conteúdos). A estrutura de dados já está preparada, mas ainda não
                consigo interpretar documentos — por isso não vou simular temas extraídos que não existem.
                Você pode concluir a configuração e enviar seus materiais depois.
              </p>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <h1 className="font-display text-3xl">Como você prefere estudar?</h1>
            <div className="grid gap-2 sm:grid-cols-2">
              {PREFERENCES.map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    setPrefs(prefs.includes(p.id) ? prefs.filter((x) => x !== p.id) : [...prefs, p.id])
                  }
                  className={cn(
                    "rounded-md border px-4 py-3 text-left text-sm transition-colors",
                    prefs.includes(p.id) ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Preferências iniciais. Quando houver dados reais de desempenho, eles terão mais peso.
            </p>
          </>
        )}

        {step === 6 && (
          <>
            <h1 className="font-display text-3xl">Como você avalia seu nível hoje?</h1>
            {AREAS.map((area) => (
              <div key={area} className="panel space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">{area}</span>
                  <div className="flex gap-2">
                    {["fraca", "media", "forte"].map((lv) => (
                      <button
                        key={lv}
                        onClick={() => setLevels({ ...levels, [area]: lv })}
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs transition-colors",
                          levels[area] === lv ? "border-primary bg-primary/10" : "border-border",
                        )}
                      >
                        {lv === "media" ? "média" : lv}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  placeholder="Temas difíceis nesta área (separados por vírgula)"
                  value={hardTopics[area] ?? ""}
                  onChange={(e) => setHardTopics({ ...hardTopics, [area]: e.target.value })}
                />
              </div>
            ))}
            <Textarea
              placeholder="Percepção geral (opcional)"
              value={general}
              onChange={(e) => setGeneral(e.target.value)}
            />
          </>
        )}

        {step === 7 && (
          <>
            <h1 className="font-display text-3xl">Quanto você quer que a NEXO decida por você?</h1>
            <div className="space-y-2">
              {[
                { id: "automatico", label: "Automático", d: "A NEXO monta e adapta o planejamento." },
                { id: "assistido", label: "Assistido", d: "A NEXO recomenda, você ajusta." },
                { id: "manual", label: "Manual", d: "Você mantém o controle das decisões." },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setAutonomy(o.id)}
                  className={cn(
                    "w-full rounded-md border px-4 py-3 text-left transition-colors",
                    autonomy === o.id ? "border-primary bg-primary/10" : "border-border hover:bg-accent",
                  )}
                >
                  <span className="text-sm font-medium">{o.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{o.d}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Voltar
        </Button>
        {last ? (
          <Button onClick={finish} disabled={saving}>
            {saving ? "Salvando..." : "Concluir configuração"}
          </Button>
        ) : (
          <Button onClick={() => setStep((s) => s + 1)}>
            Continuar <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </main>
  );
}
