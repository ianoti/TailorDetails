/**
 * Non-PDF exports: a plain-text summary (for email or a chat message) and a
 * JSON backup that can be read straight back into the app.
 */

import { GROUPED_MEASUREMENTS } from '../data/measurements.js';
import { formatWithUnit } from './units.js';

export function buildTextSummary({ profile, unit, fractionalInches = true }) {
  const lines = [];
  lines.push(`Measurements — ${profile.name || 'Unnamed'}`);
  if (profile.updatedAt) lines.push(`Updated: ${new Date(profile.updatedAt).toLocaleString()}`);
  lines.push('');

  for (const group of GROUPED_MEASUREMENTS) {
    const items = group.items.filter((item) => profile.values?.[item.key] != null);
    if (items.length === 0) continue;

    lines.push(group.label.toUpperCase());
    for (const item of items) {
      const value = formatWithUnit(profile.values[item.key], item.unitType, unit, { fractionalInches });
      const note = profile.fieldNotes?.[item.key];
      const ref = item.ref ? `${item.ref}. ` : '';
      lines.push(`  ${ref}${item.label}: ${value}${note ? `  (${note})` : ''}`);
    }
    lines.push('');
  }

  if (profile.notes?.trim()) {
    lines.push('FITTING NOTES');
    lines.push(profile.notes.trim());
    lines.push('');
  }

  lines.push('Generated with TailorDetails.');
  return lines.join('\n');
}

/**
 * Hands the summary to the user's mail client. Attachments are not possible
 * from a mailto: link, so the PDF is downloaded separately and attached by hand.
 */
export function buildMailtoUrl({ profile, unit, to = '', fractionalInches = true }) {
  const subject = `Measurements — ${profile.name || 'Unnamed'}`;
  const body = buildTextSummary({ profile, unit, fractionalInches });
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJsonBackup(state) {
  const stamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  triggerDownload(blob, `tailordetails-backup-${stamp}.json`);
}

export function readJsonBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error('That file is not a valid TailorDetails backup.'));
      }
    };
    reader.readAsText(file);
  });
}
