import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortalHeaderProps {
  nome: string;
  ativo: boolean;
}

export function PortalHeader({ nome, ativo }: PortalHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Wrench className="w-5 h-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block truncate">
              Portal do Conveniado
            </span>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate">
              {nome}
            </h1>
          </div>
        </div>

        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-bold rounded-[14px] px-2.5 py-0.5 uppercase tracking-wider shrink-0",
            ativo
              ? "bg-muted text-foreground border border-border"
              : "bg-destructive/10 text-destructive border-destructive/20"
          )}
        >
          {ativo ? "Ativo" : "Desativado"}
        </Badge>
      </div>
    </header>
  );
}
