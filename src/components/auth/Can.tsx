import { PermissionKey } from "@/constants/permissions.enum";
import { usePermissions } from "@/hooks/business/usePermissions";

interface CanProps {
    I: PermissionKey;
    children: React.ReactNode;
}

/**
 * Helper Component para ocultar botões e áreas da UI que o usuário não tem permissão.
 * @example
 * <Can I="usuarios:deletar">
 *   <button>Deletar</button>
 * </Can>
 */
export function Can({ I, children }: CanProps) {
    const { can, isLoading } = usePermissions();

    if (isLoading) return null;
    if (!can(I)) return null;

    return <>{children}</>;
}
