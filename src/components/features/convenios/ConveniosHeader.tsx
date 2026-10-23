import { Button } from "@/components/ui/button";
import { Handshake, Plus } from "lucide-react";

interface ConveniosHeaderProps {
  canEdit: boolean;
  onRegister: () => void;
}

export function ConveniosHeader({ canEdit, onRegister }: ConveniosHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Handshake className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Convênios & Despesas Operacionais
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Gerencie parceiros comerciais, auditoria de faturas e bloqueios de acesso
          </p>
        </div>
      </div>

      {canEdit && (
        <Button
          onClick={onRegister}
          className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Novo Convênio</span>
        </Button>
      )}
    </div>
  );
}
