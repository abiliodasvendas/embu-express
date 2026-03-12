import { PermissionKey } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";

interface RequirePermissionProps {
    permissions?: PermissionKey[];
    requireAdminPanel?: boolean;
    requireOperational?: boolean;
    useOrCondition?: boolean;
}

export function RequirePermission({ permissions, requireAdminPanel, requireOperational, useOrCondition = false }: RequirePermissionProps) {
    const { roleName, isLoading, canViewAdminPanel, canOperate, can } = usePermissions();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Se nao tem role (nao logado ou erro), manda pro login
    if (!roleName) {
        return <Navigate to={ROUTES.PUBLIC.LOGIN} replace />;
    }

    let hasAccess = true;

    if (requireAdminPanel && !canViewAdminPanel) hasAccess = false;

    // Substituindo o legado pela Permissão exata de Registrar Ponto
    if (requireOperational && !canOperate) hasAccess = false;

    if (permissions && permissions.length > 0) {
        if (useOrCondition) {
            const hasAny = permissions.some(p => can(p));
            if (!hasAny) hasAccess = false;
        } else {
            const hasAll = permissions.every(p => can(p));
            if (!hasAll) hasAccess = false;
        }
    }

    if (!hasAccess) {
        // Redirecionamento inteligente
        if (canViewAdminPanel) return <Navigate to={ROUTES.PRIVATE.CONTROLE_PONTO} replace />;
        return <Navigate to={ROUTES.PRIVATE.REGISTRAR_PONTO} replace />;
    }

    return <Outlet />;
}
