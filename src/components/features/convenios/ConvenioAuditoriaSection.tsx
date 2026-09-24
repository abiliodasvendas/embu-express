import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AuditoriaConvenioResultado,
  LancamentoConvenio,
  StatusFaturaFornecedorConvenio,
} from "@/types/database";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Users,
  Wrench,
  DollarSign,
  FileText,
  ExternalLink,
  Edit2,
  Plus,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

interface ConvenioAuditoriaSectionProps {
  auditoria?: AuditoriaConvenioResultado;
  isLoading: boolean;
  convenioId: string;
  convenioNome?: string;
  mes: number;
  ano: number;
  canEdit: boolean;
  onOpenFaturaDialog: () => void;
  onOpenLancamentoDialog: (lancamento?: LancamentoConvenio | null) => void;
}

export function ConvenioAuditoriaSection({
  auditoria,
  isLoading,
  canEdit,
  onOpenFaturaDialog,
  onOpenLancamentoDialog,
}: ConvenioAuditoriaSectionProps) {
  const [filtroCategoria, setFiltroCategoria] = useState<
    "todos" | "motoboys" | "frota" | "sem_vinculo"
  >("todos");

  const formatLocalDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!auditoria) {
    return null;
  }

  const statusBadgeColor = (status?: StatusFaturaFornecedorConvenio) => {
    switch (status) {
      case "PAGA":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "APROVADA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EM_AUDITORIA":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "GLOSADA":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusLabel = (status?: StatusFaturaFornecedorConvenio) => {
    switch (status) {
      case "PAGA":
        return "Liquidada / Paga";
      case "APROVADA":
        return "Aprovada p/ Pagamento";
      case "EM_AUDITORIA":
        return "Em Auditoria";
      case "GLOSADA":
        return "Glosada / Retida";
      default:
        return "Pendente";
    }
  };

  const listaExibicao: LancamentoConvenio[] =
    filtroCategoria === "motoboys"
      ? auditoria.lancamentos_motoboys
      : filtroCategoria === "frota"
      ? auditoria.lancamentos_frota_propria
      : filtroCategoria === "sem_vinculo"
      ? auditoria.lancamentos_sem_vinculo
      : [
          ...auditoria.lancamentos_motoboys,
          ...auditoria.lancamentos_frota_propria,
          ...auditoria.lancamentos_sem_vinculo,
        ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 4 Cards Principais de Conciliação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Fatura do Fornecedor */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden relative">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Fatura da Oficina (Dia 15)
              </span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Receipt className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-gray-900">
              {formatCurrency(auditoria.total_fatura_fornecedor)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              {auditoria.fatura_fornecedor ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-bold h-5 px-2",
                    statusBadgeColor(auditoria.fatura_fornecedor.status)
                  )}
                >
                  {statusLabel(auditoria.fatura_fornecedor.status)}
                </Badge>
              ) : (
                <span className="text-[11px] text-amber-600 font-semibold">
                  Não lançada
                </span>
              )}
              {canEdit && (
                <button
                  onClick={onOpenFaturaDialog}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  {auditoria.fatura_fornecedor ? "Editar" : "Lançar"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Descontado dos Motoboys */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Descontado dos Motoboys
              </span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600">
              {formatCurrency(auditoria.total_descontado_motoboys)}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>{auditoria.lancamentos_motoboys.length} lançamentos</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                100% na Folha
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Moto Embu */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Moto Embu
              </span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Wrench className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-700">
              {formatCurrency(auditoria.total_frota_propria)}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>{auditoria.lancamentos_frota_propria.length} lançamentos</span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                Custo da Empresa
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Saldo a Cargo da Embu */}
        <Card
          className={cn(
            "rounded-2xl border shadow-sm",
            auditoria.tem_risco_glosa
              ? "border-red-200 bg-red-50/50"
              : "border-gray-100 bg-white"
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Saldo a Cargo da Embu
              </span>
              <div
                className={cn(
                  "p-2 rounded-xl",
                  auditoria.tem_risco_glosa
                    ? "bg-red-100 text-red-600"
                    : "bg-purple-50 text-purple-600"
                )}
              >
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <div
              className={cn(
                "text-2xl font-black",
                auditoria.tem_risco_glosa ? "text-red-700" : "text-purple-700"
              )}
            >
              {formatCurrency(auditoria.saldo_a_cargo_embu)}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Fatura − Motoboys</span>
              {auditoria.diferenca_nao_identificada > 0 ? (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                  +{formatCurrency(auditoria.diferenca_nao_identificada)} s/ vínculo
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Equilibrado
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trava Visual de Glosa / Alerta de Auditoria */}
      {auditoria.tem_risco_glosa ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl mt-0.5 sm:mt-0 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">
                Cobrança Não Identificada / Risco de Glosa
              </h4>
              <p className="text-xs text-red-800 mt-1 max-w-3xl leading-relaxed">
                O saldo a cargo da Embu (
                <strong>{formatCurrency(auditoria.saldo_a_cargo_embu)}</strong>)
                supera as despesas marcadas em veículos da frota própria (
                <strong>{formatCurrency(auditoria.total_frota_propria)}</strong>) em{" "}
                <span className="font-extrabold text-red-700 underline">
                  {formatCurrency(auditoria.diferenca_nao_identificada)}
                </span>
                . Existem itens sem ordem de serviço identificada! O pagamento do
                boleto do dia 15 deve ser retido ou auditado.
              </p>
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={onOpenFaturaDialog}
              variant="destructive"
              className="rounded-xl font-bold text-xs h-9 px-4 shrink-0 shadow-sm"
            >
              Auditar / Glosar Boleto
            </Button>
          )}
        </div>
      ) : auditoria.total_fatura_fornecedor > 0 ? (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-xs leading-relaxed">
            <span className="font-bold">Conciliação do Dia 15 Validada:</span> O
            saldo a cargo da Embu está 100% justificado pelas ordens de serviço
            da frota própria cadastrada. Nenhuma divergência detectada para este
            convênio.
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <Receipt className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <span className="font-bold">Fatura Global Não Registrada:</span> Lance
              o valor do boleto cobrado pela oficina no dia 15 para auditar
              automaticamente as retenções de folha e identificar glosas.
            </div>
          </div>
          {canEdit && (
            <Button
              onClick={onOpenFaturaDialog}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-8 px-3 shrink-0"
            >
              Lançar Fatura
            </Button>
          )}
        </div>
      )}

      {/* Tabela de Lançamentos Conciliados */}
      <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Extrato Conciliado da Oficina
            </h3>
            <p className="text-xs text-muted-foreground">
              Total de {auditoria.total_geral_lancamentos > 0 ? formatCurrency(auditoria.total_geral_lancamentos) : "R$ 0,00"} computados no período
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setFiltroCategoria("todos")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                filtroCategoria === "todos"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              Todos ({listaExibicao.length})
            </button>
            <button
              onClick={() => setFiltroCategoria("motoboys")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                filtroCategoria === "motoboys"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              Motoboys ({auditoria.lancamentos_motoboys.length})
            </button>
            <button
              onClick={() => setFiltroCategoria("frota")}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                filtroCategoria === "frota"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              Moto Embu ({auditoria.lancamentos_frota_propria.length})
            </button>
            {auditoria.lancamentos_sem_vinculo.length > 0 && (
              <button
                onClick={() => setFiltroCategoria("sem_vinculo")}
                className={cn(
                  "px-3 py-1 text-xs font-bold rounded-lg transition-all text-red-600",
                  filtroCategoria === "sem_vinculo"
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "hover:text-red-800"
                )}
              >
                Sem Vínculo ({auditoria.lancamentos_sem_vinculo.length})
              </button>
            )}
          </div>
        </div>

        {listaExibicao.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-gray-500">
              Nenhum lançamento encontrado nesta categoria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left table-fixed">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-[100px]">Data</th>
                  <th className="pb-3 w-[240px]">Destinação / Vínculo</th>
                  <th className="pb-3 w-[120px]">Valor</th>
                  <th className="pb-3 pr-2">Item / Descrição</th>
                  {canEdit && (
                    <th className="pb-3 text-right pr-2 w-[80px]">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/60">
                {listaExibicao.map((item) => (
                  <tr
                    key={item.id}
                    className="text-xs text-gray-700 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 pl-2 font-medium text-gray-500 whitespace-nowrap">
                      {formatLocalDate(item.data_lancamento)}
                    </td>
                    <td className="py-3 pr-2">
                      {item.moto_embu ? (
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="bg-sky-50 text-sky-700 border-sky-200 text-[10px] font-bold px-2 py-0.5"
                          >
                            <Wrench className="h-3 w-3 mr-1" />
                            Moto Embu
                          </Badge>
                        </div>
                      ) : item.colaborador ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            {item.colaborador.nome_completo}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Desconto em Folha
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="destructive"
                            className="text-[10px] font-bold px-2 py-0.5"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Sem Vínculo / Risco Glosa
                          </Badge>
                        </div>
                      )}
                    </td>
                    <td className="py-3 font-bold text-gray-900 whitespace-nowrap">
                      {formatCurrency(Number(item.valor))}
                    </td>
                    <td className="py-3 pr-2 text-gray-600 truncate">
                      {item.descricao || "—"}
                    </td>
                    {canEdit && (
                      <td className="py-3 pr-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-gray-400 hover:text-blue-600"
                          onClick={() => onOpenLancamentoDialog(item)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
