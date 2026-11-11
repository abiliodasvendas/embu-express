import { format, parseISO } from "date-fns";
import { Ocorrencia } from "@/types/database";
import { ExtratoMensal } from "@/types/financeiro";
import {
  CALENDARIO_STATUS,
  LANCAMENTO_TIPO,
} from "@/constants/financeiro.constants";

export type OcorrenciaComTipo = Ocorrencia & {
  tipo?: { descricao?: string };
  is_virtual?: boolean;
  criado_por_usuario?: { nome_completo?: string };
};

export interface LancamentoConvenioItem {
  id?: string;
  convenio?: { nome?: string };
  descricao?: string;
  observacao?: string;
  data_lancamento: string;
  valor: number | string;
}

export interface LancamentoConsolidado {
  id: string;
  grupo: string;
  descricao: string;
  tipo: "ENTRADA" | "SAIDA";
  valor: number;
}

export function buildComprovanteRendaExtrato(rawExtrato: ExtratoMensal): ExtratoMensal {
  const resumoPorCliente = (rawExtrato.resumo_por_cliente || []).map((r) => {
    const baseFixa =
      (r.valores_fixos?.contrato || 0) +
      (r.valores_fixos?.ajuda_custo || 0) +
      (r.valores_fixos?.aluguel || 0);
    const valorFixo = parseFloat(baseFixa.toFixed(2));
    const diasIntegrais = r.dias_base_mes || r.dias_esperados_turno || 26;

    return {
      ...r,
      ausencias: 0,
      datas_ausencia: [],
      dias_base_mes: diasIntegrais,
      dias_esperados_turno: diasIntegrais,
      dias_trabalhados: diasIntegrais,
      debitos_ocorrencia: 0,
      creditos_ocorrencia: 0,
      valor_calculado: valorFixo,
      saldo_fixo_original: valorFixo,
      valores_fixos: {
        ...r.valores_fixos,
        bonus: 0,
        bonus_config: 0,
        adiantamento: 0,
        adiantamento_config: 0,
      },
      calendario_visual: (r.calendario_visual || []).map((c) =>
        c.status === CALENDARIO_STATUS.SEM_ATIVIDADE ||
        c.status === CALENDARIO_STATUS.NAO_VIGENTE
          ? { ...c, status: CALENDARIO_STATUS.TRABALHADO }
          : c,
      ),
    };
  });

  const totalTurnos = resumoPorCliente.reduce((acc, r) => acc + r.valor_calculado, 0);
  const saldoFinal = parseFloat(totalTurnos.toFixed(2));

  return {
    ...rawExtrato,
    resumo_por_cliente: resumoPorCliente,
    ocorrencias: [],
    ocorrencias_avulsas: { creditos: 0, debitos: 0, saldo: 0 },
    lancamentos_convenios: [],
    mei_consolidado: {
      valor_original: 0,
      valor_calculado: 0,
      dias_base: rawExtrato.mei_consolidado?.dias_base || 26,
      dias_trabalhados: rawExtrato.mei_consolidado?.dias_base || 26,
      datas_trabalhadas: [],
    },
    totais: {
      total_turnos: saldoFinal,
      total_mei: 0,
      total_avulso: 0,
      total_adiantamento: 0,
      saldo_final: saldoFinal,
    },
  };
}

