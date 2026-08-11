// Motor NEXO — camada de lógica pura, separada da apresentação.
// Não inventa dados: tudo o que é usado aqui vem do que o estudante informou
// ou do que a plataforma registrou de facto.

export type Priority = "alta" | "media" | "baixa";
export type ActivityType = "revisao" | "estudo" | "questoes" | "simulado" | "flashcards" | "resumo";

export type ExamInput = {
  id: string;
  name: string;
  priority: Priority;
  exam_date: string | null;
};

export type SubjectInput = {
  id: string;
  name: string;
  area: string;
};

export type TopicInput = {
  id: string;
  subject_id: string | null;
  name: string;
  mastery: number | null;
  difficulty: number;
  last_studied_at: string | null;
  next_review_at: string | null;
};

export type ExceptionInput = {
  date: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
};

export type ActivityDraft = {
  date: string;
  start_time: string;
  end_time: string;
  planned_minutes: number;
  type: ActivityType;
  title: string;
  detail: string | null;
  subject_id: string | null;
  topic_id: string | null;
  exam_id: string | null;
  priority: Priority;
  rationale: string;
};

// ---------- pesos configuráveis (evolução futura) ----------
export const WEIGHTS = {
  examPriority: { alta: 3, media: 2, baixa: 1 } as Record<Priority, number>,
  proximity: 2.5,
  selfLevel: { fraca: 3, media: 1.6, forte: 0.6 } as Record<string, number>,
  difficulty: 0.5,
  neverStudied: 1.5,
  staleness: 0.08, // por dia sem estudar (limitado)
};

const TYPE_MINUTES: Record<ActivityType, number> = {
  revisao: 30,
  flashcards: 30,
  estudo: 50,
  questoes: 40,
  simulado: 120,
  resumo: 40,
};

export const TYPE_LABEL: Record<ActivityType, string> = {
  revisao: "Revisão",
  flashcards: "Flashcards",
  estudo: "Estudo direcionado",
  questoes: "Questões",
  simulado: "Simulado",
  resumo: "Resumo",
};

export function daysUntil(dateISO: string | null, from: Date): number | null {
  if (!dateISO) return null;
  const target = new Date(`${dateISO}T00:00:00`);
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - base.getTime()) / 86400000);
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":");
  return Number(h) * 60 + Number(m ?? 0);
}

