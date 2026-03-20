import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { useLayout } from "@/contexts/LayoutContext";
import { useUnidades } from "@/hooks/api/useUnidades";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function UnitDetails() {
    const { id, unitId } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useLayout();
    
    // In the future, we will have a useUnidade(unitId) hook
    const { data: unidades } = useUnidades(Number(id));
    const unidade = unidades?.find(u => u.id.toString() === unitId);

    useEffect(() => {
        if (unidade) {
            setPageTitle(`${unidade.nome_unidade}`);
        }
    }, [unidade, setPageTitle]);

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-4">
                <Breadcrumbs 
                    items={[
                        { label: "Clientes", href: "/clientes" },
                        { label: unidade?.cliente_id ? unidade.cliente?.nome_fantasia : "Carregando...", href: `/clientes/${id}` },
                        { label: unidade?.nome_unidade || "Detalhes da Unidade" }
                    ]} 
                />
            </div>

            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <h2 className="text-2xl font-bold text-gray-400">Em breve: Detalhes da Unidade</h2>
                <p className="text-gray-400 mt-2">Esta tela está sendo preparada para gerenciar escalas, pontos e colaboradores desta unidade específica.</p>
            </div>
        </div>
    );
}
