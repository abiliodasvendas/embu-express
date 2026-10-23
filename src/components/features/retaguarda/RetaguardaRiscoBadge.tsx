import { Badge } from "@/components/ui/badge";

export type NivelRisco =
  | "NORMAL"
  | "RISCO_MEDIO"
  | "RISCO_ALTO"
  | "TRATADO_SEGURO"
  | "AJUSTADO_MARGEM_CRITICA";

interface RetaguardaRiscoBadgeProps {
  nivel: NivelRisco;
}

export function RetaguardaRiscoBadge({ nivel }: RetaguardaRiscoBadgeProps) {
  switch (nivel) {
    case "TRATADO_SEGURO":
      return (
        <Badge
          variant="outline"
          className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
        >
          Tratado / Margem Segura
        </Badge>
      );
    case "AJUSTADO_MARGEM_CRITICA":
      return (
        <Badge
          variant="outline"
          className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
        >
          Ajustado / Margem Crítica
        </Badge>
      );
    case "RISCO_ALTO":
      return (
        <Badge
          variant="outline"
          className="bg-destructive/10 text-destructive border-destructive/20 font-medium text-[10px] px-2 py-0.5 rounded-lg"
        >
          Risco Alto (Negativo)
        </Badge>
      );
    case "RISCO_MEDIO":
      return (
        <Badge
          variant="outline"
          className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
        >
          Risco Médio (&lt; R$ 300)
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-muted/40 text-muted-foreground border-border text-[10px] font-medium px-2 py-0.5 rounded-lg"
        >
          Margem Normal
        </Badge>
      );
  }
}
