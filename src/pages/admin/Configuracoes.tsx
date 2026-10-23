import { Settings, Clock, CircleDollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConfiguracoesViewModel } from "@/hooks/ui/configuracoes";
import {
  JornadaTab,
  FinanceiroTab,
  ConfiguracoesSkeleton,
} from "@/components/features/configuracoes";

export default function Configuracoes() {
  const {
    isLoading,
    draftValues,
    setDraftValue,
    handleSave,
    isSaving,
    configAmarelo,
    configHeExcessiva,
    configFeriado,
    configGeofencing,
    configConvenioLimite,
    configSalarios,
    configConvenios,
    configVales,
  } = useConfiguracoesViewModel();

  if (isLoading) {
    return <ConfiguracoesSkeleton />;
  }

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Configurações
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Parametrizações operacionais de jornada, tolerâncias e regras financeiras
          </p>
        </div>
      </div>

      <Tabs defaultValue="jornada" className="space-y-6">
        <TabsList className="w-full sm:w-auto inline-flex">
          <TabsTrigger value="jornada" className="gap-2">
            <Clock className="h-4 w-4" />
            <span>Jornada & Ponto</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="gap-2">
            <CircleDollarSign className="h-4 w-4" />
            <span>Financeiro & Convênios</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jornada" className="space-y-6 animate-in fade-in duration-200">
          <JornadaTab
            configAmarelo={configAmarelo}
            configHeExcessiva={configHeExcessiva}
            configGeofencing={configGeofencing}
            onSave={handleSave}
            isSaving={isSaving}
            onDraftChange={setDraftValue}
            draftValues={draftValues}
          />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6 animate-in fade-in duration-200">
          <FinanceiroTab
            configSalarios={configSalarios}
            configConvenios={configConvenios}
            configVales={configVales}
            configFeriado={configFeriado}
            configConvenioLimite={configConvenioLimite}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
