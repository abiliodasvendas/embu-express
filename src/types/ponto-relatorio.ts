export interface PontoDiarioRelatorio {
    data: string;
    data_br: string;
    dia: number;
    dia_semana_curto: string;
    dia_semana_longo: string;
    status: 'TRABALHADO' | 'SEM_ATIVIDADE' | 'NAO_VIGENTE' | 'FUTURO';
    is_dia_escala: boolean;
    cliente_nome: string | null;
    minutos_esperados: number;
    minutos_trabalhados: number;
    minutos_saldo: number;
    entrada_hora: string | null;
    saida_hora: string | null;
    shift_entrada: string | null;
    shift_saida: string | null;
    entrada_km?: number | null;
    saida_km?: number | null;
    km_rodado: number;
    unidade_nome: string | null;
    ponto_id: number | null;
    observacao?: string | null;
}

export interface EspelhoPontoMensal {
    shift_id: number;
    cliente_nome: string;
    unidade_nome: string;
    periodo: { mes: number; ano: number };
    kpis: {
        dias_base_mes: number;
        dias_meta_turno: number;
        dias_trabalhados: number;
        dias_ausencias: number;
        horas_esperadas: number; // minutos
        horas_trabalhadas: number; // minutos
        horas_ausencias: number; // minutos
        horas_extras: number; // minutos
        horas_devidas: number; // minutos
        km_contratado: number;
        km_realizado: number;
        km_saldo: number;
    };
    calendario: PontoDiarioRelatorio[];
}
