import { BaseDialog } from "@/components/ui/BaseDialog";
import { ROUTES } from "@/constants/routes";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { Usuario } from "@/types/database";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SuccessRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborator: Usuario;
  title?: string;
  description?: React.ReactNode;
  onOpenCollaboratorForm: () => void;
  hideNewCollaboratorButton?: boolean;
  hideTurnButton?: boolean;
}

export function SuccessRegistrationDialog({
  open,
  onOpenChange,
  collaborator,
  title = "Cadastro Realizado!",
  description,
  onOpenCollaboratorForm,
  hideNewCollaboratorButton = false,
  hideTurnButton = false,
}: SuccessRegistrationDialogProps) {
  const navigate = useNavigate();

  const handleNewCollaborator = () => {
    safeCloseDialog(() => {
      onOpenChange(false);
      setTimeout(() => {
        onOpenCollaboratorForm();
      }, 100);
    });
  };

  const handleAddTurn = () => {
    safeCloseDialog(() => {
      onOpenChange(false);
      navigate(`${ROUTES.PRIVATE.COLABORADORES}/${collaborator.id}?openTurnDialog=true`);
    });
  };

  const hasButtons = !hideNewCollaboratorButton || !hideTurnButton;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="sm"
      description="Confirmação de cadastro realizado"
    >
      <BaseDialog.Body className="p-6 pt-7 text-center flex flex-col items-center space-y-4">
        <div className="w-14 h-14 rounded-[18px] flex items-center justify-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5 px-2">
          <h3 className="text-base font-bold text-foreground leading-tight tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description || (
              <>
                O colaborador{" "}
                <span className="text-foreground font-bold">
                  {collaborator.nome_completo}
                </span>{" "}
                foi cadastrado com sucesso no sistema.
              </>
            )}
          </p>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {!hideNewCollaboratorButton && (
          <BaseDialog.Action
            label="Novo Cadastro"
            variant="secondary"
            onClick={handleNewCollaborator}
            type="button"
          />
        )}
        {!hideTurnButton && (
          <BaseDialog.Action
            label="Vincular Turno"
            variant="primary"
            onClick={handleAddTurn}
            type="button"
          />
        )}
        {!hasButtons && (
          <BaseDialog.Action
            label="Fechar"
            variant="secondary"
            onClick={() => safeCloseDialog(() => onOpenChange(false))}
            type="button"
          />
        )}
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
