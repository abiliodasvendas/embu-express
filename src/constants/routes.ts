export const ROUTES = {
    PUBLIC: {
        ROOT: "/",
        LOGIN: "/login",
        NEW_PASSWORD: "/nova-senha",
        PRIVACY_POLICY: "/politica-de-privacidade",
    },
    PRIVATE: {
        REGISTRAR_ATIVIDADE: "/registrar-atividade",
        CONTROLE_ATIVIDADE_DIARIO: "/controle-atividade-diario",
        COLABORADORES: "/colaboradores",
        COLABORADOR_DETAILS: "/colaboradores/:id",
        CLIENTES: "/clientes",
        CLIENTE_DETAILS: "/clientes/:id",
        CLIENTE_UNIDADE_DETAILS: "/clientes/:id/unidades/:unitId",
        EMPRESAS: "/empresas",
        PERFIS: "/perfis",
        CONFIGURACOES: "/configuracoes",
        FERIADOS: "/feriados",
        OCORRENCIAS: "/admin/ocorrencias",
        ESPELHO_ATIVIDADE: "/admin/espelho-atividade",
        RELATORIO_FINANCEIRO: "/admin/financeiro",
        INICIO: "/inicio"
    }
} as const;

export type RoutePath = typeof ROUTES;
