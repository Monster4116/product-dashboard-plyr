const EXCELJS_CDN_URL = 'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js';

const flattenValue = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(flattenValue).join(' | ');
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (typeof value === 'number') return Number.isFinite(value) ? value : '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const flattenRow = (row, prefix = '', output = {}) => {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return output;

  Object.entries(row).forEach(([key, value]) => {
    const columnKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      flattenRow(value, columnKey, output);
      return;
    }

    output[columnKey] = flattenValue(value);
  });

  return output;
};

const normalizeRows = (rows = []) => (
  Array.isArray(rows)
    ? rows.map((row) => flattenRow(row))
    : []
);

const columnNumberToName = (index) => {
  let value = index;
  let output = '';

  while (value > 0) {
    const remainder = (value - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    value = Math.floor((value - 1) / 26);
  }

  return output || 'A';
};

const collectColumns = (rows) => {
  const seen = new Set();

  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => seen.add(key));
  });

  return [...seen];
};

const toCsvCell = (value) => {
  const cell = flattenValue(value);
  const escaped = cell.replace(/"/g, '""');
  return `"${escaped}"`;
};

const downloadBlob = (blob, filename) => {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(href), 0);
};

const buildCsvString = (rows) => {
  const normalizedRows = normalizeRows(rows);
  const columns = collectColumns(normalizedRows);

  if (!columns.length) {
    return '';
  }

  const lines = [
    columns.map(toCsvCell).join(','),
    ...normalizedRows.map((row) => columns.map((column) => toCsvCell(row[column] ?? '')).join(',')),
  ];

  return lines.join('\n');
};

const loadExcelJs = async () => {
  if (window.ExcelJS) return window.ExcelJS;

  await new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dashboard-export="exceljs"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load the XLSX export library.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = EXCELJS_CDN_URL;
    script.async = true;
    script.dataset.dashboardExport = 'exceljs';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load the XLSX export library.'));
    document.head.appendChild(script);
  });

  if (!window.ExcelJS) {
    throw new Error('The XLSX export library loaded without exposing ExcelJS.');
  }

  return window.ExcelJS;
};

const applyWorksheetTheme = (worksheet, columns, title = '') => {
  worksheet.views = [{ state: 'frozen', ySplit: title ? 2 : 1 }];
  const finalColumnName = columnNumberToName(Math.max(columns.length, 1));
  worksheet.autoFilter = title
    ? { from: 'A2', to: `${finalColumnName}2` }
    : { from: 'A1', to: `${finalColumnName}1` };

  if (title) {
    worksheet.mergeCells(1, 1, 1, Math.max(columns.length, 1));
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = { name: 'Poppins', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = {
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: 'FF20124C' } },
        { position: 0.42, color: { argb: 'FF4A0FC8' } },
        { position: 1, color: { argb: 'FF2D8DE1' } },
      ],
    };
    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };
    worksheet.getRow(1).height = 24;
  }

  const headerRow = worksheet.getRow(title ? 2 : 1);
  headerRow.font = { name: 'Poppins', size: 10, bold: true, color: { argb: 'FF49454F' } };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F6F7' } };
  headerRow.border = {
    bottom: { style: 'thin', color: { argb: 'FFE9E9EA' } },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'left' };
  headerRow.height = 20;

  columns.forEach((column, index) => {
    const width = Math.min(
      40,
      Math.max(
        column.length + 2,
        ...worksheet.getColumn(index + 1).values
          .slice(title ? 2 : 1)
          .map((value) => String(value || '').length + 2),
      ),
    );

    worksheet.getColumn(index + 1).width = width;
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber <= (title ? 2 : 1)) return;
    row.font = { name: 'Poppins', size: 10, color: { argb: 'FF1D1B20' } };
    row.alignment = { vertical: 'top', wrapText: true };
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FFE9E9EA' } },
      };
    });
  });
};

export const exportRowsAsCsv = ({ rows, filename }) => {
  const csv = buildCsvString(rows);

  if (!csv) {
    throw new Error('There are no rows available to export.');
  }

  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), filename);
};

export const exportWorkbookAsXlsx = async ({ sheets, filename, title }) => {
  const ExcelJS = await loadExcelJs();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Product One dashboard';
  workbook.created = new Date();

  const validSheets = (Array.isArray(sheets) ? sheets : []).filter((sheet) => Array.isArray(sheet.rows) && sheet.rows.length);

  if (!validSheets.length) {
    throw new Error('There are no rows available to export.');
  }

  validSheets.forEach((sheet, index) => {
    const normalizedRows = normalizeRows(sheet.rows);
    const columns = collectColumns(normalizedRows);
    const worksheet = workbook.addWorksheet((sheet.name || `Sheet ${index + 1}`).slice(0, 31));

    worksheet.columns = columns.map((column) => ({
      header: column,
      key: column,
    }));
    worksheet.addRows(normalizedRows);
    applyWorksheetTheme(worksheet, columns, index === 0 ? title : sheet.title || '');
  });

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    filename,
  );
};

export default {
  exportRowsAsCsv,
  exportWorkbookAsXlsx,
};
