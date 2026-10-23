import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface ClientNotFoundProps {
  onBack: () => void;
}

export function ClientNotFound({ onBack }: ClientNotFoundProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="h-16 w-16 rounded-[18px] bg-muted/70 text-destructive border border-border flex items-center justify-center">
        <XCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-foreground">
        Cliente não encontrado
      </h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        O cliente solicitado pode ter sido removido ou o ID está incorreto.
      </p>
      <Button
        onClick={onBack}
        className="rounded-[18px] h-11 px-6 bg-primary text-primary-foreground hover:bg-primary-hover shadow-xs"
      >
        Voltar para a lista
      </Button>
    </div>
  );
}
