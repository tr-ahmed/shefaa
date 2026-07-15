import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DataService } from '../../core/services/data.service';
import { MedicalRecordDto, PatientDto } from '../../core/models';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, TranslateModule, DatePipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ 'PATIENT.RX_TITLE' | translate }}</h1>
        <p class="page-subtitle">{{ 'PATIENT.RX_SUBTITLE' | translate }}</p>
      </div>
      <div *ngIf="patient()?.medicalRecordNumber" class="text-xs text-slate-500 dark:text-slate-400">
        <span class="font-medium">{{ 'PATIENT.MEDICAL_RECORD_NUMBER' | translate }}:</span>
        <span class="font-mono ms-1">{{ patient()?.medicalRecordNumber }}</span>
      </div>
    </div>

    <div *ngIf="loading()" class="card p-6">{{ 'COMMON.LOADING' | translate }}...</div>

    <div *ngIf="!loading() && records().length === 0" class="empty-state card">
      <mat-icon class="icon">receipt_long</mat-icon>
      <p>{{ 'COMMON.NO_DATA' | translate }}</p>
    </div>

    <div *ngIf="!loading() && records().length > 0" class="space-y-4">
      <article *ngFor="let r of records()" class="card p-5">
        <header class="flex items-start justify-between gap-3 mb-4">
          <div>
            <div class="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-semibold">
              {{ r.recordDate | date:'mediumDate' }}
            </div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white mt-0.5">
              {{ r.recordDate | date:'mediumDate' }} · {{ r.doctorName }}
            </h2>
          </div>
          <div class="flex flex-wrap items-center gap-2 justify-end">
            <span *ngIf="r.followUpRequired" class="badge badge-warning">
              {{ 'DOCTOR_PORTAL.FOLLOW_UP_REQUIRED' | translate }}
            </span>
            <button (click)="downloadRx(r)" type="button"
                    class="btn-primary !py-2 !px-3 text-sm">
              <mat-icon class="text-base">download</mat-icon>
              <span class="ms-1">{{ 'PATIENT.RX_DOWNLOAD_PDF' | translate }}</span>
            </button>
          </div>
        </header>

        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div *ngIf="r.chiefComplaint"><strong>{{ 'DOCTOR_PORTAL.CHIEF_COMPLAINT' | translate }}:</strong> {{ r.chiefComplaint }}</div>
          <div *ngIf="r.diagnosis"><strong>{{ 'DOCTOR_PORTAL.DIAGNOSIS' | translate }}:</strong> {{ r.diagnosis }}</div>
          <div *ngIf="r.symptoms"><strong>{{ 'DOCTOR_PORTAL.SYMPTOMS' | translate }}:</strong> {{ r.symptoms }}</div>
          <div *ngIf="r.treatmentPlan"><strong>{{ 'DOCTOR_PORTAL.TREATMENT_PLAN' | translate }}:</strong> {{ r.treatmentPlan }}</div>
          <div *ngIf="r.investigations"><strong>{{ 'DOCTOR_PORTAL.INVESTIGATIONS' | translate }}:</strong> {{ r.investigations }}</div>
          <div *ngIf="r.notes"><strong>{{ 'DOCTOR_PORTAL.NOTES' | translate }}:</strong> {{ r.notes }}</div>
        </div>

        <div *ngIf="r.prescriptions.length > 0" class="mt-4">
          <h4 class="font-semibold text-sm mb-2 flex items-center gap-1">
            <mat-icon class="text-base text-emerald-600 dark:text-emerald-400">medication</mat-icon>
            {{ 'DOCTOR_PORTAL.PRESCRIPTIONS' | translate }}
          </h4>
          <div class="space-y-2">
            <div *ngFor="let p of r.prescriptions" class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800">
              <div class="font-semibold text-sm">{{ p.medicationName }}</div>
              <div class="text-xs text-slate-600 dark:text-slate-400">
                <span *ngIf="p.dosage">{{ p.dosage }}</span>
                <span *ngIf="p.frequency"> · {{ p.frequency }}</span>
                <span *ngIf="p.duration"> · {{ p.duration }}</span>
                <span *ngIf="p.instructions"> — {{ p.instructions }}</span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="r.attachments.length > 0" class="mt-4">
          <h4 class="font-semibold text-sm mb-2">{{ 'DOCTOR_PORTAL.ATTACHMENTS' | translate }}</h4>
          <div class="space-y-2">
            <a *ngFor="let a of r.attachments" [href]="a.fileUrl" target="_blank" rel="noopener"
               class="flex items-center gap-2 p-2 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm">
              <mat-icon class="text-slate-500 dark:text-slate-400">attach_file</mat-icon>
              <span class="flex-1 truncate">{{ a.fileName }}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400">{{ (a.fileSize / 1024).toFixed(1) }} KB</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  `
})
export class MedicalRecordsComponent implements OnInit {
  private data = inject(DataService);
  private snack = inject(MatSnackBar);
  private translate = inject(TranslateService);

