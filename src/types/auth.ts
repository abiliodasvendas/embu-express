export type UserRole = 'admin' | 'super_admin' | 'motoboy' | 'financeiro';

export const ROLES = {
    ADMIN: 'admin' as UserRole,
    SUPER_ADMIN: 'super_admin' as UserRole,
    MOTOBOY: 'motoboy' as UserRole,
    FINANCEIRO: 'financeiro' as UserRole,
} as const;

export const ADMIN_ROLES: UserRole[] = [ROLES.ADMIN, ROLES.SUPER_ADMIN];
export const OPERATIONAL_ROLES: UserRole[] = [ROLES.MOTOBOY];
