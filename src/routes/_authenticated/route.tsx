import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Sun,
  BookOpen,
  PenSquare,
  FlaskConical,
  RefreshCw,
  BarChart3,
  Bot,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/nexo/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

const NAV = [
  { to: "/meu-dia", label: "Meu Dia", icon: Sun },
  { to: "/conteudos", label: "Conteúdos", icon: BookOpen },
  { to: "/questoes", label: "Questões", icon: PenSquare },
  { to: "/simulados", label: "Simulados", icon: FlaskConical },
  { to: "/revisoes", label: "Revisões", icon: RefreshCw },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/tutor", label: "Tutor NEXO", icon: Bot },
] as const;

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({ queryKey: ["profile"], queryFn: getProfile });

  useEffect(() => {
    if (isLoading) return;
    if (profile && !profile.onboarding_completed && pathname !== "/onboarding") {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profile, isLoading, pathname, navigate]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (pathname === "/onboarding") {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2">
          <Link to="/meu-dia" className="font-display text-2xl tracking-tight text-sidebar-foreground">
            NEXO
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-sidebar-border pt-4">
          <div className="px-3 pb-2">
            <p className="label-caps">Conta</p>
            <p className="mt-1 truncate text-sm text-sidebar-foreground">{profile?.name || "—"}</p>
          </div>
          <Link
            to="/configuracoes"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        <header className="flex h-14 items-center gap-3 border-b border-border px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display text-xl">NEXO</span>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
