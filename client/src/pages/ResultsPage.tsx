import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FormLayout } from "@/components/FormLayout";

interface SimulationResult {
  companySize: string;
  priorityMunicipality: boolean;
  interestRate: string;
  financedValue: number;
  totalPaid: number;
  firstInstallment: number;
  totalInterest: number;
}

export function ResultsPage() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    const savedResult = localStorage.getItem("simulationResult");
    if (savedResult) {
      setResult(JSON.parse(savedResult));
    } else {
      navigate("/");
    }
  }, [navigate]);

  if (!result) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <FormLayout>
      <div className="max-w-4xl mx-auto w-full p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                ✓
              </div>
              <span className="text-green-600 font-semibold">Dados básicos</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-500"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                ✓
              </div>
              <span className="text-green-600 font-semibold">Seu projeto</span>
            </div>
            <div className="flex-1 h-0.5 bg-green-500"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-semibold">
                3
              </div>
              <span className="text-green-600 font-semibold">Resultado</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4">Resultado</h1>

          <div className="flex gap-2 mb-8">
            <span className="px-4 py-1 bg-green-800 text-white rounded-full text-sm">
              {result.companySize}
            </span>
            {result.priorityMunicipality && (
              <span className="px-4 py-1 bg-green-800 text-white rounded-full text-sm">
                Município Prioritário
              </span>
            )}
            <span className="px-4 py-1 border border-gray-300 rounded-full text-sm">
              Taxa de juros: {result.interestRate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(result.financedValue)}
            </p>
            <p className="text-gray-600">Valor financiado</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(result.totalPaid)}
            </p>
            <p className="text-gray-600">Total pago</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(result.firstInstallment)}
            </p>
            <p className="text-gray-600">Primeira parcela após carência</p>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-3xl font-bold mb-2">
              {formatCurrency(result.totalInterest)}
            </p>
            <p className="text-gray-600">Total de juros</p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button className="bg-green-500 hover:bg-green-600 text-white px-8">
            <Download className="mr-2 h-4 w-4" />
            Baixar simulação completa
          </Button>
        </div>
      </div>
    </FormLayout>
  );
}
