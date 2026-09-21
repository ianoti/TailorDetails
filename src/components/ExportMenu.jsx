import { useEffect, useRef, useState } from 'react';
import { downloadMeasurementPdf, openMeasurementPdf } from '../lib/exportPdf.js';
import { buildMailtoUrl, downloadJsonBackup, readJsonBackup } from '../lib/exportText.js';

/**
 * Everything that leaves the app: PDF, an email draft, and a JSON backup.
 *
 * Nothing here talks to a server — the PDF is generated in the browser and the
 * email opens as a draft in the user's own mail client.
 */
export default function ExportMenu({ profile, unit, state, fractionalInches, onToggleFractions, onImport }) {
  const [open, setOpen] = useState(false);
  const [includeEmpty, setIncludeEmpty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKey(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const pdfArgs = { profile, unit, includeEmpty, fractionalInches };

  /** The PDF library is loaded on demand, so exporting is asynchronous. */
  async function runExport(task) {
    setBusy(true);
    setError('');
    try {
      await task();
    } catch (exportError) {
      console.error(exportError);
      setError('Could not build the PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = await readJsonBackup(file);
      onImport(parsed);
      setError('');
      setOpen(false);
    } catch (importError) {
      setError(importError.message);
    } finally {
      event.target.value = '';
    }
  }

  return (
    <div className="export" ref={containerRef}>
      <button
        type="button"
        className="button button--primary"
        disabled={busy}
        onClick={() => runExport(() => downloadMeasurementPdf(pdfArgs))}
      >
        {busy ? 'Preparing…' : 'Export PDF'}
      </button>
      <button
        type="button"
        className="button button--primary export__caret"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="More export options"
        onClick={() => setOpen((value) => !value)}
      >
        ▾
      </button>

      {error && !open && <p className="export__error export__error--float">{error}</p>}

      {open && (
        <div className="export__panel" role="menu">
          <p className="export__heading">PDF options</p>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={includeEmpty}
              onChange={(event) => setIncludeEmpty(event.target.checked)}
            />
            Include blank rows (a sheet to fill in by hand)
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={fractionalInches}
              onChange={(event) => onToggleFractions(event.target.checked)}
            />
            Show inches as fractions (38 ½ rather than 38.5)
          </label>
          <button
            type="button"
            className="export__item"
            disabled={busy}
            onClick={() => {
              runExport(() => openMeasurementPdf(pdfArgs));
              setOpen(false);
            }}
          >
            Preview PDF in a new tab
          </button>

          <hr className="export__rule" />

          <p className="export__heading">Email</p>
          <input
            type="email"
            className="export__email"
            value={email}
            placeholder="you@example.com (optional)"
            onChange={(event) => setEmail(event.target.value)}
          />
          <a
            className="export__item"
            href={buildMailtoUrl({ profile, unit, to: email, fractionalInches })}
            onClick={() => setOpen(false)}
          >
            Open an email draft
          </a>
          <p className="export__hint">
            Opens a draft in your mail app with the measurements typed out. Attach the PDF yourself
            — a browser cannot attach files to an email for you.
          </p>

          <hr className="export__rule" />

          <p className="export__heading">Backup</p>
          <button
            type="button"
            className="export__item"
            onClick={() => {
              downloadJsonBackup(state);
              setOpen(false);
            }}
          >
            Save a JSON backup
          </button>
          <button type="button" className="export__item" onClick={() => fileRef.current?.click()}>
            Restore from a backup…
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
          {error && <p className="export__error">{error}</p>}
        </div>
      )}
    </div>
  );
}
