import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X, ArrowRight } from "lucide-react";
import { answerQuestion, getQuestions, type Question } from "@/lib/nexo/questions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Temas prioritários da atividade / do dia, em ordem de prioridade. */
  topicIds: string[];
  subjectIds: string[];
  limit?: number;
  onFinished?: (result: { total: number; correct: number }) => void;
};

/** Ordena as questões pelos temas prioritários; completa com o restante. */
function pickQuestions(all: Question[], topicIds: string[], subjectIds: string[], limit: number) {
  const rank = (q: Question) => {
    const t = q.topic_id ? topicIds.indexOf(q.topic_id) : -1;
    if (t >= 0) return t;
    if (q.subject_id && subjectIds.includes(q.subject_id)) return 100;
    return 1000;
  };
  return [...all].sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

export function SessaoQuestoes({
  open,
  onOpenChange,
  title,
  topicIds,
  subjectIds,
  limit = 10,
  onFinished,
}: Props) {
  const queryClient = useQueryClient();
  const { data: all = [], isLoading } = useQuery({
    queryKey: ["questions"],
    queryFn: getQuestions,
    enabled: open,
  });

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedAt = useRef<number>(Date.now());

  const session = useMemo(
    () => (open ? pickQuestions(all, topicIds, subjectIds, limit) : []),
    [open, all, topicIds, subjectIds, limit],
  );

  useEffect(() => {
    if (open) {
      setIndex(0);
      setSelected(null);
      setAnswered(false);
      setCorrectCount(0);
      setError(null);
      startedAt.current = Date.now();
    }
  }, [open]);

  const question = session[index];
  const finished = !isLoading && session.length > 0 && index >= session.length;

  async function confirm() {
    if (question == null || selected == null || answered) return;
    setSaving(true);
    setError(null);
    try {
      const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const { isCorrect } = await answerQuestion(question, selected, seconds);
      if (isCorrect) setCorrectCount((c) => c + 1);
      setAnswered(true);
      await queryClient.invalidateQueries({ queryKey: ["question-attempts"] });
      await queryClient.invalidateQueries({ queryKey: ["topics"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível registrar a resposta.");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    const isLast = index + 1 >= session.length;
    setIndex(index + 1);
    setSelected(null);
    setAnswered(false);
    startedAt.current = Date.now();
    if (isLast) onFinished?.({ total: session.length, correct: correctCount });
  }

  const options = (question?.options ?? []) as unknown as string[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {session.length > 0 && !finished
              ? `Questão ${index + 1} de ${session.length} · ${correctCount} acerto(s)`
              : "Sessão baseada nos seus temas prioritários."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando questões...</p>
        ) : session.length === 0 ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            Você ainda não tem questões cadastradas. Adicione ou importe provas anteriores em
            “Questões” para praticar aqui.
          </p>
        ) : finished ? (
          <div className="space-y-4">
            <p className="font-display text-2xl">
              {correctCount} de {session.length} corretas
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Os acertos e erros já foram registrados e ajustaram o domínio dos temas envolvidos.
            </p>
            <Button onClick={() => onOpenChange(false)}>Fechar</Button>
          </div>
        ) : question ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed">{question.statement}</p>
            <ul className="space-y-2">
              {options.map((opt, i) => {
                const isCorrect = i === question.correct_index;
                const isPicked = i === selected;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      disabled={answered || saving}
                      onClick={() => setSelected(i)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-md border border-border p-3 text-left text-sm transition-colors",
                        isPicked && !answered && "border-primary bg-primary/5",
                        answered && isCorrect && "border-primary bg-primary/10",
                        answered && isPicked && !isCorrect && "border-destructive bg-destructive/10",
                      )}
                    >
                      <span className="font-medium tabular-nums text-muted-foreground">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {answered && isCorrect && <Check className="h-4 w-4 text-primary" />}
                      {answered && isPicked && !isCorrect && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            {answered && question.explanation && (
              <p className="rounded-md bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                {question.explanation}
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              {!answered ? (
                <Button onClick={confirm} disabled={selected == null || saving}>
                  {saving ? "Registrando..." : "Responder"}
                </Button>
              ) : (
                <Button onClick={next}>
                  {index + 1 >= session.length ? "Ver resultado" : "Próxima"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
