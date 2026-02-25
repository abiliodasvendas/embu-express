import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle
} from "@/components/ui/dialog";
import { useLayout } from "@/contexts/LayoutContext";
import { Usuario } from "@/types/database";
import { ROUTES } from "@/constants/routes";
import { CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SuccessRegistrationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collaborator: Usuario;
}

export function SuccessRegistrationDialog({
    open,
    onOpenChange,
    collaborator,
}: SuccessRegistrationDialogProps) {
    const navigate = useNavigate();
    const { openCollaboratorFormDialog } = useLayout();

    const handleNewCollaborator = () => {
        onOpenChange(false);
        // Small delay to prevent animation conflicts between dialogs
        setTimeout(() => {
            openCollaboratorFormDialog({ mode: "create" });
        }, 100);
    };

    const handleAddTurn = () => {
        onOpenChange(false);
        navigate(`${ROUTES.PRIVATE.COLABORADORES}/${collaborator.id}?openTurnDialog=true`);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-sm rounded-[2rem] border-0 shadow-2xl p-0 overflow-hidden bg-white gap-0 animate-in fade-in zoom-in-95 duration-200" hideCloseButton>
                <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4 relative">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm transition-all duration-500 animate-in zoom-in spin-in-12">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                            Cadastro Realizado!
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-sm leading-relaxed px-2 font-medium">
                            O colaborador <span className="text-gray-900 font-bold">{collaborator.nome_completo}</span> foi cadastrado com sucesso.
                        </DialogDescription>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50/50 border-t border-gray-50 mt-2">
                    <Button
                        variant="outline"
                        onClick={handleNewCollaborator}
                        className="h-11 rounded-xl border-gray-200 bg-white hover:bg-gray-100 text-gray-600 font-bold transition-all shadow-sm text-[10px] sm:text-xs"
                    >
                        CADASTRAR NOVO
                    </Button>
                    <Button
                        onClick={handleAddTurn}
                        className="h-11 rounded-xl font-bold shadow-lg transition-all text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-[10px] sm:text-xs"
                    >
                        VINCULAR TURNO
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
