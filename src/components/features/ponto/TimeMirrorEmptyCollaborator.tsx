import { Calendar } from "lucide-react";
import { getMessage } from "@/constants/messages";

export function TimeMirrorEmptyCollaborator() {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-[16px] bg-muted/70 border border-border flex items-center justify-center text-foreground">
        <Calendar className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-semibold text-sm text-foreground">
          {getMessage("ponto.labels.nenhumColaborador")}
        </h3>
        <p className="text-xs text-muted-foreground max-w-[280px] mt-1">
          {getMessage("ponto.labels.escolhaColaborador")}
        </p>
      </div>
    </div>
  );
}
