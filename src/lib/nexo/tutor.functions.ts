import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TutorMessage = { role: "user" | "assistant"; content: string };

type TutorInput = { messages: TutorMessage[] };

function validate(input: unknown): TutorInput {
  const data = input as TutorInput;
  if (!data || !Array.isArray(data.messages) || data.messages.length === 0) {
    throw new Error("Mensagem vazia.");
  }
  const messages = data.messages.slice(-16).map((m) => {
    if ((m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      throw new Error("Mensagem inválida.");
    }
    return { role: m.role, content: m.content.slice(0, 4000) };
  });
  return { messages };
}

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Tutor indisponível no momento.");

    const { supabase, userId } = context;
    const today = new Date().toISOString().slice(0, 10);

    const [profileRes, examsRes, activitiesRes, topicsRes] = await Promise.all([
      supabase.from("profiles").select("name, goal, goal_detail, autonomy, preferences").eq("id", userId).maybeSingle(),
      supabase.from("target_exams").select("name, exam_date, specialty, priority").order("exam_date"),
      supabase
        .from("study_activities")
        .select("date, start_time, end_time, title, type, status, planned_minutes")
        .gte("date", today)
        .order("date")
        .order("start_time")
        .limit(25),
      supabase.from("topics").select("name, mastery, next_review_at").order("next_review_at").limit(25),
    ]);

    const profile = profileRes.data;
    const contextBlock = [
      `Data de hoje: ${today}.`,
      profile
        ? `Aluno: ${profile.name || "sem nome"}. Objetivo: ${profile.goal ?? "não informado"} ${profile.goal_detail ?? ""}. Nível de autonomia: ${profile.autonomy}.`
        : "Perfil ainda não preenchido.",
      `Provas-alvo: ${(examsRes.data ?? []).map((e) => `${e.name}${e.exam_date ? ` (${e.exam_date})` : ""} - prioridade ${e.priority}`).join("; ") || "nenhuma cadastrada"}.`,
      `Próximas atividades planejadas: ${(activitiesRes.data ?? []).map((a) => `${a.date} ${a.start_time?.slice(0, 5)} ${a.title} [${a.type}, ${a.status}, ${a.planned_minutes}min]`).join("; ") || "nenhuma"}.`,
      `Temas e domínio: ${(topicsRes.data ?? []).map((t) => `${t.name}${t.mastery != null ? ` ${Math.round(Number(t.mastery))}%` : ""}${t.next_review_at ? ` (revisão ${t.next_review_at.slice(0, 10)})` : ""}`).join("; ") || "nenhum cadastrado"}.`,
    ].join("\n");

    const systemPrompt = [
      "Você é a NEXO, tutora de preparação para residência médica.",
      "Responda em português do Brasil, com objetividade e tom acolhedor, sem enrolação.",
      "Use os dados reais do aluno abaixo para explicar decisões do plano, sugerir ajustes de rotina e priorização.",
      "Nunca invente dados que não estejam no contexto: se algo não estiver cadastrado, diga isso e oriente onde cadastrar (Configurações, Conteúdos, Revisões).",
      "Você não altera o plano sozinha: quando sugerir mudança, explique o passo que o aluno deve fazer no app.",
      "Não forneça conduta clínica para pacientes reais; foque em estudo, conteúdo teórico e método.",
      "",
      "CONTEXTO DO ALUNO:",
      contextBlock,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: systemPrompt }, ...data.messages],
      }),
    });

    if (response.status === 429) {
      return { reply: null, error: "Limite de uso atingido. Tente novamente em alguns instantes." };
    }
    if (response.status === 402) {
      return { reply: null, error: "Créditos de IA esgotados no workspace." };
    }
    if (!response.ok) {
      console.error("tutor gateway error", response.status, await response.text());
      return { reply: null, error: "O tutor não conseguiu responder agora. Tente de novo." };
    }

    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) return { reply: null, error: "Resposta vazia do tutor." };
    return { reply, error: null };
  });
