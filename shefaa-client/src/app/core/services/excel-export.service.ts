import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface SheetData {
  name: string;
  rows: Record<string, any>[];
}

@Injectable({ providedIn: 'root' })
export class ExcelExportService {

  exportMultiSheet(fileName: string, sheets: SheetData[]) {
    const wb = XLSX.utils.book_new();
    sheets.forEach(s => {
      if (!s.rows || s.rows.length === 0) return;
      const ws = XLSX.utils.json_to_sheet(s.rows);
      this.autoWidth(ws, s.rows);
      XLSX.utils.book_append_sheet(wb, ws, this.truncateSheetName(s.name));
    });
    if (wb.SheetNames.length === 0) return;
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  exportSingleSheet(fileName: string, sheetName: string, rows: Record<string, any>[]) {
    this.exportMultiSheet(fileName, [{ name: sheetName, rows }]);
  }

  private autoWidth(ws: XLSX.WorkSheet, rows: Record<string, any>[]) {
    if (rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const colWidths = keys.map(k => {
      let max = k.length;
      rows.forEach(r => {
        const v = r[k];
        const len = v != null ? String(v).length : 0;
        if (len > max) max = len;
      });
      return { wch: Math.min(max + 2, 50) };
    });
    ws['!cols'] = colWidths;
  }

  private truncateSheetName(name: string): string {
    return name.substring(0, 31).replace(/[\\\/\?\*\[\]]/g, '');
  }
}
