import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Apple, Chrome, Globe, Lock, Settings2, Info } from "lucide-react";

interface LocationTutorialDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LocationTutorialDialog({ isOpen, onClose }: LocationTutorialDialogProps) {
    const stepsAndroid = [
        {
            icon: <Lock className="w-4 h-4 text-blue-600" />,
            text: "Toque no ícone de cadeado ou de configurações na barra de endereço do Chrome."
        },
        {
            icon: <Settings2 className="w-4 h-4 text-blue-600" />,
            text: "Selecione 'Configurações do site' ou 'Permissões'."
        },
        {
            icon: <Info className="w-4 h-4 text-blue-600" />,
            text: "Ative a opção 'Localização' e recarregue a página."
        }
    ];

    const stepsIOS = [
        {
            icon: <Globe className="w-4 h-4 text-blue-600" />,
            text: "Toque no ícone 'AA' ou no 'Cadeado' ao lado da URL no Safari."
        },
        {
            icon: <Settings2 className="w-4 h-4 text-blue-600" />,
            text: "Escolha 'Ajustes do Site'."
        },
        {
            icon: <Info className="w-4 h-4 text-blue-600" />,
            text: "Em 'Localização', mude para 'Permitir'."
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[400px] rounded-[2rem] p-6 gap-6">
                <DialogHeader className="space-y-3">
                    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-2 mx-auto sm:mx-0">
                        <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-center sm:text-left">
                        <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Liberar Localização</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium text-sm mt-1">
                            Siga o passo a passo para permitir o registro de atividade no seu navegador.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="android" className="w-full">
                    <TabsList className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 mb-6">
                        <TabsTrigger value="android" className="rounded-lg font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                            <Chrome className="w-3.5 h-3.5" /> Android
                        </TabsTrigger>
                        <TabsTrigger value="ios" className="rounded-lg font-bold text-xs gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all">
                            <Apple className="w-3.5 h-3.5" /> iPhone (iOS)
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="android" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {stepsAndroid.map((step, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                <div className="bg-white p-2 rounded-xl shadow-sm mt-0.5">
                                    {step.icon}
                                </div>
                                <p className="text-xs font-semibold text-slate-600 leading-relaxed">{step.text}</p>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="ios" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {stepsIOS.map((step, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                <div className="bg-white p-2 rounded-xl shadow-sm mt-0.5">
                                    {step.icon}
                                </div>
                                <p className="text-xs font-semibold text-slate-600 leading-relaxed">{step.text}</p>
                            </div>
                        ))}
                    </TabsContent>
                </Tabs>

                <div className="pt-2">
                    <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                        Após permitir, recarregue a página
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
