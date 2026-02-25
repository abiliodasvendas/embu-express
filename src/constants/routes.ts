export const ROUTES = {
    PUBLIC: {
        ROOT: "/",
        LOGIN: "/login",
        NEW_PASSWORD: "/nova-senha",
    },
    PRIVATE: {
        REGISTRAR_PONTO: "/registrar-ponto",
        CONTROLE_PONTO: "/controle-ponto",
        COLABORADORES: "/colaboradores",
        COLABORADOR_DETAILS: "/colaboradores/:id",
        CLIENTES: "/clientes",
        CLIENTE_DETAILS: "/clientes/:id",
        EMPRESAS: "/empresas",
        PERFIS: "/perfis",
        CONFIGURACOES: "/configuracoes"
    }
} as const;

export type RoutePath = typeof ROUTES;
