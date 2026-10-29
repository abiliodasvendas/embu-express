import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import {
  PERIODICIDADE_FATURAMENTO,
  getPeriodicidadeLabel,
} from "@/constants/financeiro.constants";
import { Client } from "@/types/database";

interface ClientContractCardProps {
  client: Client;
}

export function ClientContractCard({ client }: ClientContractCardProps) {
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
            <span className="text-muted-foreground">Periodicidade</span>
            <span className="font-semibold text-foreground">
              {getPeriodicidadeLabel(client.periodicidade)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vencimento Padrão</span>
            <span className="font-semibold text-foreground">
              {client.periodicidade === PERIODICIDADE_FATURAMENTO.SEMANAL
                ? "Terça-feira subsequente"
                : client.periodicidade === PERIODICIDADE_FATURAMENTO.QUINZENAL
                ? "Dias 16 e Fim do Mês"
                : `Dia ${client.dia_vencimento_padrao || 10}`}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valor do Contrato</span>
            <span className="font-bold text-foreground">
              {formatCurrency(client.valor_contrato_mensal || client.valor_base || 0)}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                {client.periodicidade === PERIODICIDADE_FATURAMENTO.SEMANAL ? "/ semana" : "/ mês"}
              </span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
