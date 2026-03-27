import { ROLES } from "@/constants/permissions.enum";

/**
 * Verifica se um nome de perfil (string) corresponde ao perfil de Motoboy.
 * Centraliza a lógica para evitar o uso de strings mágicas em schemas e componentes.
 */
export function isMotoboy(perfilNome?: string): boolean {
    if (!perfilNome) return false;
    return perfilNome.toLowerCase() === ROLES.MOTOBOY.toLowerCase();
}

/**
 * Verifica se um nome de perfil (string) corresponde ao perfil de Fiscal.
 */
export function isFiscal(perfilNome?: string): boolean {
    if (!perfilNome) return false;
    return perfilNome.toLowerCase() === ROLES.FISCAL.toLowerCase();
}

/**
 * Verifica se o perfil é um dos perfis operacionais de campo (Motoboy ou Fiscal).
 */
export function isMotoboyOrFiscal(perfilNome?: string): boolean {
    return isMotoboy(perfilNome) || isFiscal(perfilNome);
}

export function isAdmin(perfilNome?: string): boolean {
    if (!perfilNome) return false;
    return perfilNome.toLowerCase() === ROLES.ADMIN.toLowerCase();
}

export function isSuperAdmin(perfilNome?: string): boolean {
    if (!perfilNome) return false;
    return perfilNome.toLowerCase() === ROLES.SUPER_ADMIN.toLowerCase();
}

export function isAnyAdmin(perfilNome?: string): boolean {
    return isSuperAdmin(perfilNome) || isAdmin(perfilNome);
}