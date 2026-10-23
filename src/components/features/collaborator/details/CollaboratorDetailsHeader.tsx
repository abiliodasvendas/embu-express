import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS } from "@/constants/roles";
import { cn } from "@/lib/utils";
import { ActionItem } from "@/types/actions";
import { BloqueiosColaboradorResultado, Usuario } from "@/types/database";
import {
  AlertTriangle,
  Briefcase,
  Edit2,
  Lock,
  MoreVertical,
  Package,
  ShieldAlert,
  Store,
  User,
} from "lucide-react";

interface CollaboratorDetailsHeaderProps {
  collaborator: Usuario;
  roleName?: string;
  possuiItens: boolean;
  bloqueioData?: BloqueiosColaboradorResultado | null;
  editAction?: ActionItem;
  statusAction?: ActionItem;
  resetAction?: ActionItem;
  deleteAction?: ActionItem;
  onOpenGerenciarConvenios: () => void;
}

export function CollaboratorDetailsHeader({
  collaborator,
  roleName,
  possuiItens,
  bloqueioData,
  editAction,
  statusAction,
  resetAction,
  deleteAction,
  onOpenGerenciarConvenios,
}: CollaboratorDetailsHeaderProps) {
  const auditoriaBloqueioText = (() => {
    if (!bloqueioData?.bloqueios || bloqueioData.bloqueios.length === 0) return undefined;
    const b = bloqueioData.bloqueios[0];
    const autor = b.criado_por_usuario?.nome_completo;
    const dataFormatada = new Date(b.criado_em).toLocaleDateString("pt-BR");
    return autor
      ? `Restrição aplicada por ${autor} em ${dataFormatada}`
      : `Restrição aplicada em ${dataFormatada}`;
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case STATUS.ATIVO:
        return "bg-green-100 text-green-700 border-green-200";
      case STATUS.INATIVO:
        return "bg-red-100 text-red-700 border-red-200";
      case STATUS.PENDENTE:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-600 border-border";
    }
  };

  const getAvatarStatusColor = (status: string) => {
    switch (status) {
      case STATUS.ATIVO:
        return "border-green-200 text-green-700";
      case STATUS.INATIVO:
        return "border-red-200 text-red-700";
      case STATUS.PENDENTE:
        return "border-yellow-200 text-yellow-700";
      default:
        return "border-border text-gray-600";
    }
  };

  const isDesligarAction = statusAction?.label === "Desligar";

  return (
    <Card className="border border-border shadow-xs rounded-[24px] overflow-hidden bg-card mb-2 print:hidden">
      <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="relative shrink-0 select-none">
            <div
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-[18px] bg-muted/60 border flex items-center justify-center transition-all duration-300",
                getAvatarStatusColor(collaborator.status)
              )}
            >
              <User className="h-8 w-8 sm:h-10 sm:w-10 text-current" />
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "absolute -top-1.5 -right-1.5 px-2.5 py-0.5 rounded-[18px] font-bold border text-[10px] uppercase tracking-wider shadow-xs transition-all duration-300 cursor-default",
                getStatusColor(collaborator.status)
              )}
            >
              {collaborator.status}
            </Badge>
          </div>
          <div className="text-center sm:text-left space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {collaborator.nome_completo}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {roleName && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground border-border px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none"
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span>{roleName}</span>
                </Badge>
              )}

              {possuiItens &&
                (collaborator.status !== STATUS.INATIVO ? (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-foreground border-border px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none"
                  >
                    <Package className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span>Possui Itens</span>
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-destructive" />
                    <span>Pendência: Devolver Itens</span>
                  </Badge>
                ))}

              {bloqueioData?.bloqueio_geral ? (
                <Badge
                  variant="secondary"
                  className="bg-destructive/10 text-destructive border-destructive/20 px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none cursor-help"
                  title={auditoriaBloqueioText}
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-destructive" />
                  <span>Todos Convênios Bloqueados</span>
                </Badge>
              ) : (bloqueioData?.convenios_bloqueados_ids?.length ?? 0) > 0 ? (
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground border-border px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none cursor-help"
                  title={auditoriaBloqueioText}
                >
                  <Store className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    Convênio Bloqueio Parcial ({bloqueioData?.convenios_bloqueados_ids?.length})
                  </span>
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-muted text-foreground border-border px-3 py-1 rounded-[18px] font-medium text-xs flex items-center gap-1.5 shadow-none"
                >
                  <Store className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                  <span>Todos Convênios Liberados</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
          {editAction && (
            <Button
              variant="outline"
              onClick={editAction.onClick}
              className="h-10 rounded-[18px] border-border text-foreground hover:bg-muted/50 font-medium text-xs sm:text-sm shadow-xs gap-1.5 px-4"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
              <span>Editar</span>
            </Button>
          )}

          {statusAction && (
            <Button
              variant="outline"
              onClick={statusAction.onClick}
              className={cn(
                "h-10 rounded-[18px] border-border font-medium text-xs sm:text-sm shadow-xs gap-1.5 px-4 transition-colors",
                isDesligarAction
                  ? "text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                  : "text-foreground hover:bg-muted/50"
              )}
            >
              {statusAction.icon}
              <span>{statusAction.label}</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onOpenGerenciarConvenios}
            className="h-10 rounded-[18px] border-border text-foreground hover:bg-muted/50 font-medium text-xs sm:text-sm shadow-xs gap-1.5 px-4"
          >
            <Store className="h-4 w-4 text-muted-foreground" />
            <span>Convênios</span>
          </Button>

          {resetAction && (
            <Button
              variant="outline"
              onClick={resetAction.onClick}
              className="h-10 rounded-[18px] border-border text-foreground hover:bg-muted/50 font-medium text-xs sm:text-sm shadow-xs gap-1.5 px-4"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span>Resetar Senha</span>
            </Button>
          )}

          {deleteAction && (
            <ActionsDropdown actions={[deleteAction]}>
              <Button
                variant="outline"
                className="h-10 w-10 rounded-[18px] border-border text-foreground hover:bg-muted/50 flex items-center justify-center shadow-xs p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </ActionsDropdown>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