function fmt(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export function formatHm(time: string): string {
  return time.slice(0, 5);
}

export type Target = {
  subject_id: string | null;
  topic_id: string | null;
  label: string;
  score: number;
  priority: Priority;
  exam_id: string | null;
  reasons: string[];
};

/** Ordena o que merece atenção, usando apenas dados reais do estudante. */
export function rankTargets(params: {
  subjects: SubjectInput[];
  topics: TopicInput[];
  exams: ExamInput[];
  selfLevels: Record<string, string>;
  now: Date;
}): Target[] {
  const { subjects, topics, exams, selfLevels, now } = params;

  const bestExam = [...exams].sort((a, b) => {
    const pa = WEIGHTS.examPriority[a.priority] ?? 1;
    const pb = WEIGHTS.examPriority[b.priority] ?? 1;
    if (pa !== pb) return pb - pa;
    return (daysUntil(a.exam_date, now) ?? 9999) - (daysUntil(b.exam_date, now) ?? 9999);
  })[0];

  const examBoost = (() => {
    if (!bestExam) return { value: 0, reason: null as string | null };
    const base = WEIGHTS.examPriority[bestExam.priority] ?? 1;
    const d = daysUntil(bestExam.exam_date, now);
    if (d === null) return { value: base, reason: `${bestExam.name} tem prioridade ${bestExam.priority}` };
    const proximity = d <= 0 ? 1 : Math.min(1, 120 / Math.max(d, 1)) ;
    return {
      value: base + proximity * WEIGHTS.proximity,
      reason: `${bestExam.name} é em ${d} dia${d === 1 ? "" : "s"} e tem prioridade ${bestExam.priority}`,
    };
  })();

  const subjectById = new Map(subjects.map((s) => [s.id, s]));
  const targets: Target[] = [];

  for (const topic of topics) {
    const subject = topic.subject_id ? subjectById.get(topic.subject_id) : undefined;
    const level = subject ? (selfLevels[subject.name] ?? "media") : "media";
    const reasons: string[] = [];
    let score = examBoost.value;
    if (examBoost.reason) reasons.push(examBoost.reason);

    score += WEIGHTS.selfLevel[level] ?? 1.6;
    if (subject) reasons.push(`você classificou ${subject.name} como área ${level}`);

    score += (topic.difficulty - 3) * WEIGHTS.difficulty;

    if (!topic.last_studied_at) {
      score += WEIGHTS.neverStudied;
      reasons.push("ainda não há registro de estudo deste tema");
    } else {
      const days = Math.floor((now.getTime() - new Date(topic.last_studied_at).getTime()) / 86400000);
      score += Math.min(days, 30) * WEIGHTS.staleness;
      reasons.push(`último estudo há ${days} dia${days === 1 ? "" : "s"}`);
    }

    if (topic.mastery !== null) {
      score += (100 - topic.mastery) / 40;
      reasons.push(`taxa de acerto registrada em ${Math.round(topic.mastery)}%`);
    }

    targets.push({
      subject_id: topic.subject_id,
      topic_id: topic.id,
      label: subject ? `${topic.name} — ${subject.name}` : topic.name,
      score,
      priority: "media",
      exam_id: bestExam?.id ?? null,
      reasons,
    });
  }

  for (const subject of subjects) {
    const level = selfLevels[subject.name] ?? "media";
    const reasons: string[] = [];
    let score = examBoost.value * 0.9;
    if (examBoost.reason) reasons.push(examBoost.reason);
    score += WEIGHTS.selfLevel[level] ?? 1.6;
    reasons.push(`você classificou ${subject.name} como área ${level}`);
    targets.push({
      subject_id: subject.id,
      topic_id: null,
      label: subject.name,
      score,
      priority: "media",
      exam_id: bestExam?.id ?? null,
      reasons,
    });
  }

  targets.sort((a, b) => b.score - a.score);
  const max = targets[0]?.score ?? 0;
  for (const t of targets) {
    t.priority = t.score >= max * 0.85 ? "alta" : t.score >= max * 0.6 ? "media" : "baixa";
  }
  return targets;
}

/** Minutos realmente disponíveis no dia, descontando plantões/compromissos. */
export function availableMinutes(baseHours: number, exceptions: ExceptionInput[]): number {
  let minutes = Math.round(baseHours * 60);
  for (const ex of exceptions) {
    if (ex.start_time && ex.end_time) {
      const span = Math.max(0, toMinutes(ex.end_time) - toMinutes(ex.start_time));
      minutes -= span;
    } else {
      minutes = 0;
    }
  }
  return Math.max(0, minutes);
}

/** Constrói o plano cronológico de um dia. */
export function buildDayPlan(params: {
  date: string;
  minutes: number;
  startAt?: string;
  targets: Target[];
  preferences: ActivityType[];
}): ActivityDraft[] {
  const { date, minutes, targets, preferences } = params;
  if (minutes < 20 || targets.length === 0) return [];

  const cycleSource = preferences.filter((p) => p !== "simulado");
  const cycle: ActivityType[] = cycleSource.length > 0 ? cycleSource : ["revisao", "estudo", "questoes"];

  const drafts: ActivityDraft[] = [];
  let cursor = toMinutes(params.startAt ?? "08:00");
  let remaining = minutes;
  let i = 0;
  let sinceBreak = 0;

  while (remaining >= 20 && i < 12) {
    const type = cycle[i % cycle.length]!;
    const target = targets[i % Math.min(targets.length, 6)]!;
    const dur = Math.min(TYPE_MINUTES[type], remaining);
    if (dur < 20) break;

    drafts.push({
      date,
      start_time: fmt(cursor),
      end_time: fmt(cursor + dur),
      planned_minutes: dur,
      type,
      title: buildTitle(type, target.label),
      detail: null,
      subject_id: target.subject_id,
      topic_id: target.topic_id,
      exam_id: target.exam_id,
      priority: target.priority,
      rationale: buildRationale(target),
    });

    cursor += dur;
    remaining -= dur;
    sinceBreak += dur;
    if (sinceBreak >= 90 && remaining >= 30) {
      cursor += 15;
      sinceBreak = 0;
    }
    i += 1;
  }

  return drafts;
}

function buildTitle(type: ActivityType, label: string): string {
  switch (type) {
    case "questoes":
      return `20 questões — ${label}`;
    case "revisao":
      return `Revisão ativa — ${label}`;
    case "flashcards":
      return `Flashcards — ${label}`;
    case "resumo":
      return `Resumo — ${label}`;
    case "simulado":
      return `Simulado — ${label}`;
    default:
      return label;
  }
}

export function buildRationale(target: Target): string {
  if (target.reasons.length === 0) return "Fonte não identificada para esta priorização.";
  return `Priorizado porque ${target.reasons.join("; ")}.`;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
