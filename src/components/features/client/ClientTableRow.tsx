import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { TableCell, TableRow } from "@/components/ui/table";
import { useClientActions } from "@/hooks/business/useClientActions";
import { formatCurrency } from "@/utils/formatters/currency";
import type { Client } from "@/types/database";
import { getAvatarStyles } from "./clientUtils";

interface ClientTableRowProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  podeVerValores: boolean;
  empresaNome: string | null;
}

export function ClientTableRow({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
  podeVerValores,
  empresaNome,
}: ClientTableRowProps) {
  const actions = useClientActions({ client, onEdit, onDelete, onToggleStatus });

  return (
    <TableRow
      onClick={() => {
        const viewAction = actions.find((a) => a.label === "Ver Detalhes");
        if (viewAction && viewAction.onClick) {
          viewAction.onClick();
        }
      }}
      className="cursor-pointer hover:bg-muted/40 transition-colors"
    >
      <TableCell className="py-3.5 pl-6 align-middle">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-[14px] flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarStyles(
              client.ativo
            )}`}
          >
            {client.nome_fantasia.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight hover:underline">
              {client.nome_fantasia}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-6 py-3.5 align-middle">
        {empresaNome ? (
          <span className="text-[11px] font-medium text-foreground bg-surface-alt px-2.5 py-0.5 rounded-[8px] border border-border">
            {empresaNome}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground/60">-</span>
        )}
      </TableCell>
      {podeVerValores && (
        <TableCell className="px-6 py-3.5 align-middle text-right">
          <span className="font-semibold text-foreground text-xs">
            {formatCurrency(client.valor_contrato_mensal || client.valor_base || 0)}
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {client.periodicidade === "QUINZENAL"
              ? "Quinzenal"
              : client.periodicidade === "SEMANAL"
              ? "Semanal"
              : "Mensal"}
          </span>
        </TableCell>
      )}
      <TableCell className="px-6 py-3.5 align-middle">
        <StatusBadge status={client.ativo} />
      </TableCell>
      <TableCell
        className="px-6 py-3.5 text-right align-middle"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionsDropdown actions={actions} title={client.nome_fantasia} />
      </TableCell>
    </TableRow>
  );
}