export function buildLancamentosConsolidados(extrato?: ExtratoMensal): LancamentoConsolidado[] {
  if (!extrato) return [];
  const items: LancamentoConsolidado[] = [];

  (extrato.resumo_por_cliente || []).forEach((resumo, idx) => {
    const baseBrutaFixa =
      (resumo.valores_fixos?.contrato || 0) +
      (resumo.valores_fixos?.ajuda_custo || 0) +
      (resumo.valores_fixos?.aluguel || 0);
    const valorDia = resumo.dias_base_mes > 0 ? baseBrutaFixa / resumo.dias_base_mes : 0;
    const valorBrutoVigente = valorDia * resumo.dias_esperados_turno;

    if (valorBrutoVigente > 0) {
      items.push({
        id: `turno-base-${idx}`,
        grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
        descricao: `Base Contratual Proporcional (${resumo.dias_esperados_turno}/${resumo.dias_base_mes} dias de Atividade)`,
        tipo: "ENTRADA",
        valor: parseFloat(valorBrutoVigente.toFixed(2)),
      });
    }

    if (resumo.ausencias > 0) {
      const valorAusencia = valorDia * resumo.ausencias;
      items.push({
        id: `turno-ausencia-${idx}`,
        grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
        descricao: `Dedução por Sem Atividade (${resumo.ausencias} dia(s))`,
        tipo: "SAIDA",
        valor: parseFloat(valorAusencia.toFixed(2)),
      });
    }

    if (resumo.valores_fixos?.bonus > 0) {
      items.push({
        id: `turno-bonus-${idx}`,
        grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
        descricao: `Bônus de Atividade / Assiduidade`,
        tipo: "ENTRADA",
        valor: parseFloat(resumo.valores_fixos.bonus.toFixed(2)),
      });
    }

    if (resumo.valores_fixos?.adiantamento > 0) {
      items.push({
        id: `turno-adiantamento-${idx}`,
        grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
        descricao: `Adiantamento Quinzenal`,
        tipo: "SAIDA",
        valor: parseFloat(resumo.valores_fixos.adiantamento.toFixed(2)),
      });
    }

    ((extrato.ocorrencias as OcorrenciaComTipo[]) || [])
      .filter(
        (occ) =>
          occ.colaborador_cliente_id === resumo.id_vinculo &&
          occ.impacto_financeiro &&
          !occ.is_virtual,
      )
      .forEach((occ, oIdx) => {
        const dataBr = occ.data_ocorrencia
          ? format(parseISO(occ.data_ocorrencia), "dd/MM/yyyy")
          : "";
        items.push({
          id: `turno-occ-${idx}-${occ.id || oIdx}`,
          grupo: `Turno (${resumo.nome_fantasia || "Cliente"})`,
          descricao: `${occ.tipo?.descricao || occ.observacao || "Ocorrência"}${
            occ.observacao && occ.tipo?.descricao ? " - " + occ.observacao : ""
          }${dataBr ? " (" + dataBr + ")" : ""}`,
          tipo: occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "ENTRADA" : "SAIDA",
          valor: Number(occ.valor || 0),
        });
      });
  });

  if (extrato.totais?.total_mei > 0) {
    items.push({
      id: "mei-consolidado",
      grupo: "MEI",
      descricao: `Ajuda de Custo MEI (${extrato.mei_consolidado?.dias_trabalhados || 0}/${extrato.mei_consolidado?.dias_base || 26} dias)`,
      tipo: "ENTRADA",
      valor: parseFloat(extrato.totais.total_mei.toFixed(2)),
    });
  }

  ((extrato.ocorrencias as OcorrenciaComTipo[]) || [])
    .filter((occ) => !occ.colaborador_cliente_id && occ.impacto_financeiro && !occ.is_virtual)
    .forEach((occ, idx) => {
      const dataBr = occ.data_ocorrencia
        ? format(parseISO(occ.data_ocorrencia), "dd/MM/yyyy")
        : "";
      items.push({
        id: `ocorrencia-avulsa-${occ.id || idx}`,
        grupo: "Ocorrência Avulsa",
        descricao: `${occ.tipo?.descricao || occ.observacao || "Ocorrência"}${
          occ.observacao && occ.tipo?.descricao ? " - " + occ.observacao : ""
        }${dataBr ? " (" + dataBr + ")" : ""}`,
        tipo: occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "ENTRADA" : "SAIDA",
        valor: Number(occ.valor || 0),
      });
    });

  (((extrato.lancamentos_convenios as LancamentoConvenioItem[]) || [])).forEach((l, idx) => {
    const dataBr = l.data_lancamento
      ? format(parseISO(l.data_lancamento), "dd/MM/yyyy")
      : "";
    const detalheDescricao = l.descricao || l.observacao;
    items.push({
      id: `convenio-${l.id || idx}`,
      grupo: "Convênio",
      descricao: `${l.convenio?.nome || "Oficina/Parceiro"}${
        detalheDescricao ? " - " + detalheDescricao : ""
      }${dataBr ? " (" + dataBr + ")" : ""}`,
      tipo: "SAIDA",
      valor: Number(l.valor || 0),
    });
  });

  return items;
}
