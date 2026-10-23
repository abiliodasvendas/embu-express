import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Building2, ChevronLeft, Edit2, Zap, MoreVertical, Users } from "lucide-react";
import { cnpjMask } from "@/utils/masks";
import { Client, Unidade } from "@/types/database";
import type { ActionItem } from "@/types/actions";

interface ClientDetailsHeaderProps {
  client: Client;
  unidades?: Unidade[];
  totalUnits: number;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  clientActions: ActionItem[];
}

export function ClientDetailsHeader({
  client,
  unidades,
  totalUnits,
  onBack,
  onEdit,
  onToggleStatus,
  clientActions,
}: ClientDetailsHeaderProps) {
  return (
    <Card className="border border-border shadow-xs rounded-[18px] overflow-hidden bg-card">
      <CardContent className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
          <div className="relative shrink-0 select-none">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] bg-muted/70 border border-border text-foreground flex items-center justify-center transition-all">
              <Building2 className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground" />
            </div>
            <div className="absolute -top-1.5 -right-1.5">
              <StatusBadge status={client.ativo} />
            </div>
          </div>
          <div className="text-center sm:text-left space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {client.nome_fantasia}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {unidades?.[0]?.razao_social && (
                <Badge
                  variant="secondary"
                  className="bg-muted/70 text-foreground border border-border px-2.5 py-0.5 rounded-[12px] font-medium text-xs flex items-center gap-1 shadow-none"
                >
                  <Users className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span>{unidades[0].razao_social}</span>
                </Badge>
              )}
              {unidades?.[0]?.cnpj && (
                <Badge
                  variant="secondary"
                  className="bg-muted/70 text-foreground border border-border px-2.5 py-0.5 rounded-[12px] font-medium text-xs shadow-none"
                >
                  CNPJ: {cnpjMask(unidades[0].cnpj)}
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="bg-muted/70 text-foreground border border-border px-2.5 py-0.5 rounded-[12px] font-medium text-xs shadow-none"
              >
                {totalUnits} {totalUnits === 1 ? "Unidade" : "Unidades"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
          <Button
            variant="outline"
            onClick={onBack}
            className="h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-sm shadow-xs gap-1.5 px-4"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Button>

          <Button
            variant="outline"
            onClick={onEdit}
            className="h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-sm shadow-xs gap-1.5 px-4"
          >
            <Edit2 className="h-4 w-4 text-muted-foreground" />
            <span>Editar</span>
          </Button>

          <Button
            variant="outline"
            onClick={onToggleStatus}
            className="h-10 rounded-[14px] border-border text-foreground hover:bg-muted/40 font-medium text-sm shadow-xs gap-1.5 px-4"
          >
            <Zap className="h-4 w-4 text-muted-foreground" />
            <span>{client.ativo ? "Desativar" : "Ativar"}</span>
          </Button>

          <ActionsDropdown actions={clientActions}>
            <Button
              variant="outline"
              className="h-10 w-10 p-0 rounded-[14px] border-border text-foreground hover:bg-muted/40 shadow-xs flex items-center justify-center"
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </ActionsDropdown>
        </div>
      </CardContent>
    </Card>
  );
}
