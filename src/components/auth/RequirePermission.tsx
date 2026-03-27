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
    const { roleName, isLoading, canViewAdminPanel, can, isSuperAdmin, isMotoboyOrFiscal } = usePermissions();

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

    // Se exigir operacional, permite Super Admin (pra suporte/testes) ou Perfis de Campo (Motoboy/Fiscal)
    if (requireOperational && !isSuperAdmin && !isMotoboyOrFiscal) {
        hasAccess = false;
    }

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
        if (canViewAdminPanel) {
            return <Navigate to={ROUTES.PRIVATE.CONTROLE_ATIVIDADE_DIARIO} replace />;
        }
        return <Navigate to={ROUTES.PRIVATE.REGISTRAR_ATIVIDADE} replace />;
    }

    return <Outlet />;
}
