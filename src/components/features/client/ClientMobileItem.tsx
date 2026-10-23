import { useState } from "react";
import { ActionSheet } from "@/components/common/ActionSheet";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useClientActions } from "@/hooks/business/useClientActions";
import { formatCurrency } from "@/utils/formatters/currency";
import type { Client } from "@/types/database";
import { getAvatarStyles } from "./clientUtils";

interface ClientMobileItemProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onToggleStatus: (client: Client) => void;
  podeVerValores: boolean;
  empresaNome: string | null;
}

export function ClientMobileItem({
  client,
  onEdit,
  onDelete,
  onToggleStatus,
  podeVerValores,
  empresaNome,
}: ClientMobileItemProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const actions = useClientActions({ client, onEdit, onDelete, onToggleStatus });

  return (
    <>
      <div
        onClick={() => setIsSheetOpen(true)}
        className="bg-card rounded-[20px] shadow-xs border border-border p-4 active:scale-[0.99] transition-all cursor-pointer space-y-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarStyles(
                client.ativo
              )}`}
            >
              {client.nome_fantasia.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground text-sm leading-tight truncate">
                {client.nome_fantasia}
              </h3>
              {empresaNome && (
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                  {empresaNome}
                </p>
              )}
              {podeVerValores && (
                <p className="text-xs font-bold text-foreground mt-1">
                  {formatCurrency(client.valor_contrato_mensal || client.valor_base || 0)}
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">
                    ({client.periodicidade === "QUINZENAL" ? "Quinzenal" : client.periodicidade === "SEMANAL" ? "Semanal" : "Mensal"})
                  </span>
                </p>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <StatusBadge status={client.ativo} />
          </div>
        </div>
      </div>

      <ActionSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title={client.nome_fantasia}
        description={client.ativo ? "Cliente Ativo" : "Cliente Inativo"}
        actions={actions.map((action) => ({
          label: action.label,
          title: action.title,
          description: action.description,
          icon: action.icon,
          onClick: action.onClick,
          disabled: action.disabled,
          isLoading: action.isLoading,
          isLink: action.isLink,
          href: action.href,
          isDestructive: action.isDestructive || action.variant === "destructive",
          hasSeparatorAfter: action.hasSeparatorAfter,
        }))}
      />
    </>
  );
}
