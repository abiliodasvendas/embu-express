import { ClienteCombobox, EmpresaCombobox } from "@/components/dialogs/CollaboratorFormComboboxes";
import { Button } from "@/components/ui/button";
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Client, Empresa } from "@/types/database";
import { Link as LinkIcon, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface CollaboratorFormLinksProps {
    clients: Client[] | undefined;
    empresas: Empresa[] | undefined;
}

export function CollaboratorFormLinks({ clients, empresas }: CollaboratorFormLinksProps) {
    const form = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "links",
    });

    const handleAddLink = () => {
        append({
            hora_inicio: "08:00",
            hora_fim: "18:00",
            cliente_id: "",
            empresa_id: "",
            valor_contrato: 0,
            valor_aluguel: 0,
            valor_bonus: 0,
            ajuda_custo: 0
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                <LinkIcon className="w-4 h-4" />
                Turnos e locais onde o colaborador trabalha.
            </div>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="relative p-4 pt-7 rounded-2xl bg-gray-50 border border-gray-100 group transition-all">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="absolute right-2 top-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors opacity-70 hover:opacity-100 z-10"
                            title="Remover vínculo"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.cliente_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Cliente <span className="text-red-500">*</span></FormLabel>
                                            <ClienteCombobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                clients={clients || []}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.empresa_id`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Empresa (Contrato) <span className="text-red-500">*</span></FormLabel>
                                            <EmpresaCombobox
                                                value={field.value}
                                                onChange={field.onChange}
                                                empresas={empresas || []}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.hora_inicio`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Início</FormLabel>
                                            <Input type="time" className="bg-white" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.hora_fim`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Fim</FormLabel>
                                            <Input type="time" className="bg-white" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-gray-100 pt-3 mt-2">
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.valor_contrato`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Val. Contrato</FormLabel>
                                            <Input type="number" step="0.01" className="h-9 bg-white text-sm" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.valor_aluguel`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Aluguel Moto</FormLabel>
                                            <Input type="number" step="0.01" className="h-9 bg-white text-sm" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.ajuda_custo`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-700 font-bold ml-1 text-xs opacity-70">Ajuda Custo</FormLabel>
                                            <Input type="number" step="0.01" className="h-9 bg-white text-sm" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`links.${index}.valor_bonus`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-green-700 font-bold ml-1 text-xs opacity-70">Zero Falta</FormLabel>
                                            <Input type="number" step="0.01" className="h-9 bg-white text-sm border-green-100" {...field} />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 h-12"
                    onClick={handleAddLink}
                >
                    + Adicionar Vínculo (Turno)
                </Button>
            </div>
        </div>
    );
}
