import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aplicarMascaraPlaca, dateMask } from "@/utils/masks";
import { useFormContext } from "react-hook-form";

export function CollaboratorFormCNH() {
    const { formState: { errors }, watch, control } = useFormContext();
    const isMotoboyOrFiscal = watch("isMotoboyOrFiscal");

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
                control={control}
                name="cnh_registro"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Registro CNH {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                            <Input
                                className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.cnh_registro && "border-red-500 focus-visible:ring-red-200")}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="cnh_vencimento"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Vencimento CNH {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="DD/MM/AAAA"
                                maxLength={10}
                                className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.cnh_vencimento && "border-red-500 focus-visible:ring-red-200")}
                                {...field}
                                onChange={(e) => field.onChange(dateMask(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={control}
                name="cnh_categoria"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Categoria {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                        <FormControl>
                            <Input
                                placeholder="A / AB"
                                className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors uppercase", errors.cnh_categoria && "border-red-500 focus-visible:ring-red-200")}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}

export function CollaboratorFormMoto() {
    const { formState: { errors }, watch, control } = useFormContext();
    const isMotoboyOrFiscal = watch("isMotoboyOrFiscal");


    return (
        <div className="grid grid-cols-2 gap-4">
            <FormField name="moto_modelo" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Modelo {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.moto_modelo && "border-red-500 focus-visible:ring-red-200")} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="moto_cor" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Cor {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.moto_cor && "border-red-500 focus-visible:ring-red-200")} {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="moto_ano" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Ano {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                        <Input className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors", errors.moto_ano && "border-red-500 focus-visible:ring-red-200")} {...field} maxLength={4} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="moto_placa" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-gray-700 font-bold ml-1 text-sm opacity-70">Placa {isMotoboyOrFiscal && <span className="text-red-500">*</span>}</FormLabel>
                    <FormControl>
                        <Input
                            className={cn("h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors uppercase", errors.moto_placa && "border-red-500 focus-visible:ring-red-200")}
                            {...field}
                            maxLength={8}
                            onChange={(e) => field.onChange(aplicarMascaraPlaca(e.target.value))}
                            placeholder="ABC-1234"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    );
}
