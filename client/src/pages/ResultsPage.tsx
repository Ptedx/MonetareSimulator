import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FormLayout } from "@/components/FormLayout";
import { Stepper } from "@/components/Stepper";
import { generatePDF } from "@/lib/pdfGenerator";

// API result (from /api/real-simulate)
interface ApiScheduleRow {
  month: number;
  installment: number;
  interest: number;
  amortization: number;
  indexAdj: number;
  balance: number;
}

interface ApiResult {
  entrada: {
    produto: string;
    rateMode: "PRE" | "POS";
    bonusPontualidade: boolean;
    prioridade: "PRIORITARIA" | "NAO-PRIORITARIA";
    modalidade: string;
    uf: string;
    municipio: string;
  };
  taxas: {
    taxaMunicipio: number;
    taxaAplicadaAnual: number;
    taxaMensalPct: number;
    indexMonthlyPct: number;
  };
  schedule: ApiScheduleRow[];
  firstInstallment: number;
  totalPaid: number;
  totalInterest: number;
  endingBalance: number;
}

interface SimulationData {
  name: string;
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  municipality: string; // project city
  activitySector: string;
  creditType: string;
  annualRevenue: number;
  projectValue: number;
  financedValue: number;
  termMonths: number;
  graceMonths: number;
  state?: string;
}

export function ResultsPage() {
  const [, navigate] = useLocation();
  const [apiResult, setApiResult] = useState<ApiResult | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  useEffect(() => {
    const savedResult = sessionStorage.getItem("simulationResult");
    const savedData = sessionStorage.getItem("simulationData");

    if (savedResult && savedData) {
      setApiResult(JSON.parse(savedResult));
      setSimulationData(JSON.parse(savedData));
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Hooks must be called unconditionally; compute derived values with safe defaults
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value ?? 0
    );

  const companySize = useMemo(() => {
    const rev = Number(simulationData?.annualRevenue ?? 0);
    if (rev > 300_000_000) return "Grande Porte";
    if (rev > 4_800_000) return "Médio Porte";
    return "Pequeno Porte";
  }, [simulationData?.annualRevenue]);

  if (!apiResult || !simulationData) {
    return null;
  }

  const isPriority = apiResult.entrada.prioridade === "PRIORITARIA";
  const rateText = `${apiResult.taxas.taxaAplicadaAnual
    .toFixed(2)
    .replace(".", ",")}% a.a.${
    apiResult.entrada.rateMode === "POS" ? " + IPCA (PÓS-FIXADA)" : " (PRÉ-FIXADA)"
  }`;

  const handleDownloadPDF = () => {
    generatePDF(apiResult, simulationData);
  };

  return (
    <FormLayout>
      <div className="max-w-6xl mx-auto w-full p-8">
        <div className="lg:flex lg:gap-12">
          <Stepper currentStep={3} />

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">Resultado</h1>

            <div className="flex gap-2 mb-8 flex-wrap">
              <span className="px-4 py-1 bg-green-800 text-white rounded-full text-sm">
                {companySize}
              </span>
              {isPriority && (
                <span className="px-4 py-1 bg-green-800 text-white rounded-full text-sm">
                  Município Prioritário
                </span>
              )}
              <span className="px-4 py-1 border border-gray-300 rounded-full text-sm">
                Taxa de juros: {rateText}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <p className="text-3xl font-bold mb-2">
                  {formatCurrency(simulationData.financedValue)}
                </p>
                <p className="text-gray-600">Valor financiado</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <p className="text-3xl font-bold mb-2">
                  {formatCurrency(apiResult.totalPaid)}
                </p>
                <p className="text-gray-600">Total pago</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <p className="text-3xl font-bold mb-2">
                  {formatCurrency(apiResult.firstInstallment)}
                </p>
                <p className="text-gray-600">Primeira parcela após carência</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <p className="text-3xl font-bold mb-2">
                  {formatCurrency(apiResult.totalInterest)}
                </p>
                <p className="text-gray-600">Total de juros</p>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleDownloadPDF}
                className="bg-green-500 hover:bg-green-600 text-white px-8"
                data-testid="button-download-pdf"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar simulação completa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </FormLayout>
  );
}

