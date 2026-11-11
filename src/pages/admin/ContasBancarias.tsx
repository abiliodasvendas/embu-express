import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useContasBancariasViewModel } from "@/hooks/ui/contas-bancarias/useContasBancariasViewModel";
import {
  ContasBancariasHeader,
  ContasBancariasKpis,
  ContasBancariasToolbar,
  ContasBancariasTable,
  ContasBancariasMobileCard,
  ContasBancariasSkeleton,
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
    isDeleting,
    canEdit,
    handleNovaConta,
    handleExcluirConta,
    handleVerExtrato,
  } = useContasBancariasViewModel();

  useEffect(() => {
    setPageTitle("Contas Bancárias");
  }, [setPageTitle]);

  if (isLoading) {
    return <ContasBancariasSkeleton />;
  }

  return (
    <div className="space-y-6 pb-24">
      <ContasBancariasHeader />

      <ContasBancariasKpis kpis={kpis} mes={mes} ano={ano} />

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
        canEdit={canEdit}
      />

      <div className="hidden md:block">
        <ContasBancariasTable
          contas={contasFiltradas}
          onExcluir={handleExcluirConta}
          onVerExtrato={handleVerExtrato}
          onNovaConta={handleNovaConta}
          isDeleting={isDeleting}
          canEdit={canEdit}
        />
      </div>

      <div className="block md:hidden space-y-3">
        {contasFiltradas.length === 0 ? (
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
