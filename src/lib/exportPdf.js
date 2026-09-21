/**
 * PDF export.
 *
 * Builds a measurement sheet grouped exactly like the catalogue: the chosen
 * working unit first, then cm and inches alongside, because the person cutting
 * the cloth may not use the same unit as the person who took the measurements.
 */

import { GROUPED_MEASUREMENTS } from '../data/measurements.js';
import { formatValue, unitLabel, LENGTH_UNITS } from './units.js';

const INK = [28, 25, 23];
const MUTED = [120, 113, 108];
const RULE = [214, 211, 209];
const ACCENT = [146, 64, 14];

const MARGIN = 16;

function formatDate(iso) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function buildFileName(profile) {
  const safeName = (profile.name || 'measurements').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
  const stamp = new Date().toISOString().slice(0, 10);
  return `${safeName || 'measurements'}-measurements-${stamp}.pdf`;
}

/**
 * jsPDF and its dependencies are ~400 kB, and most sessions never export, so
 * they are fetched on first use rather than in the initial bundle.
 */
async function loadPdfLibs() {
  const [{ jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  return { jsPDF, autoTable: autoTableModule.default ?? autoTableModule.autoTable };
}

/**
 * @param {object}  args
 * @param {object}  args.profile       active profile
 * @param {string}  args.unit          working length unit id
 * @param {boolean} [args.includeEmpty] print unmeasured rows as blank lines
 * @param {boolean} [args.fractionalInches]
 * @returns {Promise<object>} a jsPDF document
 */
export async function buildMeasurementPdf({
  profile,
  unit,
  includeEmpty = false,
  fractionalInches = true,
}) {
  const { jsPDF, autoTable } = await loadPdfLibs();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;

  /* ------------------------------------------------------------ header */
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Measurement Record', MARGIN, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(profile.name || 'Unnamed', MARGIN, 29);

  doc.setFontSize(9);
  const takenOn = formatDate(profile.updatedAt);
  const meta = [takenOn && `Updated ${takenOn}`, `Working unit: ${LENGTH_UNITS[unit].name}`]
    .filter(Boolean)
    .join('   ·   ');
  doc.text(meta, pageWidth - MARGIN, 22, { align: 'right' });

  const filled = Object.keys(profile.values || {}).length;
  doc.text(`${filled} measurement${filled === 1 ? '' : 's'} recorded`, pageWidth - MARGIN, 27, {
    align: 'right',
  });

  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, 33, MARGIN + contentWidth, 33);

  /* ------------------------------------------------------------- tables */
  let cursorY = 40;

  // A second column in the other system, so whoever cuts the cloth is not
  // forced to convert. Never the working unit itself — that would just repeat.
  const altUnit = unit === 'in' ? 'cm' : 'in';

  for (const group of GROUPED_MEASUREMENTS) {
    const rows = group.items
      .filter((item) => includeEmpty || profile.values?.[item.key] != null)
      .map((item) => {
        const value = profile.values?.[item.key];
        const cell = (target) => {
          if (value == null) return '';
          const text = formatValue(value, item.unitType, target, { fractionalInches });
          return `${text} ${unitLabel(item.unitType, target)}`;
        };
        return [
          item.ref ?? '',
          item.label,
          value == null ? '—' : cell(unit),
          cell(altUnit),
          profile.fieldNotes?.[item.key] ?? '',
        ];
      });

    if (rows.length === 0) continue;

    autoTable(doc, {
      startY: cursorY,
      head: [['No.', group.label, LENGTH_UNITS[unit].name, LENGTH_UNITS[altUnit].name, 'Notes']],
      body: rows,
      margin: { left: MARGIN, right: MARGIN },
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 9.5, cellPadding: { top: 1.8, bottom: 1.8, left: 2, right: 2 }, textColor: INK },
      headStyles: {
        fontStyle: 'bold',
        fontSize: 9,
        textColor: ACCENT,
        lineWidth: { bottom: 0.3 },
        lineColor: RULE,
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.06, textColor: MUTED },
        1: { cellWidth: contentWidth * 0.28 },
        2: { cellWidth: contentWidth * 0.17, fontStyle: 'bold' },
        3: { cellWidth: contentWidth * 0.15, textColor: MUTED },
        4: { cellWidth: 'auto', textColor: MUTED, fontSize: 8.5 },
      },
      alternateRowStyles: { fillColor: [250, 249, 248] },
      didDrawPage: () => {
        // Tables that spill onto a new page start below the top margin.
        cursorY = MARGIN;
      },
    });

    cursorY = doc.lastAutoTable.finalY + 8;
  }

  /* -------------------------------------------------------------- notes */
  if (profile.notes?.trim()) {
    if (cursorY > doc.internal.pageSize.getHeight() - 45) {
      doc.addPage();
      cursorY = MARGIN + 6;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ACCENT);
    doc.text('Fitting notes', MARGIN, cursorY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(profile.notes.trim(), contentWidth);
    doc.text(lines, MARGIN, cursorY + 5);
  }

  /* ------------------------------------------------------------- footer */
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('TailorDetails', MARGIN, pageHeight - 10);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - MARGIN, pageHeight - 10, { align: 'right' });
  }

  return doc;
}

export async function downloadMeasurementPdf(args) {
  const doc = await buildMeasurementPdf(args);
  doc.save(buildFileName(args.profile));
}

/**
 * Opens the sheet in a new tab so it can be previewed or printed before saving.
 *
 * The tab is opened synchronously, before the PDF is built, because a popup
 * opened after an `await` has lost the user gesture and gets blocked.
 */
export async function openMeasurementPdf(args) {
  const tab = window.open('', '_blank');
  try {
    const doc = await buildMeasurementPdf(args);
    const url = doc.output('bloburl');
    if (tab) tab.location = url;
    else window.open(url, '_blank', 'noopener');
  } catch (error) {
    tab?.close();
    throw error;
  }
}
