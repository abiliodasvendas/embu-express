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
        CONFIGURACOES: "/configuracoes",
        FERIADOS: "/feriados",
        OCORRENCIAS: "/admin/ocorrencias",
        ESPELHO_PONTO: "/admin/espelho-ponto",
        RELATORIO_FINANCEIRO: "/admin/financeiro",
        INICIO: "/inicio"
    }
} as const;

export type RoutePath = typeof ROUTES;
