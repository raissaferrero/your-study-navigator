CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  area text NOT NULL DEFAULT '',
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  exam_id uuid REFERENCES public.target_exams(id) ON DELETE SET NULL,
  source text,
  year integer,
  institution text,
  statement text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_index integer NOT NULL DEFAULT 0,
  explanation text,
  difficulty smallint NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own questions" ON public.questions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  selected_index integer NOT NULL,
  is_correct boolean NOT NULL,
  seconds integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.question_attempts TO authenticated;
GRANT ALL ON public.question_attempts TO service_role;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own attempts" ON public.question_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX questions_user_area_idx ON public.questions (user_id, area);
CREATE INDEX question_attempts_user_idx ON public.question_attempts (user_id, question_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();