import { usePermissions } from "@/hooks/business/usePermissions";
import { UserRole } from "@/types/auth";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

interface RequireRoleProps {
    allowedRoles: UserRole[];
}

export function RequireRole({ allowedRoles }: RequireRoleProps) {
    const { roleName, isLoading } = usePermissions();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Se nao tem role (nao logado ou erro), manda pro login
    if (!roleName) {
        return <Navigate to="/login" replace />;
    }

    // Verifica se a role do usuario esta na lista de permitidas
    if (!allowedRoles.includes(roleName as UserRole)) {
        // Redirecionamento inteligente se tentar acessar rota proibida
        // Se for admin tentando acessar painel -> controle-ponto
        // Se for motoboy tentando acessar admin -> painel
        if (roleName === 'motoboy') {
            return <Navigate to="/painel" replace />;
        }
        return <Navigate to="/controle-ponto" replace />;
    }

    return <Outlet />;
}
