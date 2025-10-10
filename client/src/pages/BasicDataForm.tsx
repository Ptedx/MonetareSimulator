import { useState } from "react";
import { useForm } from "react-hook-form";
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

const basicDataSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(1, "CNPJ é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  state: z.string().min(1, "Estado é obrigatório"),
  municipality: z.string().min(1, "Município é obrigatório"),
});

type BasicDataFormData = z.infer<typeof basicDataSchema>;

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

import { municipalities } from "../../../shared/municipalities";

export function BasicDataForm() {
  const [, navigate] = useLocation();
  const [selectedState, setSelectedState] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BasicDataFormData>({
    resolver: zodResolver(basicDataSchema),
  });

  const onSubmit = (data: BasicDataFormData) => {
    localStorage.setItem("basicData", JSON.stringify(data));
    navigate("/projeto");
  };

  return (
    <FormLayout>
      <div className="max-w-4xl mx-auto w-full p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                1
              </div>
              <span className="text-green-600 font-semibold">Dados básicos</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-semibold">
                2
              </div>
              <span className="text-gray-400">Seu projeto</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-gray-400">Resultado</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-8">Simulador de FNO</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
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
              placeholder="00.000.000-0001/09"
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
                {...register("phone")}
                placeholder="(00) 00000-0000"
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
              <Label htmlFor="state">Estado</Label>
              <Select
                onValueChange={(value) => {
                  setValue("state", value);
                  setSelectedState(value);
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
              {errors.state && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="municipality">Município</Label>
              <Select
                onValueChange={(value) => setValue("municipality", value)}
                disabled={!selectedState}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o município" />
                </SelectTrigger>
                <SelectContent>
                  {selectedState &&
                    municipalities[selectedState]?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.municipality && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.municipality.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-8"
            >
              Seguir <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
