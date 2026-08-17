import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { askTutor, type TutorMessage } from "@/lib/nexo/tutor.functions";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "Tutor NEXO — converse sobre o seu plano" },
      {
        name: "description",
        content: "Tire dúvidas sobre a rotina, a priorização e as decisões do seu planejamento de estudos.",
      },
      { property: "og:title", content: "Tutor NEXO — converse sobre o seu plano" },
      {
        property: "og:description",
        content: "Tire dúvidas sobre a rotina, a priorização e as decisões do seu planejamento de estudos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TutorPage,
});

const SUGESTOES = [
  "Por que a NEXO priorizou essas atividades hoje?",
  "Tenho plantão amanhã. Como reorganizo a semana?",
  "Quais temas estão com domínio mais baixo?",
  "Como distribuir revisões até a minha próxima prova?",
];

function TutorPage() {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    const next: TutorMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await ask({ data: { messages: next } });
      if (res.error || !res.reply) {
        toast.error(res.error ?? "Não foi possível responder.");
        setMessages(next);
      } else {
        setMessages([...next, { role: "assistant", content: res.reply }]);
      }
    } catch {
      toast.error("Falha ao falar com o tutor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-3xl flex-col p-4 md:p-8">
      <header className="mb-4">
        <h1 className="font-serif text-3xl">Tutor NEXO</h1>
        <p className="text-sm text-muted-foreground">
          Ele enxerga seu plano, provas-alvo e domínio dos temas para responder no seu contexto.
        </p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <Card className="space-y-4 p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="size-4" />
              Comece por uma destas perguntas
            </div>
            <div className="grid gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-lg border border-border px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-card-foreground",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              pensando…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder="Pergunte sobre seu plano, rotina ou prioridades…"
          rows={2}
          className="resize-none"
        />
        <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Enviar">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
