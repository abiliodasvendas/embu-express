import { OccurrenceView } from "@/components/features/ocorrencias/OccurrenceView";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { Plus, Settings } from "lucide-react";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { PERMISSIONS } from "@/constants/permissions.enum";

export function Occurrences() {
    const {
        setPageTitle,
        openOccurrenceFormDialog,
        openOccurrenceTypesDialog
    } = useLayout();
    
    useEffect(() => {
        setPageTitle("Ocorrências");
    }, [setPageTitle]);

    return (
        <div className="space-y-6 pb-24">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        Ocorrências
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => openOccurrenceTypesDialog()}
                            variant="outline"
                            className="h-11 rounded-xl gap-2 shadow-sm border-gray-200 bg-white transition-all active:scale-95 whitespace-nowrap text-gray-700"
                            size="sm"
                        >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Gerenciar Tipos</span>
                        </Button>
                        <Button
                            onClick={() => openOccurrenceFormDialog({})}
                            className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap"
                            size="sm"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Registrar Ocorrência</span>
                        </Button>
                    </div>
                </div>
            </div>

            <OccurrenceView />
        </div>
    );
}

export default Occurrences;

