import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { FormLayout } from "@/components/FormLayout";
import { Stepper } from "@/components/Stepper";
import axios from 'axios'

const basicDataSchemaMasked = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  lastname: z.string().min(1, "Último nome é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.preprocess((v)=> String(v ?? '').replace(/\D/g, ''), z.string().length(14, 'CNPJ deve ter 14 digitos')),
  email: z.string().email("E-mail inválido"),
  phone: z.preprocess((v)=> String(v ?? '').replace(/\D/g, ''), z.string().length(11, 'Telefone deve ter 11 digitos')),
  uf: z.string().min(1, "Estado é obrigatório"),
  clientcity: z.string().min(1, "Município é obrigatório"),
});

type BasicDataFormData = z.infer<typeof basicDataSchemaMasked>;

const brazilianStates = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export function BasicDataForm() {
  const [, navigate] = useLocation();

  // Defaults vindos do sessionStorage para reidratar imediatamente
  const basicDefaults = (() => {
    try {
      const raw = sessionStorage.getItem('basicData');
      if (!raw) return null;
      const d = JSON.parse(raw) as Partial<BasicDataFormData>;

      // formatações locais para uso antes das helpers
      const fmtPhone = (value?: string) => {
        const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);
        const p1 = digits.slice(0, 2);
        const p2 = digits.slice(2, 3);
        const p3 = digits.slice(3, 7);
        const p4 = digits.slice(7, 11);
        let out = p1;
        if (digits.length > 2) out = `${p1} ${p2}`;
        if (digits.length > 3) out = `${p1} ${p2} ${p3}`;
        if (digits.length > 7) out = `${p1} ${p2} ${p3}-${p4}`;
        return out;
      };
      const fmtCnpj = (value?: string) => {
        const digits = String(value ?? '').replace(/\D/g, '').slice(0, 14);
        const a = digits.slice(0, 2);
        const b = digits.slice(2, 5);
        const c = digits.slice(5, 8);
        const e = digits.slice(8, 12);
        const f = digits.slice(12, 14);
        let out = a;
        if (digits.length > 2) out = `${a}.${b}`;
        if (digits.length > 5) out = `${a}.${b}.${c}`;
        if (digits.length > 8) out = `${a}.${b}.${c}/${e}`;
        if (digits.length > 12) out = `${a}.${b}.${c}/${e}-${f}`;
        return out;
      };

      const defaults: Partial<BasicDataFormData> = {};
      if (d.name) defaults.name = String(d.name);
      if (d.lastname) defaults.lastname = String(d.lastname);
      if (d.companyName) defaults.companyName = String(d.companyName);
      if (d.email) defaults.email = String(d.email);
      if (d.uf) defaults.uf = String(d.uf);
      if (d.clientcity) defaults.clientcity = String(d.clientcity);
      if (d.phone) defaults.phone = fmtPhone(String(d.phone));
      if (d.cnpj) defaults.cnpj = fmtCnpj(String(d.cnpj));

      return { defaults, initState: (defaults.uf as string) || "" };
    } catch {
      return null;
    }
  })();

  const [selectedState, setSelectedState] = useState<string>(() => basicDefaults?.initState ?? "");
  const [municipalities, setMunicipalities] = useState<any>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<BasicDataFormData>({
    resolver: zodResolver(basicDataSchemaMasked),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: basicDefaults?.defaults as any,
  });

  // utils: masks and debounced validation
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const formatPhone = (digits: string) => {
    const d = digits.slice(0, 11);
    const p1 = d.slice(0, 2);
    const p2 = d.slice(2, 3);
    const p3 = d.slice(3, 7);
    const p4 = d.slice(7, 11);
    let out = p1;
    if (d.length > 2) out = `${p1} ${p2}`;
    if (d.length > 3) out = `${p1} ${p2} ${p3}`;
    if (d.length > 7) out = `${p1} ${p2} ${p3}-${p4}`;
    return out;
  };
  const formatCnpj = (digits: string) => {
    const d = digits.slice(0, 14);
    const a = d.slice(0, 2);
    const b = d.slice(2, 5);
    const c = d.slice(5, 8);
    const e = d.slice(8, 12);
    const f = d.slice(12, 14);
    let out = a;
    if (d.length > 2) out = `${a}.${b}`;
    if (d.length > 5) out = `${a}.${b}.${c}`;
    if (d.length > 8) out = `${a}.${b}.${c}/${e}`;
    if (d.length > 12) out = `${a}.${b}.${c}/${e}-${f}`;
    return out;
  };
  const debounce = <T extends (...args: any[]) => void>(fn: T, wait = 200) => {
    let t: ReturnType<typeof setTimeout> | undefined;
    return (...args: Parameters<T>) => {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };
  const debouncedTriggerPhone = useMemo(() => debounce(() => trigger('phone'), 200), [trigger]);
  const debouncedTriggerCnpj = useMemo(() => debounce(() => trigger('cnpj'), 200), [trigger]);

  const onSubmit = (data: BasicDataFormData) => {
    const cleaned = {
      ...data,
      phone: (data.phone || '').replace(/\D/g, ''),
      cnpj: (data.cnpj || '').replace(/\D/g, ''),
    };
    sessionStorage.setItem('basicData', JSON.stringify(cleaned))
    navigate("/projeto");
  };

  // Carrega munícipios quando já temos UF inicial (reidratação)
  useEffect(() => {
    if (selectedState) getMunicipalities(selectedState);
  }, [selectedState]);

  // Aplica clientcity somente após lista carregada para garantir que exista nas opções
  useEffect(() => {
    const savedCity = (basicDefaults?.defaults?.clientcity as string) || '';
    if (!selectedState || !savedCity) return;
    const list = municipalities?.data as any[] | undefined;
    if (Array.isArray(list) && list.some((c) => c?.nome === savedCity)) {
      setValue('clientcity', savedCity, { shouldValidate: true });
    }
  }, [municipalities, selectedState, setValue]);

  async function getMunicipalities(UF:string){
    try{
      if(!UF) return;
      console.log('fui chamada!', UF)
      const ufList = await axios.get(
        `https://brasilapi.com.br/api/ibge/municipios/v1/${encodeURIComponent(UF)}?providers=dados-abertos-br,gov,wikipedia`
      )
      console.log('UFLIST: ',ufList)
      setMunicipalities(ufList)
    }catch(err){
      console.warn('Falha ao buscar municípios (ignorado):', err)
      // Mantém estrutura compatível com uso atual (municipalities.data?.map)
      setMunicipalities({ data: [] })
    }
  }

  console.log('municipios: ', municipalities)

  console.log('municipio: ',watch('clientcity'))
  console.log('Estado: ', watch('uf'))
  

  return (
    <FormLayout>
      <div className="max-w-6xl mx-auto w-full p-8">
        <div className="lg:flex lg:gap-12">
          <Stepper currentStep={1} />
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-8">Simulador de FNO</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div style={{display:'flex', gap:'10px', width: '100%'}}>
            <div style={{width:'50%'}}>
              <Label htmlFor="name">Qual é o seu nome?</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="José"
                className="mt-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div style={{width:'50%'}}>
              <Label htmlFor="name">Qual é o seu último nome?</Label>
              <Input
                id="name"
                {...register("lastname")}
                placeholder="silva"
                className="mt-2"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="companyName">Qual é o nome da sua empresa?</Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="Monetare Corporate"
              className="mt-2"
            />
            {errors.companyName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cnpj">Qual é o CNPJ da sua empresa?</Label>
            <Input
              id="cnpj"
              {...register("cnpj")}
              value={watch('cnpj') || ''}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '');
                const formatted = formatCnpj(digits);
                setValue('cnpj', formatted, { shouldDirty: true });
                debouncedTriggerCnpj();
              }}
              placeholder="00.000.000/0000-00"
              className="mt-2"
            />
            {errors.cnpj && (
              <p className="text-red-500 text-sm mt-1">{errors.cnpj.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="email">E-mail de contato</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="contato@monetare.com.br"
                className="mt-2"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={watch('phone') || ''}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  const formatted = formatPhone(digits);
                  setValue('phone', formatted, { shouldDirty: true });
                  debouncedTriggerPhone();
                }}
                placeholder="11 9 9999-9999"
                className="mt-2"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="uf">Estado</Label>
              <Select
                value={watch('uf') || undefined}
                onValueChange={(value) => {
                  setValue("uf", value, { shouldDirty: true, shouldValidate: true });
                  setSelectedState(value);
                  getMunicipalities(value)
                  setValue("clientcity", '', { shouldDirty: true, shouldValidate: true });
                  trigger("clientcity");

                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((state) => (
                    <SelectItem key={state.value} value={state.value}>
                      {state.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.uf && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.uf.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="clientcity">Município</Label>
              <Select
                onValueChange={(value) => {
                  setValue("clientcity", value, { shouldDirty: true, shouldValidate: true })
                }}
                disabled={!selectedState}
                value={watch('clientcity') || undefined}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o município" />
                </SelectTrigger>
                <SelectContent>
                  {selectedState &&
                    municipalities.data?.map((city:any) => (
                      <SelectItem key={city.codigo_ibge} value={city.nome}>
                        {city.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* garante registro dos campos para validação do RHF */}
              <input type="hidden" {...register("uf")} />
              <input type="hidden" {...register("clientcity")} />
              {errors.clientcity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.clientcity.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!isValid}
              className="bg-green-500 hover:bg-green-600 text-white px-8"
            >
              Seguir <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}
