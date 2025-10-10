import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SimulationResult {
  companySize: string;
  priorityMunicipality: boolean;
  interestRate: string;
  financedValue: number;
  totalPaid: number;
  firstInstallment: number;
  totalInterest: number;
}

interface SimulationData {
  name: string;
  companyName: string;
  cnpj: string;
  email: string;
  phone: string;
  municipality: string;
  activitySector: string;
  creditType: string;
  annualRevenue: number;
  projectValue: number;
  financedValue: number;
  termMonths: number;
  graceMonths: number;
}

interface PaymentScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function generatePDF(result: SimulationResult, data: SimulationData) {
  const doc = new jsPDF();
  
  // Cores da plataforma
  const primaryGreen: [number, number, number] = [16, 185, 129]; // #10b981
  const darkGreen: [number, number, number] = [5, 122, 85]; // Verde escuro
  const textGray: [number, number, number] = [55, 65, 81]; // Cinza do texto
  
  // Cabeçalho
  doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Simulação de Financiamento FNO", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Monetare Corporate", 105, 30, { align: "center" });
  
  // Reset para texto normal
  doc.setTextColor(textGray[0], textGray[1], textGray[2]);
  
  let yPos = 50;
  
  // Dados do Cliente
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Dados do Cliente", 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${data.name}`, 14, yPos);
  yPos += 6;
  doc.text(`Empresa: ${data.companyName}`, 14, yPos);
  yPos += 6;
  doc.text(`CNPJ: ${data.cnpj}`, 14, yPos);
  yPos += 6;
  doc.text(`Email: ${data.email}`, 14, yPos);
  yPos += 6;
  doc.text(`Telefone: ${data.phone}`, 14, yPos);
  yPos += 6;
  doc.text(`Município: ${data.municipality}`, 14, yPos);
  yPos += 12;
  
  // Informações do Financiamento
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do Financiamento", 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Porte da Empresa: ${result.companySize}`, 14, yPos);
  yPos += 6;
  doc.text(`Setor de Atividade: ${data.activitySector}`, 14, yPos);
  yPos += 6;
  doc.text(`Modalidade: ${data.creditType}`, 14, yPos);
  yPos += 6;
  doc.text(`Taxa de Juros: ${result.interestRate}`, 14, yPos);
  yPos += 6;
  if (result.priorityMunicipality) {
    doc.text(`Município Prioritário: Sim (desconto aplicado)`, 14, yPos);
    yPos += 6;
  }
  yPos += 6;
  
  // Resumo Financeiro
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro", 14, yPos);
  yPos += 10;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Valor do Projeto: ${formatCurrency(data.projectValue)}`, 14, yPos);
  yPos += 6;
  doc.text(`Valor Financiado: ${formatCurrency(result.financedValue)}`, 14, yPos);
  yPos += 6;
  doc.text(`Prazo Total: ${data.termMonths} meses`, 14, yPos);
  yPos += 6;
  doc.text(`Carência: ${data.graceMonths} meses`, 14, yPos);
  yPos += 6;
  doc.text(`Primeira Parcela após Carência: ${formatCurrency(result.firstInstallment)}`, 14, yPos);
  yPos += 6;
  doc.text(`Total a Pagar: ${formatCurrency(result.totalPaid)}`, 14, yPos);
  yPos += 6;
  doc.text(`Total de Juros: ${formatCurrency(result.totalInterest)}`, 14, yPos);
  yPos += 12;
  
  // Calcular cronograma de pagamentos
  const paymentSchedule = calculatePaymentSchedule(
    result.financedValue,
    data.termMonths,
    data.graceMonths,
    parseFloat(result.interestRate.split('%')[0])
  );
  
  // Nova página para a tabela
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Cronograma de Pagamentos", 14, yPos);
  yPos += 10;
  
  // Tabela de pagamentos
  const tableData = paymentSchedule.map(row => [
    row.month.toString(),
    formatCurrency(row.payment),
    formatCurrency(row.principal),
    formatCurrency(row.interest),
    formatCurrency(row.balance),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Mês', 'Parcela', 'Amortização', 'Juros', 'Saldo Devedor']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    margin: { left: 14, right: 14 },
  });
  
  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `© ${new Date().getFullYear()} Monetare Corporate - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // Salvar o PDF
  const fileName = `simulacao_${data.companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

function calculatePaymentSchedule(
  financedValue: number,
  termMonths: number,
  graceMonths: number,
  annualRate: number
): PaymentScheduleRow[] {
  const schedule: PaymentScheduleRow[] = [];
  const monthlyRate = annualRate / 100 / 12;
  const effectiveTermMonths = termMonths - graceMonths;
  
  // Cálculo da parcela usando o sistema Price (parcelas fixas)
  const installment = financedValue * (monthlyRate * Math.pow(1 + monthlyRate, effectiveTermMonths)) / 
                      (Math.pow(1 + monthlyRate, effectiveTermMonths) - 1);
  
  let balance = financedValue;
  
  // Período de carência (apenas juros)
  for (let i = 1; i <= graceMonths; i++) {
    const interest = balance * monthlyRate;
    schedule.push({
      month: i,
      payment: interest,
      principal: 0,
      interest: interest,
      balance: balance,
    });
  }
  
  // Período de amortização
  for (let i = graceMonths + 1; i <= termMonths; i++) {
    const interest = balance * monthlyRate;
    const principal = installment - interest;
    balance -= principal;
    
    schedule.push({
      month: i,
      payment: installment,
      principal: principal,
      interest: interest,
      balance: Math.max(0, balance), // Evita valores negativos por aproximação
    });
  }
  
  return schedule;
}
