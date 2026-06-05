import { MENU_CATEGORIES, MenuCategory } from "@/constants/menu.constants";
import { PermissionKey, PERMISSIONS } from "@/constants/permissions.enum";
import { ROUTES } from "@/constants/routes";
import {
    AlertCircle,
    Banknote,
    Briefcase,
    Building,
    Clock,
    FileText,
    Home,
    Settings,
    Users,
    Package,
    MapPin,
    MessageSquare
} from "lucide-react";

export interface PageItem {
    title: string;
    href: string;
    icon: any;
    permissionKey?: PermissionKey | PermissionKey[];
    category?: MenuCategory;
}

export const pagesItems: PageItem[] = [
    {
        title: "Início",
        href: ROUTES.PRIVATE.INICIO,
        icon: Home,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
    },
    {
        title: "Registrar Atividade",
        href: ROUTES.PRIVATE.REGISTRAR_ATIVIDADE,
        icon: Clock,
    },
    {
        title: "Colaboradores",
        href: ROUTES.PRIVATE.COLABORADORES,
        icon: Users,
        permissionKey: PERMISSIONS.USUARIOS.VER,
    },
    {
        title: "Controle de Atividade",
        href: ROUTES.PRIVATE.CONTROLE_ATIVIDADE_DIARIO,
        icon: Clock,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Espelho de Atividade",
        href: ROUTES.PRIVATE.ESPELHO_ATIVIDADE,
        icon: FileText,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Mapa de Jornada",
        href: ROUTES.PRIVATE.MAPA_ATIVIDADE,
        icon: MapPin,
        permissionKey: PERMISSIONS.PONTO.ADMIN_VER,
        category: MENU_CATEGORIES.PONTO
    },
    {
        title: "Clientes",
        href: ROUTES.PRIVATE.CLIENTES,
        icon: Briefcase,
        permissionKey: PERMISSIONS.CLIENTES.VER,
    },
    {
        title: "Relatório Financeiro",
        href: ROUTES.PRIVATE.RELATORIO_FINANCEIRO,
        icon: Banknote,
    },
    {
        title: "Ocorrências",
        href: ROUTES.PRIVATE.OCORRENCIAS,
        icon: AlertCircle,
        permissionKey: PERMISSIONS.OCORRENCIAS.VER,
    },
    {
        title: "Empresas",
        href: ROUTES.PRIVATE.EMPRESAS,
        icon: Building,
        permissionKey: PERMISSIONS.EMPRESAS.VER,
        category: MENU_CATEGORIES.CADASTROS
    },
    {
        title: "Feriados",
        href: ROUTES.PRIVATE.FERIADOS,
        icon: Building,
        permissionKey: PERMISSIONS.CONFIGURACAO.VER,
        category: MENU_CATEGORIES.CADASTROS
    },
    {
        title: "Itens e Equipamentos",
        href: ROUTES.PRIVATE.EQUIPAMENTOS,
        icon: Package,
        permissionKey: PERMISSIONS.EQUIPAMENTOS.VER,
        category: MENU_CATEGORIES.CADASTROS
    },
    {
        title: "Perfis",
        href: ROUTES.PRIVATE.PERFIS,
        icon: Users,
        permissionKey: PERMISSIONS.PERFIS.VER,
    },
    {
        title: "Configurações",
        href: ROUTES.PRIVATE.CONFIGURACOES,
        icon: Settings,
        permissionKey: PERMISSIONS.CONFIGURACAO.VER,
    },
    {
        title: "Suporte e Chamados",
        href: ROUTES.PRIVATE.CHAMADOS,
        icon: MessageSquare,
        permissionKey: PERMISSIONS.CHAMADOS.VER,
    },
];
