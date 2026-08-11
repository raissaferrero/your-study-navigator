import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  availableMinutes,
  buildDayPlan,
  rankTargets,
  type ActivityDraft,
  type ActivityType,
  type Priority,
} from "./engine";

export type Activity = Tables<"study_activities">;
export type Profile = Tables<"profiles">;
export type Exam = Tables<"target_exams">;
export type Availability = Tables<"availability">;
export type ExceptionRow = Tables<"availability_exceptions">;
export type Subject = Tables<"subjects">;
export type Topic = Tables<"topics">;

export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return isoDate(d);
}

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada.");
  return data.user.id;
}

export async function getProfile(): Promise<Profile | null> {
  const uid = await userId();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (error) throw error;
  return data;
}

export type PlanningContext = {
  profile: Profile | null;
  exams: Exam[];
  availability: Availability[];
  exceptions: ExceptionRow[];
  subjects: Subject[];
  topics: Topic[];
};

export async function getPlanningContext(): Promise<PlanningContext> {
  const uid = await userId();
  const [profile, exams, availability, exceptions, subjects, topics] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
    supabase.from("target_exams").select("*").eq("user_id", uid).order("exam_date"),
    supabase.from("availability").select("*").eq("user_id", uid).order("weekday"),
    supabase.from("availability_exceptions").select("*").eq("user_id", uid).order("date"),
    supabase.from("subjects").select("*").eq("user_id", uid).order("name"),
    supabase.from("topics").select("*").eq("user_id", uid).order("name"),
  ]);
  return {
    profile: profile.data ?? null,
    exams: exams.data ?? [],
    availability: availability.data ?? [],
    exceptions: exceptions.data ?? [],
    subjects: subjects.data ?? [],
    topics: topics.data ?? [],
  };
}

export async function getActivities(from: string, to: string): Promise<Activity[]> {
  const uid = await userId();
  const { data, error } = await supabase
    .from("study_activities")
    .select("*")
    .eq("user_id", uid)
    .gte("date", from)
    .lte("date", to)
    .order("date")
    .order("start_time");
  if (error) throw error;
  return data ?? [];
}

function selfLevelsOf(profile: Profile | null): Record<string, string> {
  const raw = (profile?.self_assessment ?? {}) as { areas?: Record<string, string> };
  return raw.areas ?? {};
}

function preferencesOf(profile: Profile | null): ActivityType[] {
  const prefs = (profile?.preferences ?? []) as string[];
  const valid: ActivityType[] = ["revisao", "estudo", "questoes", "flashcards", "resumo", "simulado"];
  const picked = prefs.filter((p): p is ActivityType => valid.includes(p as ActivityType));
  return picked.length > 0 ? picked : ["revisao", "estudo", "questoes"];
}

/** Gera (ou regenera) o planejamento para os próximos `days` dias. */
export async function generatePlan(opts: { days?: number; reason: string; note?: string }): Promise<number> {
  const uid = await userId();
  const ctx = await getPlanningContext();
  const now = new Date();
  const today = isoDate(now);
  const days = opts.days ?? 7;
  const lastDay = addDays(today, days - 1);

  const targets = rankTargets({
    subjects: ctx.subjects,
    topics: ctx.topics,
    exams: ctx.exams,
    selfLevels: selfLevelsOf(ctx.profile),
    now,
  });

  const { data: version, error: versionError } = await supabase
    .from("planning_versions")
    .insert({ user_id: uid, reason: opts.reason, note: opts.note ?? null, summary: {} })
    .select()
    .single();
  if (versionError) throw versionError;

  // remove apenas o que ainda não foi executado
  const { error: delError } = await supabase
    .from("study_activities")
    .delete()
    .eq("user_id", uid)
    .eq("status", "pendente")
    .gte("date", today)
    .lte("date", lastDay);
  if (delError) throw delError;

  const drafts: ActivityDraft[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = addDays(today, i);
    const weekday = new Date(`${date}T00:00:00`).getDay();
    const hours = Number(ctx.availability.find((a) => a.weekday === weekday)?.hours ?? 0);
    const dayExceptions = ctx.exceptions.filter((e) => e.date === date);
    const minutes = availableMinutes(hours, dayExceptions);
    const morningBlock = dayExceptions.find((e) => e.end_time && e.end_time < "13:00:00");
    drafts.push(
      ...buildDayPlan({
        date,
        minutes,
        startAt: morningBlock?.end_time ? morningBlock.end_time.slice(0, 5) : "08:00",
        targets,
        preferences: preferencesOf(ctx.profile),
      }),
    );
  }

  if (drafts.length > 0) {
    const { error } = await supabase
      .from("study_activities")
      .insert(drafts.map((d) => ({ ...d, user_id: uid, planning_version_id: version.id })));
    if (error) throw error;
  }

  await supabase
    .from("planning_versions")
    .update({ summary: { adicionadas: drafts.length, dias: days } })
    .eq("id", version.id);

  return drafts.length;
}