  loading = signal(true);
  patient = signal<PatientDto | null>(null);
  records = signal<MedicalRecordDto[]>([]);

  ngOnInit() {
    this.data.getPatientMe().subscribe(p => {
      this.patient.set(p);
      this.data.getMedicalRecords(p.id).subscribe({
        next: r => { this.records.set(r); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    });
  }

  /**
   * Render a single prescription (medical visit) as a PDF and download it.
   *
   * Approach: We off-screen render a fully-styled HTML template using
   * `html2canvas`, which captures every browser font (including right-to-left
   * Arabic glyphs) correctly. The resulting canvas is then embedded as an
   * image in `jsPDF`, preserving the same RTL/LTR layout the user sees on
   * screen. This avoids relying on jsPDF's built-in fonts which lack Arabic
   * support and would otherwise produce mojibake.
   *
   * Filename: RX_{MRN}_{visitDate}.pdf
   */
  async downloadRx(r: MedicalRecordDto): Promise<void> {
    const lang = this.translate.currentLang || 'en';
    const isArabic = lang.startsWith('ar');

    const t = (key: string) => this.translate.instant(key);
    const dir = isArabic ? 'rtl' : 'ltr';
    const locale = isArabic ? 'ar-EG' : 'en-US';

    const escape = (s: string) => (s ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const p = this.patient();
    const dateStr = new Date(r.recordDate).toLocaleString(locale, { dateStyle: 'full', timeStyle: 'short' });

    const sections = [
      ['CHIEF_COMPLAINT', r.chiefComplaint],
      ['DIAGNOSIS', r.diagnosis],
      ['SYMPTOMS', r.symptoms],
      ['TREATMENT_PLAN', r.treatmentPlan],
      ['INVESTIGATIONS', r.investigations],
      ['NOTES', r.notes],
    ] as const;

    const sectionsHtml = sections
      .filter(([, v]) => !!v)
      .map(([key, v]) => `
        <div class="section">
          <div class="section-title">${escape(t(`DOCTOR_PORTAL.${key}`))}</div>
          <div class="section-body">${escape(v || '')}</div>
        </div>`).join('');

    const prescriptionHtml = (r.prescriptions?.length ?? 0) > 0
      ? `<div class="section">
           <div class="section-title rx-title">${escape(t('PATIENT.RX_PRESCRIPTIONS'))}</div>
           ${r.prescriptions!.map((p, idx) => `
             <div class="rx">
               <div class="rx-name"><span class="rx-idx">${idx + 1}.</span> ${escape(p.medicationName)}</div>
               <ul class="rx-meta">
                 ${p.dosage ? `<li><span class="meta-key">${escape(t('DOCTOR_PORTAL.DOSAGE'))}</span><span class="meta-val">${escape(p.dosage)}</span></li>` : ''}
                 ${p.frequency ? `<li><span class="meta-key">${escape(t('DOCTOR_PORTAL.FREQUENCY'))}</span><span class="meta-val">${escape(p.frequency)}</span></li>` : ''}
                 ${p.duration ? `<li><span class="meta-key">${escape(t('DOCTOR_PORTAL.DURATION'))}</span><span class="meta-val">${escape(p.duration)}</span></li>` : ''}
                 ${p.route ? `<li><span class="meta-key">${escape(t('DOCTOR_PORTAL.ROUTE') || 'Route')}</span><span class="meta-val">${escape(p.route)}</span></li>` : ''}
                 ${p.quantity != null ? `<li><span class="meta-key">Quantity</span><span class="meta-val">${p.quantity}</span></li>` : ''}
               </ul>
               ${p.instructions ? `<div class="rx-instructions">${escape(p.instructions)}</div>` : ''}
             </div>`).join('')}
         </div>`
      : '';

    const followupHtml = r.followUpRequired
      ? `<div class="followup">
           <span class="followup-icon">⚠</span>
           <span>${escape(t('PATIENT.RX_FOLLOWUP'))}${r.followUpDate ? ' — ' + new Date(r.followUpDate).toLocaleDateString(locale) : ''}</span>
         </div>`
      : '';

    // Full self-contained HTML page styled with clean medical-typography.
    // All decorative colors come from the same `primary-*` palette used in the app.
    const html = `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #ffffff; color: #0f172a; font-family: ${isArabic ? "'Cairo', 'Tajawal', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif" : "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"}; font-size: 13px; line-height: 1.5; }
        body { padding: 0; }
        .sheet { width: 794px; padding: 40px 48px 56px; background: #ffffff; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: linear-gradient(90deg, #145391 0%, #1d6fb8 100%); color: #ffffff; border-radius: 10px; margin-bottom: 24px; }
        .header .brand { font-size: 26px; font-weight: 700; letter-spacing: 1px; }
        .header .tagline { font-size: 12px; opacity: 0.85; ${isArabic ? 'text-align: left;' : 'text-align: right;'} }
        .title { text-align: center; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #145391; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #145391; }
        .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; background: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin-bottom: 22px; }
        .summary .row { display: flex; gap: 8px; }
        .summary .key { font-weight: 600; color: #475569; min-width: 110px; }
        .summary .val { color: #0f172a; }
        .section { margin-bottom: 18px; }
        .section-title { font-size: 14px; font-weight: 700; color: #145391; margin-bottom: 6px; padding-${isArabic ? 'right' : 'left'}: 10px; border-${isArabic ? 'right' : 'left'}: 3px solid #145391; }
        .rx-title { font-size: 16px; margin-top: 8px; }
        .section-body { background: #f8fafc; border-radius: 8px; padding: 10px 14px; color: #1e293b; white-space: pre-wrap; }
        .rx { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; }
        .rx-name { font-weight: 700; color: #047857; font-size: 14px; margin-bottom: 6px; }
        .rx-idx { color: #145391; margin-${isArabic ? 'left' : 'right'}: 6px; }
        .rx-meta { list-style: none; padding: 0; margin: 6px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .rx-meta li { display: flex; gap: 6px; font-size: 12px; }
        .meta-key { color: #64748b; min-width: 80px; font-weight: 600; }
        .meta-val { color: #1e293b; }
        .rx-instructions { margin-top: 8px; font-size: 12px; color: #065f46; background: #d1fae5; border-radius: 6px; padding: 8px 12px; }
        .followup { margin-top: 18px; padding: 12px 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; color: #9a3412; font-weight: 600; display: flex; gap: 8px; align-items: center; }
        .followup-icon { font-size: 18px; }
        .footer { margin-top: 28px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        .footer .mrn { font-family: 'Courier New', monospace; }
      </style>
    </head><body><div class="sheet" id="rxSheet">
      <div class="header">
        <div>
          <div class="brand">Shefaa</div>
          <div style="font-size:11px;opacity:0.85;">${isArabic ? 'نظام إدارة العيادات الذكي' : 'Smart Clinic Management'}</div>
        </div>
        <div class="tagline">${isArabic ? 'روشتة طبية' : 'Medical Prescription'}</div>
      </div>

      <div class="title">${escape(t('PATIENT.RX_TITLE'))}</div>

      <div class="summary">
        <div class="row"><span class="key">${escape(t('PATIENT.RX_PATIENT'))}</span><span class="val">${escape(p?.fullName || '—')}</span></div>
        <div class="row"><span class="key">${escape(t('PATIENT.RX_MRN'))}</span><span class="val mrn">${escape(p?.medicalRecordNumber || '—')}</span></div>
        <div class="row"><span class="key">${escape(t('PATIENT.RX_DOCTOR'))}</span><span class="val">${escape(r.doctorName || '—')}</span></div>
        <div class="row"><span class="key">${escape(t('PATIENT.RX_DATE'))}</span><span class="val">${escape(dateStr)}</span></div>
      </div>

      ${sectionsHtml}
      ${prescriptionHtml}
      ${followupHtml}

      <div class="footer">
        <span>Shefaa · ${escape(t('NAV.APPOINTMENTS') || 'Appointments')} · ${escape(p?.medicalRecordNumber || '')}</span>
        <span>${isArabic ? 'صفحة' : 'Page'} <span class="pagenum"></span></span>
      </div>
    </div></body></html>`;

    // Mount the rendered sheet off-screen.
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.background = '#ffffff';
    container.style.zIndex = '-1';
    container.innerHTML = html;
    document.body.appendChild(container);

    try {
      // Wait one frame for layout to settle before screenshotting.
      await new Promise(r => setTimeout(r, 60));
      const target = container.querySelector<HTMLElement>('#rxSheet')!;

      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const a4WidthMm = 210;
      const a4HeightMm = 297;
      const ratio = a4WidthMm / imgWidth;
      const pageHeightMm = imgHeight * ratio;

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      pdf.addImage(imgData, 'PNG', 0, 0, a4WidthMm, pageHeightMm, undefined, 'FAST');

      // Multi-page support: if the rendered image is taller than a single A4 page, slice it.
      if (pageHeightMm > a4HeightMm) {
        // Re-create the PDF with sliced image across pages.
        pdf.internal.pages = pdf.internal.pages.slice(0, 1); // remove the full image
        let yOffset = 0;
        let pageIndex = 1;
        while (yOffset < imgHeight) {
          if (pageIndex > 1) pdf.addPage();
          const sliceHeightPx = Math.min(
            imgHeight - yOffset,
            a4HeightMm / ratio
          );
          // Create a temporary canvas for the slice
          const slice = document.createElement('canvas');
          slice.width = imgWidth;
          slice.height = sliceHeightPx;
          const ctx = slice.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, imgWidth, sliceHeightPx);
          ctx.drawImage(canvas, 0, -yOffset);
          pdf.addImage(slice.toDataURL('image/png'), 'PNG', 0, 0, a4WidthMm, sliceHeightPx * ratio, undefined, 'FAST');
          yOffset += sliceHeightPx;
          pageIndex++;
        }
      }

      // Update page numbers on every page's footer
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`${i} / ${totalPages}`, a4WidthMm - 15, a4HeightMm - 8, { align: 'right' });
      }

      const mrn = (p?.medicalRecordNumber || 'patient').replace(/[^a-zA-Z0-9_-]/g, '_');
      const stamp = new Date(r.recordDate).toISOString().slice(0, 10);
      pdf.save(`RX_${mrn}_${stamp}.pdf`);

      this.snack.open(this.translate.instant('PATIENT.RX_DOWNLOADED'), this.translate.instant('COMMON.OK'), { duration: 2500 });
    } finally {
      // Clean up the off-screen DOM.
      document.body.removeChild(container);
    }
  }
}