export const PERMISSIONS = {
    USUARIOS: {
        VER: 'usuarios:ver',
        CRIAR: 'usuarios:criar',
        EDITAR: 'usuarios:editar',
        DELETAR: 'usuarios:deletar',
        STATUS: 'usuarios:status',
    },
    PERFIS: {
        VER: 'perfis:ver',
        CRIAR: 'perfis:criar',
        EDITAR: 'perfis:editar',
        DELETAR: 'perfis:deletar',
    },
    CLIENTES: {
        VER: 'clientes:ver',
        CRIAR: 'clientes:criar',
        EDITAR: 'clientes:editar',
        DELETAR: 'clientes:deletar',
        STATUS: 'clientes:status',
    },
    EMPRESAS: {
        VER: 'empresas:ver',
        CRIAR: 'empresas:criar',
        EDITAR: 'empresas:editar',
        DELETAR: 'empresas:deletar',
        STATUS: 'empresas:status',
    },
    PONTO: {
        ADMIN_VER: 'ponto:admin_ver', // Painel: Ver lista de todos
        ADMIN_CRIAR: 'ponto:admin_criar', // Painel: Inserir ponto manualmente
        ADMIN_EDITAR: 'ponto:admin:editar', // Painel: Corrigir linha
        ADMIN_DELETAR: 'ponto:admin:deletar', // Painel: Excluir linha
        VER_MEU: 'ponto:ver_meu', // App: Ver o próprio espelho de ponto
    },
    CONFIGURACAO: {
        VER: "configuracoes:ver",
        EDITAR: "configuracoes:editar",
    } as const,
    OCORRENCIAS: {
        VER: "ocorrencias:ver",
        CRIAR: "ocorrencias:criar",
        EDITAR: "ocorrencias:editar",
        DELETAR: "ocorrencias:deletar",
        TIPOS: "ocorrencias:tipos",
    } as const,
    FINANCEIRO: {
        EXTRATO: "financeiro:extrato",
        FECHAR: "financeiro:fechar",
        PAGAR: "financeiro:pagar",
        VER_MEU: 'financeiro:ver_meu', // App: Ver o próprio financeiro
    } as const,
} as const;

export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MOTOBOY: 'motoboy',
    FISCAL: 'fiscal',
    CLIENTE: 'cliente',
} as const;

export const PROTECTED_ROLES_NAMES = [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.CLIENTE,
    ROLES.MOTOBOY,
    ROLES.FISCAL
];

type ObjectValues<T> = T[keyof T];
export type PermissionKey = ObjectValues<{
    [K in keyof typeof PERMISSIONS]: ObjectValues<typeof PERMISSIONS[K]>;
}>;