export type ReplanInput = {
  reason: string;
  note?: string;
  hoursToday?: number | null;
};

/** Replaneja apenas o dia de hoje, preservando o que é crítico. */
export async function replanToday(input: ReplanInput): Promise<{
  kept: number;
  moved: number;
  minutes: number;
}> {
  const uid = await userId();
  const ctx = await getPlanningContext();
  const now = new Date();
  const today = isoDate(now);

  const all = await getActivities(today, today);
  const locked = all.filter((a) => a.status !== "pendente");
  const pending = all.filter((a) => a.status === "pendente");

  const weekday = now.getDay();
  const baseHours =
    input.hoursToday ?? Number(ctx.availability.find((a) => a.weekday === weekday)?.hours ?? 0);
  const dayExceptions = ctx.exceptions.filter((e) => e.date === today);
  let minutes = availableMinutes(baseHours, dayExceptions);
  const usedByLocked = locked.reduce((sum, a) => sum + (a.actual_minutes ?? a.planned_minutes), 0);
  minutes = Math.max(0, minutes - usedByLocked);

  const order: Record<string, number> = { alta: 0, media: 1, baixa: 2 };
  const sorted = [...pending].sort(
    (a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1) || a.start_time.localeCompare(b.start_time),
  );

  const { data: version, error: versionError } = await supabase
    .from("planning_versions")
    .insert({ user_id: uid, reason: input.reason, note: input.note ?? null, summary: {} })
    .select()
    .single();
  if (versionError) throw versionError;

  let cursor = Math.max(
    now.getHours() * 60 + now.getMinutes(),
    locked.length > 0
      ? Math.max(...locked.map((a) => Number(a.end_time.slice(0, 2)) * 60 + Number(a.end_time.slice(3, 5))))
      : 0,
  );
  cursor = Math.ceil(cursor / 5) * 5;

  const fmt = (m: number) =>
    `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}:00`;

  let kept = 0;
  let moved = 0;
  let remaining = minutes;

  for (const activity of sorted) {
    if (remaining >= activity.planned_minutes) {
      await supabase
        .from("study_activities")
        .update({
          start_time: fmt(cursor),
          end_time: fmt(cursor + activity.planned_minutes),
          planning_version_id: version.id,
        })
        .eq("id", activity.id);
      cursor += activity.planned_minutes;
      remaining -= activity.planned_minutes;
      kept += 1;
    } else {
      await supabase
        .from("study_activities")
        .update({
          date: addDays(today, 1),
          planning_version_id: version.id,
          rationale: `${activity.rationale ?? ""} Movida para amanhã no replanejamento (${input.reason}).`.trim(),
        })
        .eq("id", activity.id);
      moved += 1;
    }
  }

  await supabase
    .from("planning_versions")
    .update({ summary: { mantidas: kept, movidas: moved, minutos_disponiveis: minutes } })
    .eq("id", version.id);

  return { kept, moved, minutes };
}

export async function startActivity(id: string) {
  const { error } = await supabase
    .from("study_activities")
    .update({ status: "em_andamento", started_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function completeActivity(id: string, actualMinutes?: number) {
  const { data: activity, error: readError } = await supabase
    .from("study_activities")
    .select("*")
    .eq("id", id)
    .single();
  if (readError) throw readError;

  const minutes =
    actualMinutes ??
    (activity.started_at
      ? Math.max(1, Math.round((Date.now() - new Date(activity.started_at).getTime()) / 60000))
      : activity.planned_minutes);

  const { error } = await supabase
    .from("study_activities")
    .update({ status: "concluida", completed_at: new Date().toISOString(), actual_minutes: minutes })
    .eq("id", id);
  if (error) throw error;

  if (activity.topic_id) {
    await supabase
      .from("topics")
      .update({ last_studied_at: new Date().toISOString() })
      .eq("id", activity.topic_id);
  }
  return minutes;
}

export async function skipActivity(id: string) {
  const { error } = await supabase.from("study_activities").update({ status: "adiada" }).eq("id", id);
  if (error) throw error;
}

export const PRIORITY_ORDER: Priority[] = ["alta", "media", "baixa"];
