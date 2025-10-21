const fs = require("fs");
const path = require("path");

const CSV_PATH = path.resolve(__dirname, "../attached_assets/municipios_rates.csv");
const OUT_PATH = path.resolve(__dirname, "../shared/municipalities.ts");

function detectDelimiter(headerLine) {
  const comma = (headerLine.match(/,/g) || []).length;
  const semi  = (headerLine.match(/;/g) || []).length;
  return semi > comma ? ";" : ",";
}

function splitSafe(line, delimiter) {
  // simples e rápido: funciona se não houver vírgula/; dentro de aspas
  // se seu CSV tiver valores com vírgula/; entre aspas, use uma lib (PapaParse/csv-parse)
  return line.split(delimiter);
}

function main() {
  let text = fs.readFileSync(CSV_PATH, "utf8");
  text = text.replace(/^\uFEFF/, ""); // remove BOM se houver
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) throw new Error("CSV vazio.");

  const header = lines[0];
  const delimiter = detectDelimiter(header);
  const headers = splitSafe(header, delimiter).map(h => h.trim());
  const norm = (s) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const normalized = headers.map(norm);
  const idxUF = headers.findIndex(h => /^(uf|estado)$/i.test(h));
  const idxCity = headers.findIndex(h => /^(munic[ií]pio|municipio|cidade)$/i.test(h));
  const idxRate = normalized.indexOf('annualratepct');
  if (idxUF === -1 || idxCity === -1) {
    throw new Error(`Cabeçalhos esperados não encontrados. Headers: ${headers.join(", ")}`);
  }

  /** @type {Record<string, {city: string, rate:number}[]>} */
  const map = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = splitSafe(lines[i], delimiter);
    const uf = (cols[idxUF] || "").trim().toUpperCase();
    const city = (cols[idxCity] || "").trim();
    const rate = (() => {
      const raw = (cols[idxRate] || '').trim().replace(',', '.');
      const n = Number(raw);
      return Number.isFinite(n) ? n : null;
    })();
    if (!uf || !city || !rate) continue;

    if (!map[uf]) map[uf] = [];
    map[uf].push({city: city, rate: rate});
  }

  // normalização: dedup + ordenação
  // for (const uf of Object.keys(map)) {
  //   // const unique = Array.from(new Set(map[uf]));
  //   map[uf] = [...byName.values()].sort((a, b) =>
  //     a.city.localeCompare(b.city, 'pt-BR')
  //   );
  // }
  for (const uf of Object.keys(map)) {
    const byName = new Map();
    for (const item of map[uf]) {
      const key = (item.city || '').trim().toLowerCase();
      if (!key) continue;
      if (!byName.has(key)) byName.set(key, item); // mantém o primeiro, descarta duplicatas
      }
      map[uf] = [...byName.values()].sort((a, b) =>
      a.city.localeCompare(b.city, 'pt-BR')
    );
  }


  const file = [
    "/* Auto-generated. Do not edit manually. */",
    `export const municipalities: Record<string, {city:string, rate:number}[]> = ${JSON.stringify(map, null, 2)} as const;`,
    "export type UF = keyof typeof municipalities;",
    ""
  ].join("\n");

  fs.writeFileSync(OUT_PATH, file, "utf8");
  console.log(`Gerado: ${OUT_PATH}`);
}

main();