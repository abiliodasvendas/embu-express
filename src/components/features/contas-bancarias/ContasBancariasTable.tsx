import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ContaBancariaComSaldo } from "@/types/database";
import { Landmark } from "lucide-react";
import { ContasBancariasTableRow } from "./ContasBancariasTableRow";

interface ContasBancariasTableProps {
  contas: ContaBancariaComSaldo[];
  onExcluir: (conta: ContaBancariaComSaldo) => void;
  onNovaConta?: () => void;
  isDeleting?: boolean;
  canEdit?: boolean;
}

export function ContasBancariasTable({
  contas,
  onExcluir,
  onNovaConta,
  isDeleting = false,
  canEdit = true,
}: ContasBancariasTableProps) {
  if (contas.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-card p-8 shadow-xs">
        <UnifiedEmptyState
          icon={Landmark}
          title="Nenhuma conta bancária encontrada"
          description="Nenhuma conta bancária cadastrada ou correspondente aos filtros selecionados."
          action={
            canEdit && onNovaConta
              ? { label: "Nova Conta Bancária", onClick: onNovaConta }
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface-alt/60">
            <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
              <th className="py-3 px-4">Instituição / Conta</th>
              <th className="py-3 px-4">Empresa</th>
              <th className="py-3 px-4 w-[110px]">Tipo</th>
              <th className="py-3 px-4 w-[140px] text-right">Entradas (Real / Prev)</th>
              <th className="py-3 px-4 w-[140px] text-right">Saídas (Real / Prev)</th>
              <th className="py-3 px-4 w-[140px] text-right">Saldo Atual (Realizado)</th>
              <th className="py-3 px-4 w-[130px] text-right">Saldo Projetado</th>
              <th className="py-3 px-4 w-[70px] text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {contas.map((conta) => (
              <ContasBancariasTableRow
                key={conta.id}
                conta={conta}
                onExcluir={onExcluir}
                isDeleting={isDeleting}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
