import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from 'axios';

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
      if (annualRevenue > 4800000) {
        companySize = "Médio Porte";
      } else if (annualRevenue > 300000001) {
        companySize = "Grande Porte";
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

  app.post("/api/real-simulate", async (req, res)=>{
    try{
      const {
        annualRevenue,
        financedValue,
        termMonths,
        projectValue,
        graceMonths,
        state,
        municipality,
        indice,
        amortization,
        punctualityDiscount,
        isPriority,
        creditType,
        email,
        name,
        phone,
        lastname = '',
        cnpj,
        uf='',
        clientcity='',
        companyName,
        activitySector,
      } = req.body;

      if (graceMonths >= termMonths) {
        return res.status(400).json({ 
          message: "O prazo de carência deve ser menor que o prazo total do financiamento" 
        });
      }

      const ModalityEnum={
        'INVESTIMENTO':382878,
        'CAPITAL DE GIRO':382880,
        'INFRA,ÁGUA, ESGOTO E LOGÍSTICA':382882,
        'INFRA- OUTROS':382884,
        'INOVAÇÃO':382886,
      }

      const ActivityEnum={
        'INDÚSTRIA':382866,
        'COMÉRCIO':382868,
        'INFRA-ESTRUTURA':382870,
        'SERVIÇO':382872,
        'AGRO-INDÚSTRIA':382874,
        'TURISMO':382876,
      }

      const headerOptions = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }

      const idRequestModel = {
        NAME: name,
        LAST_NAME:lastname,
        ASSIGNED_BY_ID:1,
        PHONE: [ { "VALUE": phone, "VALUE_TYPE": "WORK" } ],
        EMAIL: [ { "VALUE": email, "VALUE_TYPE": "WORK" } ]
      }

      const requestModel = {
        produto: 'FNO',
        modalidade: creditType,
        rateMode: indice,
        bonusPontualidade: punctualityDiscount,
        prioridade: isPriority? 'PRIORITARIA':'NAO-PRIORITARIA',
        receitaBruta: annualRevenue,
        principal: financedValue,
        valorOperacao: projectValue,
        uf:state,
        municipio: municipality,
        termMonths: termMonths,
        graceMonths: graceMonths,
        graceType: 'juros',
        system: amortization,
        indexAnnualPct: 4.5,
      }

      const registerLeadModel = {
       "CATEGORY_ID":22, // pipeline da simulacao
       "TITLE": companyName, //nome da empresa
       "CONTACT_ID":6862, // id do contato
       "OPPORTUNITY": financedValue, // valor de financiamento
       "UF_CRM_1760982741839": projectValue, // valor do projeto
       "UF_CRM_1760982727361": annualRevenue, // receita bruta anual
       "UF_CRM_1760967847179":381054, // produto fno
       "UF_CRM_1760974166876":ActivityEnum[activitySector], //Setor de atividade //
       "UF_CRM_1760974240379":ModalityEnum[creditType], //Modalidade
       "UF_CRM_1760971032916":cnpj, //cnpj
       "UF_CRM_1741714176":termMonths, //prazo
       "UF_CRM_1760982425927":uf, //estado da empresa
       "UF_CRM_1760982465335":clientcity,
       "UF_CRM_1760974905323":state, //estado do projeto
       "UF_CRM_1760975444118":municipality //municio do projeto
    }


    console.log('requestModel: ', requestModel)
    
    const {data: idResult} = await axios.post('https://portal.monetare.com.br/rest/1/hsj2c13wxcl1rb7x/crm.contact.add.json', idRequestModel, headerOptions)

    console.log('idResult: ', idResult)


    const {data: result} = await axios.post('https://monetare-corporate.web.app/simulate', requestModel, headerOptions)
    
    console.log('Result: ', result)
    return res.json(result)


    }catch(err){
      if (axios.isAxiosError(err)) {
        const status = err.response?.status ?? 502;
        return res.status(status).json({
          message: 'Erro no serviço de simulação',
          detail: err.response?.data ?? err.message,
        });
      }
      
      console.error('Erro na simulação:', err);
      
      return res.status(500).json({ message: 'Erro interno na simulação' });
    }
  })

  const httpServer = createServer(app);

  return httpServer;
}
