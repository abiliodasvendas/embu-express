import { AniversariantesHeader } from "@/components/features/aniversariantes/AniversariantesHeader";
import { AniversariantesKpiCards } from "@/components/features/aniversariantes/AniversariantesKpiCards";
import { AniversariantesMonthList } from "@/components/features/aniversariantes/AniversariantesMonthList";
import { AniversariantesSemDataList } from "@/components/features/aniversariantes/AniversariantesSemDataList";
import { Banner } from "@/components/ui/Banner";
import { useAniversariantesViewModel } from "@/hooks";

export default function Aniversariantes() {
  const {
    mesSelecionado,
    setMesSelecionado,
    mesAtual,
    nomeMesSelecionado,
    termoBusca,
    setTermoBusca,
    aniversariantesMes,
    semDataNascimento,
    resumo,
    isLoading,
    isError,
    refetch,
    canEditCollaborator,
    handleMesAnterior,
    handleProximoMes,
    handleVoltarMesAtual,
    handleEditarSemData,
  } = useAniversariantesViewModel();

  const temBusca = termoBusca.trim().length > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300 pb-12">
      <AniversariantesHeader
        mesSelecionado={mesSelecionado}
        mesAtual={mesAtual}
        termoBusca={termoBusca}
        onSelectMes={setMesSelecionado}
        onMesAnterior={handleMesAnterior}
        onProximoMes={handleProximoMes}
        onVoltarMesAtual={handleVoltarMesAtual}
        onBuscaChange={setTermoBusca}
      />

      {isError && (
        <Banner
          variant="danger"
          title="Não foi possível carregar os aniversariantes"
          description="Verifique sua conexão e tente novamente."
          action={{
            label: "Tentar novamente",
            onClick: () => {
              void refetch();
            },
          }}
        />
      )}

      <AniversariantesKpiCards
        resumo={resumo}
        nomeMesSelecionado={nomeMesSelecionado}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <AniversariantesMonthList
            itens={aniversariantesMes}
            nomeMesSelecionado={nomeMesSelecionado}
            isLoading={isLoading}
            temBusca={temBusca}
          />
        </div>

        <div className="lg:col-span-5">
          <AniversariantesSemDataList
            colaboradores={semDataNascimento}
            isLoading={isLoading}
            canEdit={canEditCollaborator}
            temBusca={temBusca}
            onEditar={handleEditarSemData}
          />
        </div>
      </div>
    </div>
  );
}
