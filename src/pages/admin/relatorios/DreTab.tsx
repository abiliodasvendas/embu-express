import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import { useDRE } from "@/hooks/api/useDRE";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { TrendingUp, DollarSign, Wrench, Percent, AlertCircle, Building2, Plus, Receipt } from "lucide-react";

interface DreTabProps {
  mes: number;
  ano: number;
}

export function DreTab({ mes, ano }: DreTabProps) {
  const { openDespesaFormDialog } = useLayout();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("todas");
  const empresaIdNumber = selectedEmpresaId === "todas" ? undefined : Number(selectedEmpresaId);

  const { data: empresas = [] } = useEmpresas();
  const { data: dre, isLoading, isError, refetch } = useDRE(mes, ano, empresaIdNumber);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  };

  const formatarPercentual = (valor: number) => {
    return `${(valor || 0).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader className="pb-2"><Skeleton className="h-4 w-1/2" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-3/4 mb-2" /><Skeleton className="h-3 w-1/4" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dre) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center text-center p-8 border rounded-2xl bg-red-50 text-red-600 border-red-200">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="font-semibold">Erro ao carregar o DRE da competência selecionada.</p>
      </div>
    );
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const isMesAberto = ano > anoAtual || (ano === anoAtual && mes >= mesAtual);
  const subtituloFolha = isMesAberto
    ? "Estimativa da Folha (Teto Aberto)"
    : "Custo Efetivo Real (Vales Pagos + Saldo Final)";

  const isPositivo = (dre.lucro_liquido || 0) >= 0;

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
              Visão Societária
            </p>
            <p className="text-sm font-bold text-gray-800 leading-none">
              {dre.empresa_nome}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="w-full sm:w-64">
            <Select value={selectedEmpresaId} onValueChange={setSelectedEmpresaId}>
              <SelectTrigger className="h-10 rounded-xl border-gray-200 bg-gray-50 font-bold text-xs">
                <SelectValue placeholder="Selecione a Empresa" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="todas" className="text-xs font-bold">Consolidado (Holding - 4 CNPJs)</SelectItem>
                {empresas.map(emp => (
                  <SelectItem key={emp.id} value={String(emp.id)} className="text-xs font-medium">
                    {emp.nome_fantasia} {emp.codigo ? `(${emp.codigo})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            size="sm"
            onClick={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
            className="h-10 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm text-xs font-bold"
          >
            <Plus className="h-4 w-4" />
            Lançar Despesa
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Cobrado dos Clientes</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{formatarMoeda(dre.faturamento_bruto)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">100% Medições Emitidas</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Custo Pessoal (Folha)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{formatarMoeda(dre.custos_diretos.custo_pessoal_folha)}</div>
            <p className="text-[11px] text-muted-foreground mt-1 font-medium">{subtituloFolha}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frota Própria (Motos)</CardTitle>
            <Wrench className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900">{formatarMoeda(dre.custos_diretos.manutencao_frota_propria)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Manutenção e Combustível Próprio</p>
          </CardContent>
        </Card>

        <Card className={`rounded-2xl shadow-sm ${isPositivo ? "bg-emerald-50/70 border-emerald-200" : "bg-rose-50/70 border-rose-200"}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-xs font-bold uppercase tracking-wider ${isPositivo ? "text-emerald-800" : "text-rose-800"}`}>
              {isPositivo ? "Lucro Líquido Real" : "Prejuízo no Período"}
            </CardTitle>
            <Percent className={`h-4 w-4 ${isPositivo ? "text-emerald-600" : "text-rose-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${isPositivo ? "text-emerald-700" : "text-rose-700"}`}>
              {formatarMoeda(dre.lucro_liquido)}
            </div>
            <p className={`text-[11px] font-bold mt-1 ${isPositivo ? "text-emerald-600" : "text-rose-600"}`}>
              Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden bg-white">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50 px-6 py-4">
          <CardTitle className="text-sm font-black tracking-wide text-gray-800 uppercase">
            Resultado Real do Mês (Lucro da Empresa)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100 text-sm">
            <div className="flex justify-between items-center px-6 py-3.5 bg-blue-50/30 font-bold text-gray-900">
              <span>(+) TOTAL COBRADO DOS CLIENTES (FATURAMENTO)</span>
              <span>{formatarMoeda(dre.faturamento_bruto)}</span>
            </div>

            {dre.outras_receitas_operacionais > 0 && (
              <div className="flex justify-between items-center px-6 py-2 bg-emerald-50/30 font-bold text-emerald-800 text-xs">
                <span>(+) OUTRAS RECEITAS OPERACIONAIS (Lançamentos Avulsos)</span>
                <span>{formatarMoeda(dre.outras_receitas_operacionais)}</span>
              </div>
            )}

            <div className="px-6 py-2 bg-gray-50/20 text-xs font-bold text-gray-500 uppercase tracking-wider">
              (-) GASTOS DIRETOS COM MOTOBOYS E MOTOS
            </div>
            <div className="flex justify-between items-center px-8 py-2 text-gray-600 text-xs">
              <span>• Custo de Pessoal e Retaguarda ({subtituloFolha})</span>
              <span>{formatarMoeda(dre.custos_diretos.custo_pessoal_folha)}</span>
            </div>
            <div className="flex justify-between items-center px-8 py-2 text-gray-600 text-xs">
              <span>• Manutenção e Combustível de Frota Própria (Registros moto_embu)</span>
              <span>{formatarMoeda(dre.custos_diretos.manutencao_frota_propria)}</span>
            </div>
            <div className="flex justify-between items-center px-6 py-2.5 font-bold text-rose-600 bg-rose-50/20 text-xs">
              <span>TOTAL GASTOS DIRETOS</span>
              <span>(-) {formatarMoeda(dre.custos_diretos.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 bg-emerald-50/40 font-black text-gray-900">
              <span>(=) LUCRO BRUTO (Margem: {formatarPercentual(dre.margem_bruta_percentual)})</span>
              <span className="text-emerald-700">{formatarMoeda(dre.lucro_bruto)}</span>
            </div>

            <div className="px-6 py-2 bg-gray-50/20 text-xs font-bold text-gray-500 uppercase tracking-wider">
              (-) CONTAS FIXAS E ESCRITÓRIO
            </div>
            {dre.despesas_fixas.itens.map((item, index) => (
              <div key={index} className="flex justify-between items-center px-8 py-1.5 text-gray-600 text-xs">
                <span>• {item.descricao}</span>
                <span>{formatarMoeda(item.valor)}</span>
              </div>
            ))}
            {dre.despesas_fixas.itens.length === 0 && (
              <div className="flex items-center justify-between px-8 py-2 text-xs">
                <span className="text-gray-400 italic">Nenhuma conta fixa lançada no período</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
                  className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-semibold gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Lançar Conta Fixa
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center px-6 py-2.5 font-bold text-rose-600 bg-rose-50/20 text-xs">
              <span>TOTAL CONTAS FIXAS E ESCRITÓRIO</span>
              <span>(-) {formatarMoeda(dre.despesas_fixas.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-gray-700 text-xs font-medium">
              <span>(-) IMPOSTOS DO MÊS (Simples Nacional - DAS {dre.tributos_correntes_das.is_provisionado ? "[Provisão Estimada]" : "[Guia Fechada]"})</span>
              <span className="text-rose-600 font-bold">(-) {formatarMoeda(dre.tributos_correntes_das.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3 bg-slate-100/80 font-black text-slate-800 text-xs border-y border-slate-200">
              <span>(=) LUCRO OPERACIONAL (EBITDA / LAJIDA)</span>
              <span className={dre.lucro_operacional >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {formatarMoeda(dre.lucro_operacional)}
              </span>
            </div>

            {dre.prolabore > 0 && (
              <div className="flex justify-between items-center px-6 py-2.5 text-gray-700 text-xs font-medium">
                <span>(-) RETIRADA DE PRÓ-LABORE DOS SÓCIOS</span>
                <span className="text-rose-600 font-bold">(-) {formatarMoeda(dre.prolabore)}</span>
              </div>
            )}

            <div className="flex justify-between items-center px-6 py-2.5 text-gray-700 text-xs font-medium">
              <span>(-) PARCELAMENTOS FISCAIS (Dívida Ativa / Acordos)</span>
              <span className="text-rose-600 font-bold">(-) {formatarMoeda(dre.parcelamentos_fiscais)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-gray-700 text-xs font-medium">
              <span>(-) INVESTIMENTOS E FINANCIAMENTOS (Consórcio, Frota, Imóveis)</span>
              <span className="text-rose-600 font-bold">(-) {formatarMoeda(dre.investimentos_financiamentos)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-gray-700 text-xs font-medium">
              <span>(-) DESPESAS FINANCEIRAS (Juros Cheque Especial / Tarifas Bancárias)</span>
              <span className="text-rose-600 font-bold">(-) {formatarMoeda(dre.despesas_financeiras)}</span>
            </div>

            <div className={`flex justify-between items-center px-6 py-4 font-black text-base rounded-b-3xl text-white ${isPositivo ? "bg-emerald-600" : "bg-rose-600"}`}>
              <span>(=) {isPositivo ? "LUCRO REAL DA EMPRESA" : "PREJUÍZO NO PERÍODO"}</span>
              <div className="text-right">
                <div>{formatarMoeda(dre.lucro_liquido)}</div>
                <div className={`text-[11px] font-normal ${isPositivo ? "text-emerald-100" : "text-rose-100"}`}>
                  Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
