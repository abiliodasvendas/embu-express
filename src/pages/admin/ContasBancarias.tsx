import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useContasBancariasViewModel } from "@/hooks/ui/contas-bancarias/useContasBancariasViewModel";
import { TableSkeleton } from "@/components/skeletons";
import {
  ContasBancariasHeader,
  ContasBancariasKpis,
  ContasBancariasToolbar,
  ContasBancariasTable,
  ContasBancariasMobileCard,
} from "@/components/features/contas-bancarias";

export default function ContasBancarias() {
  const { setPageTitle } = useLayout();
  const {
    busca,
    setBusca,
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    tipoConta,
    setTipoConta,
    empresas,
    contasFiltradas,
    kpis,
    isLoading,
    isFetching,
    isDeleting,
    canEdit,
    handleNovaConta,
    handleNovaTransferencia,
    handleExcluirConta,
    handleVerExtrato,
  } = useContasBancariasViewModel();

  useEffect(() => {
    setPageTitle("Contas Bancárias");
  }, [setPageTitle]);

  const showSkeleton = isLoading || isFetching;

  return (
    <div className="space-y-6 pb-24">
      <ContasBancariasHeader />

      <ContasBancariasKpis
        kpis={kpis}
        mes={mes}
        ano={ano}
        isLoading={showSkeleton}
      />

      <ContasBancariasToolbar
        busca={busca}
        onBuscaChange={setBusca}
        mes={mes}
        onMesChange={setMes}
        ano={ano}
        onAnoChange={setAno}
        empresaId={empresaId}
        onEmpresaChange={setEmpresaId}
        tipoConta={tipoConta}
        onTipoContaChange={setTipoConta}
        empresas={empresas}
        onNovaConta={handleNovaConta}
        onNovaTransferencia={handleNovaTransferencia}
        canEdit={canEdit}
      />

      <div className="hidden md:block">
        <ContasBancariasTable
          contas={contasFiltradas}
          onExcluir={handleExcluirConta}
          onVerExtrato={handleVerExtrato}
          onNovaConta={handleNovaConta}
          isLoading={showSkeleton}
          isDeleting={isDeleting}
          canEdit={canEdit}
        />
      </div>

      <div className="block md:hidden space-y-3">
        {showSkeleton ? (
          <TableSkeleton cols={4} rows={4} />
        ) : contasFiltradas.length === 0 ? (
          <ContasBancariasTable
            contas={[]}
            onExcluir={handleExcluirConta}
            onVerExtrato={handleVerExtrato}
            onNovaConta={handleNovaConta}
            isDeleting={isDeleting}
            canEdit={canEdit}
          />
        ) : (
          contasFiltradas.map((conta) => (
            <ContasBancariasMobileCard
              key={conta.id}
              conta={conta}
              onExcluir={handleExcluirConta}
              onVerExtrato={handleVerExtrato}
              isDeleting={isDeleting}
              canEdit={canEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}
