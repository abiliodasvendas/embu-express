import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { aplicarMascaraPlaca, cnpjMask, dateMask } from "@/utils/masks";
import { useFormContext } from "react-hook-form";

export function CollaboratorFormProfessional() {
  const { formState: { errors }, watch, control } = useFormContext();
  const perfilId = watch("perfil_id");
  const isMotoboy = perfilId === "3";

  if (!isMotoboy) {
    return (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm">Este perfil não requer dados de veículo.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                Dados da CNH
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={control}
                    name="cnh_registro"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Registro CNH <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                            <Input 
                                className={cn("h-10 bg-white", errors.cnh_registro && "border-red-500 focus-visible:ring-red-200")} 
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
                            <FormLabel>Vencimento CNH <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="DD/MM/AAAA"
                                maxLength={10}
                                className={cn("h-10 bg-white", errors.cnh_vencimento && "border-red-500 focus-visible:ring-red-200")} 
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
                            <FormLabel>Categoria <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                            <Input 
                                placeholder="A / AB" 
                                className={cn("h-10 bg-white uppercase", errors.cnh_categoria && "border-red-500 focus-visible:ring-red-200")} 
                                {...field} 
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                Dados da Moto
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <FormField name="moto_modelo" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Modelo <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input className={cn("h-10 bg-white", errors.moto_modelo && "border-red-500 focus-visible:ring-red-200")} {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="moto_cor" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cor <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input className={cn("h-10 bg-white", errors.moto_cor && "border-red-500 focus-visible:ring-red-200")} {...field}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="moto_ano" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Ano <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input className={cn("h-10 bg-white", errors.moto_ano && "border-red-500 focus-visible:ring-red-200")} {...field} maxLength={4} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}/>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )} />
                <FormField name="moto_placa" control={control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Placa <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                            <Input 
                                className={cn("h-10 bg-white uppercase", errors.moto_placa && "border-red-500 focus-visible:ring-red-200")} 
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
        </div>

        <div className="grid grid-cols-2 gap-4">
            <FormField name="cnpj" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel>CNPJ (MEI) <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <Input 
                            className={cn("h-11 rounded-xl bg-white", errors.cnpj && "border-red-500 focus-visible:ring-red-200")} 
                            {...field}
                            onChange={(e) => field.onChange(cnpjMask(e.target.value))}
                            maxLength={18}
                            placeholder="00.000.000/0000-00"
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField name="chave_pix" control={control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Chave Pix <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                        <Input className={cn("h-11 rounded-xl bg-white", errors.chave_pix && "border-red-500 focus-visible:ring-red-200")} {...field} placeholder="CPF, Email ou Aleatória"/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
    </div>
  );
}
