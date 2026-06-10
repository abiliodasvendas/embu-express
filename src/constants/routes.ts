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
        OCORRENCIAS: "/ocorrencias",
        ESPELHO_ATIVIDADE: "/espelho-atividade",
        MAPA_ATIVIDADE: "/mapa-jornada",
        RELATORIOS: "/relatorios",
        FECHAMENTO_FINANCEIRO: "/fechamento-financeiro",
        EQUIPAMENTOS: "/equipamentos",
        CHAMADOS: "/chamados",
        CONVENIOS: "/convenios",
        CONVENIO_DETAILS: "/convenios/:id",
        INICIO: "/inicio"
    }
} as const;

export type RoutePath = typeof ROUTES;
