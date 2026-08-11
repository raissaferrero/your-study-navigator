import { Construction } from "lucide-react";

export function EmBreve({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-16">
      <p className="label-caps">Próximas fases</p>
      <h1 className="mt-2 font-display text-4xl tracking-tight">{title}</h1>
      <div className="panel mt-6 flex gap-3 p-5">
        <Construction className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
