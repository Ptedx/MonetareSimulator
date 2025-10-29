import { ActivityEnum, headerOptions, ModalityEnum } from "@/components/enum"
import axios from "axios"

interface FullData {
  annualRevenue: number;
  financedValue: number;
  termMonths: number;
  projectValue: number;
  graceMonths: number;
  state: string;
  municipality: string;
  indice: string;
  amortization: string;
  punctualityDiscount: boolean;
  isPriority: boolean;
  creditType: string;
  email: string;
  name: string;
  phone: string;
  lastname?: string;  
  cnpj: string;
  uf?: string;
  clientcity?: string;
  companyName: string;
  activitySector: string;
}

export async function simulateResult({
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
    uf = '',
    clientcity = '',
    companyName,
    activitySector,
    }: FullData){

    const idRequestModel = {
        fields:{
        NAME: name,
        LAST_NAME:lastname,
        ASSIGNED_BY_ID:1,
        PHONE: [ { "VALUE": phone, "VALUE_TYPE": "WORK" } ],
        EMAIL: [ { "VALUE": email, "VALUE_TYPE": "WORK" } ]
      }}

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

    try{
        const {data: idResult} = await axios.post('https://portal.monetare.com.br/rest/1/hsj2c13wxcl1rb7x/crm.contact.add.json', idRequestModel, headerOptions)
        
        const registerLeadModel = {
            fields: {
            "CATEGORY_ID":22, // pipeline da simulacao
            "TITLE": companyName, //nome da empresa
            "CONTACT_ID": idResult?.result, // id do contato
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
        }}

        console.log('idResult: ', idResult)
    
        const {data: CRMResult} = await axios.post('https://portal.monetare.com.br/rest/34/xyq8gr4wpy4i7mwb/crm.deal.add.json', registerLeadModel, headerOptions)
        

        const {data: result} = await axios.post('https://monetare-corporate.web.app/simulate', requestModel, headerOptions)
        
        console.log('Result: ', result)
        console.log('CRMResult: ', CRMResult)

        return result
    
    }catch(err){
        alert(`Erro: ${err}`)
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? 502;
            return {status:status, message:`Erro: ${err}`}
        }
      console.error('Erro na simulação:', err);
      
    }    
}