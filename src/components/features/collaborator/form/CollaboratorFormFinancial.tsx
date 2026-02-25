import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Empresa } from "@/types/database";
import { useFormContext } from "react-hook-form";
import { cnpjMask } from "@/utils/masks";
import { cn } from "@/lib/utils";

interface CollaboratorFormFinancialProps {
    empresas: Empresa[] | undefined;
}

export function CollaboratorFormFinancial({ empresas }: CollaboratorFormFinancialProps) {
    const form = useFormContext();
    const isMotoboy = form.watch("isMotoboy");

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="cnpj" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">CNPJ (MEI) {isMotoboy && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                            <Input
                                className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.cnpj && "border-red-500 focus-visible:ring-red-200")}
                                {...field}
                                onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                                maxLength={18}
                                placeholder="00.000.000/0000-00"
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="chave_pix" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Chave Pix <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.chave_pix && "border-red-500 focus-visible:ring-red-200")} {...field} placeholder="CPF, Email ou Aleatória" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>
    );
}
