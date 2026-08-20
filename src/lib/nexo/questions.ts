import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Question = Tables<"questions">;
export type QuestionAttempt = Tables<"question_attempts">;

async function userId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada.");
  return data.user.id;
}

export type QuestionInput = {
  area: string;
  subject_id: string | null;
  topic_id: string | null;
  exam_id: string | null;
  source: string | null;
  year: number | null;
  institution: string | null;
  statement: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: number;
};

export async function getQuestions(): Promise<Question[]> {
  const uid = await userId();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAttempts(): Promise<QuestionAttempt[]> {
  const uid = await userId();
  const { data, error } = await supabase
    .from("question_attempts")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addQuestion(input: QuestionInput) {
  const uid = await userId();
  const { error } = await supabase.from("questions").insert({ ...input, user_id: uid });
  if (error) throw error;
}

export async function addQuestions(inputs: QuestionInput[]) {
  if (inputs.length === 0) return 0;
  const uid = await userId();
  const { error } = await supabase
    .from("questions")
    .insert(inputs.map((q) => ({ ...q, user_id: uid })));
  if (error) throw error;
  return inputs.length;
}

export async function deleteQuestion(id: string) {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}

/** Registra a resolução e ajusta o domínio do tema vinculado. */
export async function answerQuestion(question: Question, selectedIndex: number, seconds?: number) {
  const uid = await userId();
  const isCorrect = selectedIndex === question.correct_index;
  const { error } = await supabase.from("question_attempts").insert({
    user_id: uid,
    question_id: question.id,
    topic_id: question.topic_id,
    selected_index: selectedIndex,
    is_correct: isCorrect,
    seconds: seconds ?? null,
  });
  if (error) throw error;

  if (question.topic_id) {
    const { data: topic } = await supabase
      .from("topics")
      .select("mastery")
      .eq("id", question.topic_id)
      .maybeSingle();
    const current = topic?.mastery == null ? 50 : Number(topic.mastery);
    const next = Math.max(0, Math.min(100, Math.round(current + (isCorrect ? 6 : -8))));
    await supabase
      .from("topics")
      .update({ mastery: next, last_studied_at: new Date().toISOString() })
      .eq("id", question.topic_id);
  }

  return { isCorrect };
}

export type ParsedImport = { questions: QuestionInput[]; errors: string[] };

/**
 * Importa provas anteriores em texto simples.
 * Formato por bloco (separado por linha em branco dupla ou "---"):
 *   Enunciado...
 *   A) alternativa
 *   B) alternativa
 *   *C) alternativa correta   (asterisco marca a correta)
 *   #: explicação opcional
 */
export function parseQuestionsText(
  raw: string,
  base: Pick<QuestionInput, "area" | "subject_id" | "topic_id" | "exam_id" | "source" | "year" | "institution" | "difficulty">,
): ParsedImport {
  const blocks = raw
    .split(/\n\s*(?:---+)\s*\n|\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const questions: QuestionInput[] = [];
  const errors: string[] = [];

  blocks.forEach((block, index) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const statementLines: string[] = [];
    const options: string[] = [];
    let correctIndex = -1;
    let explanation: string | null = null;

    for (const line of lines) {
      const explMatch = /^(?:#|coment[áa]rio|explica[çc][ãa]o)\s*[:\-]\s*(.+)$/i.exec(line);
      if (explMatch) {
        explanation = explMatch[1] ?? null;
        continue;
      }
      const optMatch = /^(\*?)\s*([a-eA-E])\s*[).\-]\s*(.+)$/.exec(line);
      if (optMatch && (options.length > 0 || statementLines.length > 0)) {
        if (optMatch[1] === "*") correctIndex = options.length;
        options.push((optMatch[3] ?? "").trim());
        continue;
      }
      if (options.length === 0) statementLines.push(line);
      else if (explanation) explanation = `${explanation} ${line}`;
    }

    const statement = statementLines.join(" ").trim();
    if (!statement) {
      errors.push(`Bloco ${index + 1}: enunciado vazio.`);
      return;
    }
    if (options.length < 2) {
      errors.push(`Bloco ${index + 1}: são necessárias ao menos 2 alternativas (A), B), ...).`);
      return;
    }
    if (correctIndex < 0) {
      errors.push(`Bloco ${index + 1}: marque a alternativa correta com "*" antes da letra.`);
      return;
    }

    questions.push({ ...base, statement, options, correct_index: correctIndex, explanation });
  });

  return { questions, errors };
}

export type QuestionStats = {
  total: number;
  answered: number;
  correct: number;
  accuracy: number;
  byArea: { area: string; total: number; correct: number; answered: number }[];
};

export function computeStats(questions: Question[], attempts: QuestionAttempt[]): QuestionStats {
  const areaOf = new Map(questions.map((q) => [q.id, q.area || "Sem área"]));
  const byArea = new Map<string, { total: number; correct: number; answered: number }>();
  for (const q of questions) {
    const key = q.area || "Sem área";
    const cur = byArea.get(key) ?? { total: 0, correct: 0, answered: 0 };
    cur.total += 1;
    byArea.set(key, cur);
  }
  let correct = 0;
  for (const a of attempts) {
    const key = areaOf.get(a.question_id);
    if (a.is_correct) correct += 1;
    if (!key) continue;
    const cur = byArea.get(key) ?? { total: 0, correct: 0, answered: 0 };
    cur.answered += 1;
    if (a.is_correct) cur.correct += 1;
    byArea.set(key, cur);
  }
  return {
    total: questions.length,
    answered: attempts.length,
    correct,
    accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
    byArea: [...byArea.entries()]
      .map(([area, v]) => ({ area, ...v }))
      .sort((a, b) => b.total - a.total),
  };
}
