import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { Client } from "@/types/database";

interface ClientContractCardProps {
  client: Client;
}

export function ClientContractCard({ client }: ClientContractCardProps) {
  const totalUnidades = client.unidades?.length || 0;
  const unidadesAtivas = client.unidades?.filter((u) => u.ativo).length || 0;

  return (
    <Card className="rounded-[18px] border border-border bg-card shadow-xs">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-[18px] bg-muted/70 border border-border flex items-center justify-center mb-4">
          <Building2 className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground mb-1">
          {client.nome_fantasia}
        </h2>
        <div className="w-full space-y-3 pt-5 border-t border-border mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desde</span>
            <span className="font-medium text-foreground">
              {client.created_at
                ? new Date(client.created_at).toLocaleDateString("pt-BR")
                : "—"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unidades Cadastradas</span>
            <span className="font-semibold text-foreground">
              {totalUnidades} {totalUnidades === 1 ? "unidade" : "unidades"} ({unidadesAtivas} ativas)
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor Total Contratado</span>
            <span className="font-bold text-foreground">
              {formatCurrency(client.valor_total_contrato || 0)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                / mês
              </span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50 text-left">
            Vencimentos, valores e periodicidades são configurados individualmente por unidade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
