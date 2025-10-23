import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Shape of API result from /api/real-simulate
export interface ApiScheduleRow {
  month: number;
  installment: number;
  interest: number;
  amortization: number;
  indexAdj: number;
  balance: number;
}

export interface ApiResult {
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
    taxaAplicadaAnual: number; // percent per year
    taxaMensalPct: number; // percent per month
    indexMonthlyPct: number;
  };
  schedule: ApiScheduleRow[];
  firstInstallment: number;
  totalPaid: number;
  totalInterest: number;
  endingBalance: number;
}

export interface SimulationData {
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

const colors = {
  brand: [14, 101, 69] as [number, number, number], // dark green
  brandLight: [227, 242, 236] as [number, number, number],
  text: [22, 28, 45] as [number, number, number],
  muted: [108, 114, 128] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
};

const currency = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0);

const formatPct = (n: number) => `${n.toFixed(2).replace(".", ",")}%`;

export function generatePDF(api: ApiResult, data: SimulationData) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...colors.text);

  // Header
  doc.setFillColor(...colors.brandLight);
  doc.rect(0, 0, 210, 18, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...colors.brand);
  doc.text("monetare", 14, 12);
  doc.setTextColor(...colors.text);

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo da sua simulação", 14, 32);

  // Summary card (left)
  const leftX = 14;
  const leftY = 38;
  const leftW = 100;
  const leftH = 80;
  doc.setDrawColor(...colors.border);
  doc.roundedRect(leftX, leftY, leftW, leftH, 2, 2, "S");

  const items = [
    { label: "Valor financiado", value: currency(data.financedValue) },
    { label: "Total pago", value: currency(api.totalPaid) },
    {
      label: "Primeira parcela após a carência",
      value: currency(api.firstInstallment),
    },
    {
      label: `Taxa de juros${api.entrada.rateMode === "PRE" ? " (Pré-fixada)" : " (Pós-fixada)"}`,
      value: `${formatPct(api.taxas.taxaAplicadaAnual)} a.a.`,
    },
  ];

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  let y = leftY + 16;
  items.forEach((it, idx) => {
    const chipH = 8;
    doc.text(it.value, leftX + 6, y);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.muted);
    doc.text(it.label, leftX + 6, y + 5);
    doc.setTextColor(...colors.text);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    // Add chip for rate mode on the last line
    if (idx === items.length - 1) {
      const modeText = api.entrada.rateMode === "POS" ? "Pós-fixada" : "Pré-fixada";
      const chipW = doc.getTextWidth(modeText) - 6;
      const chipX = leftX + 6 + doc.getTextWidth(it.value) + 2;
      const chipY = y - 2;
      const chipTop = y - 6;

      doc.setFillColor(...colors.brand);
      doc.roundedRect(chipX, chipY - 5, chipW, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      const textX = chipX + chipW / 2;
      const textY = chipTop + chipH / 2;
      doc.text(modeText, textX, textY, { align: "center"});
      doc.setTextColor(...colors.text);
      doc.setFontSize(20);
    }
    y += 18;
  });

  // Right info panel
  const rightX = 120;
  const rightY = 38;
  const rightW = 76;
  const rightH = 80;
  doc.roundedRect(rightX, rightY, rightW, rightH, 2, 2, "S");

  const chip = (text: string, x: number, y: number, color: [number, number, number]) => {
    doc.setDrawColor(...color);
    doc.setFillColor(...color);
    const w = doc.getTextWidth(text) + 8;
    doc.roundedRect(x, y - 5, w, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(text, x + 4, y);
    doc.setTextColor(...colors.text);
  };

  let ry = rightY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Empresa`, rightX + 6, ry); ry += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(data.companyName || "—", rightX + 6, ry); ry += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`CNPJ`, rightX + 6, ry); ry += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(data.cnpj || "—", rightX + 6, ry); ry += 8;
  if (api.entrada.prioridade === "PRIORITARIA") {
    chip("Município Prioritário", rightX + 6, ry, colors.brand); ry += 12;
  }
  if (api.entrada.bonusPontualidade) { chip("Desconto de Pontualidade", rightX + 6, ry, colors.brand); ry += 12; }
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Receita Bruta Anual`, rightX + 6, ry); ry += 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text(currency(data.annualRevenue), rightX + 6, ry); ry += 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  doc.text(`Setor de atividade`, rightX + 6, ry); ry += 5;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text(data.activitySector || "—", rightX + 6, ry); ry += 8;

  // Second block under the two panels
  const secondY = leftY + leftH + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Cronograma de parcelas", leftX, secondY);

  // Table with schedule
  const body = (api.schedule || []).map((r) => [
    r.month,
    currency(r.installment),
    currency(r.interest),
    currency(r.amortization),
    currency(r.balance),
  ]);

  autoTable(doc, {
    startY: secondY + 4,
    head: [["Mês", "Parcela (R$)", "Juros (R$)", "Amortização (R$)", "Saldo devedor (R$)"]],
    body,
    theme: "grid",
    headStyles: { fillColor: colors.brand, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: leftX, right: leftX },
    columnStyles: { 0: { cellWidth: 14 } },
  });

  // Footer for every page
  const pageCount = doc.getNumberOfPages();
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(...colors.muted);
    doc.text(`Simulação feita em ${dd}/${mm}/${yyyy}. Válida por 5 dias.`, 14, 290);
    doc.text(`${i}/${pageCount}`, 105, 290, { align: "center" });
    doc.text(`© ${yyyy} Monetare Corporate LTDA`, 196, 290, { align: "right" });
  }

  const fileName = `simulacao_${(data.companyName || "empresa")
    .toString()
    .replace(/\s+/g, "_")}_${yyyy}-${mm}-${dd}.pdf`;
  doc.save(fileName);
}
