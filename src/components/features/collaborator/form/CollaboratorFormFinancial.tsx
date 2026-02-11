import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Empresa } from "@/types/database";
import { useFormContext } from "react-hook-form";

interface CollaboratorFormFinancialProps {
    empresas: Empresa[] | undefined;
}

export function CollaboratorFormFinancial({ empresas }: CollaboratorFormFinancialProps) {
  const form = useFormContext();

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="empresa_financeiro_id"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Empresa do Contrato</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                    >
                    <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {empresas?.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.codigo ? `${emp.codigo} - ${emp.nome_fantasia}` : emp.nome_fantasia}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField name="nome_operacao" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Nome Operação</FormLabel><FormControl><Input placeholder="Ex: Operação Ifood ZN" className="h-11 rounded-xl bg-white" {...field}/></FormControl></FormItem>
            )} />
        </div>

        <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
            Os valores de contrato agora são definidos na aba "Vínculos", individualmente por cliente/turno.
        </div>
    </div>
  );
}
