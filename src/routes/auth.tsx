import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar na NEXO" },
      { name: "description", content: "Acesse sua conta NEXO e continue sua preparação." },
      { property: "og:title", content: "Entrar na NEXO" },
      { property: "og:description", content: "Acesse sua conta NEXO e continue sua preparação." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "recover";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/meu-dia" });
        return;
      }
      if (mode === "signup") {
        if (name.trim().length < 2) throw new Error("Informe seu nome.");
        if (password.length < 6) throw new Error("A senha precisa ter ao menos 6 caracteres.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Confirme seu e-mail para ativar a conta.");
          setMode("login");
          return;
        }
        navigate({ to: "/onboarding" });
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Se este e-mail estiver cadastrado, enviamos um link de recuperação.");
      setMode("login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-2xl tracking-tight">
          NEXO
        </Link>
        <h1 className="mt-10 font-display text-3xl">
          {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "recover"
            ? "Enviaremos um link para você definir uma nova senha."
            : "Sua preparação, organizada em um lugar só."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
            />
          </div>
          {mode !== "recover" && (
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              <button className="hover:text-foreground" onClick={() => setMode("signup")}>
                Não tenho conta — criar cadastro
              </button>
              <br />
              <button className="hover:text-foreground" onClick={() => setMode("recover")}>
                Esqueci minha senha
              </button>
            </>
          )}
          {mode !== "login" && (
            <button className="hover:text-foreground" onClick={() => setMode("login")}>
              Voltar para o login
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
