import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/simulate", async (req, res) => {
    try {
      const {
        annualRevenue,
        financedValue,
        termMonths,
        graceMonths,
        municipality,
      } = req.body;

      if (!annualRevenue || annualRevenue <= 0) {
        return res.status(400).json({ message: "Receita bruta anual inválida" });
      }

      if (!financedValue || financedValue <= 0) {
        return res.status(400).json({ message: "Valor financiado inválido" });
      }

      if (!termMonths || termMonths <= 0) {
        return res.status(400).json({ message: "Prazo em meses inválido" });
      }

      if (graceMonths < 0) {
        return res.status(400).json({ message: "Carência em meses inválida" });
      }

      if (graceMonths >= termMonths) {
        return res.status(400).json({ 
          message: "O prazo de carência deve ser menor que o prazo total do financiamento" 
        });
      }

      let companySize = "Pequeno Porte";
      if (annualRevenue > 300000000) {
        companySize = "Grande Porte";
      } else if (annualRevenue > 90000000) {
        companySize = "Médio Porte";
      }

      const priorityMunicipalities = ["Amaturá", "Manaus"];
      const priorityMunicipality = priorityMunicipalities.includes(municipality);

      let baseRate = 7.96;
      if (companySize === "Médio Porte") {
        baseRate = 8.5;
      } else if (companySize === "Grande Porte") {
        baseRate = 9.2;
      }

      if (priorityMunicipality) {
        baseRate -= 0.5;
      }

      const interestRate = `${baseRate.toFixed(2)}% a.a. +IPCA (PÓS-FIXADA)`;

      const monthlyRate = baseRate / 100 / 12;
      
      const effectiveTermMonths = termMonths - graceMonths;
      
      const installment = financedValue * (monthlyRate * Math.pow(1 + monthlyRate, effectiveTermMonths)) / 
                         (Math.pow(1 + monthlyRate, effectiveTermMonths) - 1);

      const totalPaid = installment * effectiveTermMonths;
      const totalInterest = totalPaid - financedValue;

      const result = {
        companySize,
        priorityMunicipality,
        interestRate,
        financedValue,
        totalPaid,
        firstInstallment: installment,
        totalInterest,
      };

      res.json(result);
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ message: "Erro ao calcular simulação" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
