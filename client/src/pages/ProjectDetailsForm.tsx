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
import { Stepper } from "@/components/Stepper";

const projectDetailsSchema = z.object({
  activitySector: z.string().min(1, "Setor de atividade é obrigatório"),
  creditType: z.string().min(1, "Modalidade do crédito é obrigatória"),
  annualRevenue: z.string().min(1, "Receita bruta anual é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  municipality: z.string().min(1, "Município é obrigatório"),
  projectValue: z.string().min(1, "Valor do projeto é obrigatório"),
  financedValue: z.string().min(1, "Valor financiado é obrigatório"),
  termMonths: z.string().min(1, "Prazo em meses é obrigatório"),
  graceMonths: z.string().min(1, "Carência em meses é obrigatória"),
});

type ProjectDetailsFormData = z.infer<typeof projectDetailsSchema>;

const activitySectors = [
  "Indústria",
  "Comércio",
  "Serviços",
  "Agropecuária",
  "Turismo",
];

const creditTypes = [
  "Investimento - Amazônia Empresarial",
  "Investimento - Amazônia Florescer",
  "Capital de Giro",
];

const brazilianStates = [
  { value: "AM", label: "Amazonas" },
  { value: "AC", label: "Acre" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "PA", label: "Pará" },
  { value: "AP", label: "Amapá" },
  { value: "TO", label: "Tocantins" },
];

import { municipalities } from "../../../shared/municipalities";

export function ProjectDetailsForm() {
  const [, navigate] = useLocation();
  const [selectedState, setSelectedState] = useState("");
  const [financedValue, setFinancedValue] = useState("");
  const [projectValue, setProjectValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectDetailsFormData>({
    resolver: zodResolver(projectDetailsSchema),
  });

  const watchedFinancedValue = watch("financedValue");

  const onSubmit = async (data: ProjectDetailsFormData) => {
    const basicData = JSON.parse(localStorage.getItem("basicData") || "{}");
    
    const fullData = {
      ...basicData,
      ...data,
      annualRevenue: parseFloat(data.annualRevenue.replace(/[^\d]/g, "")) / 100,
      projectValue: parseFloat(data.projectValue.replace(/[^\d]/g, "")) / 100,
      financedValue: parseFloat(data.financedValue.replace(/[^\d]/g, "")) / 100,
      termMonths: parseInt(data.termMonths),
      graceMonths: parseInt(data.graceMonths),
    };

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        alert(result.message || "Erro ao calcular simulação");
        return;
      }

      localStorage.setItem("simulationResult", JSON.stringify(result));
      navigate("/resultado");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Erro ao processar a simulação. Por favor, tente novamente.");
    }
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    const formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(numbers) / 100);
    return formatted;
  };

  return (
    <FormLayout>
      <div className="max-w-6xl mx-auto w-full p-8">
        <div className="lg:flex lg:gap-12">
          <Stepper currentStep={2} />
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-8">Simulador de FNO</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="activitySector">Setor de atividade</Label>
            <Select onValueChange={(value) => setValue("activitySector", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {activitySectors.map((sector) => (
                  <SelectItem key={sector} value={sector}>
                    {sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.activitySector && (
              <p className="text-red-500 text-sm mt-1">
                {errors.activitySector.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="creditType">Modalidade do crédito</Label>
            <Select onValueChange={(value) => setValue("creditType", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione a modalidade" />
              </SelectTrigger>
              <SelectContent>
                {creditTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.creditType && (
              <p className="text-red-500 text-sm mt-1">
                {errors.creditType.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="annualRevenue">Receita Bruta Anual</Label>
            <Input
              id="annualRevenue"
              {...register("annualRevenue")}
              onChange={(e) => {
                const formatted = formatCurrency(e.target.value);
                setValue("annualRevenue", formatted);
              }}
              placeholder="R$ 230.000.000,00"
              className="mt-2"
            />
            {errors.annualRevenue && (
              <p className="text-red-500 text-sm mt-1">
                {errors.annualRevenue.message}
              </p>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectValue">Valor do projeto</Label>
              <Input
                id="projectValue"
                {...register("projectValue")}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  setValue("projectValue", formatted);
                  setProjectValue(formatted);
                }}
                placeholder="R$ 170.000.000,00"
                className="mt-2"
              />
              {errors.projectValue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.projectValue.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="financedValue">Valor Financiado</Label>
              <Input
                id="financedValue"
                {...register("financedValue")}
                onChange={(e) => {
                  const formatted = formatCurrency(e.target.value);
                  setValue("financedValue", formatted);
                  setFinancedValue(formatted);
                }}
                placeholder="R$ 170.000.000,00"
                className="mt-2"
              />
              {watchedFinancedValue && (
                <p className="text-sm text-gray-500 mt-1">
                  Limite financiável: {watchedFinancedValue}
                </p>
              )}
              {errors.financedValue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.financedValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="termMonths">Prazo em meses</Label>
              <Input
                id="termMonths"
                type="number"
                {...register("termMonths")}
                placeholder="144"
                className="mt-2"
              />
              {errors.termMonths && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.termMonths.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="graceMonths">Carência em meses</Label>
              <Input
                id="graceMonths"
                type="number"
                {...register("graceMonths")}
                placeholder="24"
                className="mt-2"
              />
              {errors.graceMonths && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.graceMonths.message}
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
        </div>
      </div>
    </FormLayout>
  );
}
