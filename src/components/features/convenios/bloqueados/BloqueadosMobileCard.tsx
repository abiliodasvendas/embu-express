import { ExternalLink, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ColabBloqueioItem } from "@/hooks/ui/convenios/useConveniosBloqueadosViewModel";

interface BloqueadosMobileCardProps {
  item: ColabBloqueioItem;
  onNavigateToColaborador: (id: string) => void;
  onAjustar: (id: string, nome: string) => void;
}

export function BloqueadosMobileCard({
  item,
  onNavigateToColaborador,
  onAjustar,
}: BloqueadosMobileCardProps) {
  return (
    <div className="bg-card rounded-[24px] p-4 border border-border shadow-xs space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-bold text-foreground text-sm">{item.nome_completo}</p>
          <button
            onClick={() => onNavigateToColaborador(item.colaborador_id)}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 inline-flex items-center"
            title="Ver colaborador"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        {item.bloqueio_geral ? (
          <Badge
            variant="secondary"
            className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-bold rounded-[18px]"
          >
            Bloqueio Geral
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-muted text-foreground border-border text-[10px] font-bold rounded-[18px]"
          >
            {item.convenios_especificos.length}{" "}
            {item.convenios_especificos.length === 1 ? "restrição" : "restrições"}
          </Badge>
        )}
      </div>

      {!item.bloqueio_geral && item.convenios_especificos.length > 0 && (
        <div className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-[14px] space-y-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase block">
            Restrições Específicas:
          </span>
          <p className="font-medium text-foreground">
            {item.convenios_especificos.map((c) => c.nome).join(", ")}
          </p>
        </div>
      )}

      {item.motivo && (
        <p className="text-xs text-muted-foreground italic bg-muted/30 p-2.5 rounded-[12px] border border-border">
          &ldquo;{item.motivo}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
        <div>
          <span>{new Date(item.criado_em).toLocaleDateString("pt-BR")}</span>
          {item.criado_por_nome && (
            <span className="block text-[11px] text-muted-foreground/80">
              por {item.criado_por_nome}
            </span>
          )}
        </div>
        <Button
          size="sm"
          className="rounded-[14px] text-xs h-9 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs"
          onClick={() => onAjustar(item.colaborador_id, item.nome_completo)}
        >
          <Settings2 className="w-3.5 h-3.5 mr-1" />
          Ajustar
        </Button>
      </div>
    </div>
  );
}
