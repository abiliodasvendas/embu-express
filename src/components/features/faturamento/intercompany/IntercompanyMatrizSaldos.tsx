import { Building2, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";

interface MatrizSaldoItem {
  empresa_devedora?: {
    id?: number;
    nome_fantasia?: string | null;
  } | null;
  empresa_credora?: {
    id?: number;
    nome_fantasia?: string | null;
  } | null;
  saldo_devedor_liquido: number;
}

interface IntercompanyMatrizSaldosProps {
  matrizSaldos: MatrizSaldoItem[];
  isLoading: boolean;
}

export function IntercompanyMatrizSaldos({
  matrizSaldos,
  isLoading,
}: IntercompanyMatrizSaldosProps) {
  return (
    <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-5 md:p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight">
            Acerto Entre Nossas Empresas (Matriz de Saldos)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dinheiro que um CNPJ recebeu no lugar do outro entre as empresas do grupo Embu Express.
          </p>
        </div>
      </div>

      <div>
        {isLoading ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            Calculando saldos da matriz...
          </p>
        ) : matrizSaldos.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 text-foreground mx-auto mb-2" />
            Todos os saldos entre as empresas estão compensados e equilibrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {matrizSaldos.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[16px] border border-border bg-muted/30 p-4 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {item.empresa_devedora?.nome_fantasia}
                  </span>
                  <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {item.empresa_credora?.nome_fantasia}
                  </span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between items-baseline">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase">
                    A Repassar:
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {formatCurrency(item.saldo_devedor_liquido)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
