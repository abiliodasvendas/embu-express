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
import { cnpjMask, cpfMask, evpMask, phoneMask } from "@/utils/masks";
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
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">CNPJ (MEI)</FormLabel>
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
                <FormField name="tipo_chave_pix" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Tipo de Chave PIX <span className="text-red-500">*</span></FormLabel>
                        <Select 
                            onValueChange={(val) => {
                                field.onChange(val);
                                form.setValue("chave_pix", "");
                                form.clearErrors("chave_pix");
                            }} 
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="CPF">CPF</SelectItem>
                                <SelectItem value="CNPJ">CNPJ</SelectItem>
                                <SelectItem value="EMAIL">E-mail</SelectItem>
                                <SelectItem value="TELEFONE">Telefone</SelectItem>
                                <SelectItem value="ALEATORIA">Chave Aleatória</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="chave_pix" control={form.control} render={({ field }) => {
                    const tipoChavePix = form.watch("tipo_chave_pix");
                    return (
                        <FormItem className="md:col-span-2">
                            <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Chave Pix <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Input
                                    disabled={!tipoChavePix}
                                    className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", form.formState.errors.chave_pix && "border-red-500 focus-visible:ring-red-200", !tipoChavePix && "opacity-50 cursor-not-allowed")}
                                    {...field}
                                    onChange={(e) => {
                                        let val = e.target.value;
                                        if (tipoChavePix === "CPF") val = cpfMask(val);
                                        else if (tipoChavePix === "CNPJ") val = cnpjMask(val);
                                        else if (tipoChavePix === "TELEFONE") val = phoneMask(val);
                                        else if (tipoChavePix === "ALEATORIA") val = evpMask(val);
                                        field.onChange(val);
                                    }}
                                    maxLength={
                                        tipoChavePix === "CPF" ? 14 : 
                                        tipoChavePix === "CNPJ" ? 18 : 
                                        tipoChavePix === "TELEFONE" ? 15 :
                                        tipoChavePix === "ALEATORIA" ? 36 : 100
                                    }
                                    placeholder={tipoChavePix ? "Insira a chave" : "Selecione o tipo primeiro"}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }} />
            </div>
        </div>
    );
}
