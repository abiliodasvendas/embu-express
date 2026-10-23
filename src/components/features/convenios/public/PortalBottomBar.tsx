import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PortalBottomBarProps {
  onNewLancamento: () => void;
}

export function PortalBottomBar({ onNewLancamento }: PortalBottomBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 sm:p-4 z-30">
      <div className="max-w-2xl mx-auto flex items-center justify-center">
        <Button
          onClick={onNewLancamento}
          className="w-full sm:w-auto sm:min-w-[280px] h-12 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="h-5 w-5" />
          Registrar Manutenção
        </Button>
      </div>
    </div>
  );
}
