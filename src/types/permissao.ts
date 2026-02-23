export interface Permissao {
    id: number;
    nome_interno: string;
    modulo: string;
    descricao: string;
    criado_em?: string;
}

export interface PerfilPermissoes {
    perfil_id: number;
    permissao_id: number;
    permissao?: Permissao; // Usado em queries conjuntas
}
