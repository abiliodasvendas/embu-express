import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Convenio } from "@/types/database";
import {
  ChevronLeft,
  Copy,
  CopyCheck,
  Edit2,
  ExternalLink,
  Handshake,
  Power,
} from "lucide-react";

interface ConvenioDetailsHeaderProps {
  convenio: Convenio;
  canEdit: boolean;
  isCopied: boolean;
  onCopyLink: () => void;
  onOpenLink: () => void;
  onBack: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}

export function ConvenioDetailsHeader({
  convenio,
  canEdit,
  isCopied,
  onCopyLink,
  onOpenLink,
  onBack,
  onEdit,
  onToggleStatus,
}: ConvenioDetailsHeaderProps) {
  const publicUrl = `${window.location.origin}/public/co/${convenio.token}`;
  const displayUrl = `${window.location.origin.replace(/^https?:\/\//, "")}/public/co/${convenio.token}`;

  return (
    <div className="rounded-[24px] border border-border bg-card shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] bg-muted/70 border border-border flex items-center justify-center shrink-0">
          <Handshake className="h-7 w-7 text-foreground" />
        </div>
        <div className="text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {convenio.nome}
            </h1>
            <StatusBadge status={convenio.ativo} />
          </div>

          {convenio.token && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
              <div className="bg-muted/40 border border-border px-3 py-1.5 rounded-[12px] flex items-center gap-2 text-xs font-mono text-muted-foreground shadow-2xs max-w-full">
                <span className="truncate max-w-[150px] sm:max-w-[250px] text-foreground">
                  {displayUrl}
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer"
                  onClick={onOpenLink}
                  title="Abrir link público"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={onCopyLink}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] font-semibold text-xs transition-all select-none border shadow-2xs h-8 cursor-pointer",
                  isCopied
                    ? "bg-muted text-foreground border-border"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {isCopied ? (
                  <>
                    <CopyCheck className="h-3.5 w-3.5 text-foreground animate-in zoom-in-50 duration-200" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
        <Button
          variant="outline"
          onClick={onBack}
          className="rounded-[14px] flex items-center gap-1.5 px-4 border-border text-foreground hover:bg-muted font-medium text-xs sm:text-sm h-10 shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>

        {canEdit && (
          <>
            <Button
              onClick={onEdit}
              className="rounded-[14px] flex items-center gap-1.5 px-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm h-10 shadow-xs"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </Button>

            <Button
              variant="outline"
              onClick={onToggleStatus}
              className="rounded-[14px] flex items-center gap-1.5 px-4 border-border text-foreground hover:bg-muted font-medium text-xs sm:text-sm h-10 shadow-xs"
            >
              <Power className="h-4 w-4" />
              <span>{convenio.ativo ? "Desativar" : "Ativar"}</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
