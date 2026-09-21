import { useEffect, useRef, useState } from 'react';
import {
  MEASUREMENT_GROUPS,
  MEASUREMENTS,
  isOutOfRange,
} from '../data/measurements.js';
import {
  formatValue,
  fromCanonical,
  nudgeFor,
  parseNumber,
  toCanonical,
  unitLabel,
} from '../lib/units.js';

const groupLabel = (id) => MEASUREMENT_GROUPS.find((g) => g.id === id)?.label ?? '';

/**
 * The pop-out editor for one measurement.
 *
 * Uses a native <dialog> so focus trapping, Esc-to-close and the backdrop come
 * from the platform rather than from hand-rolled code.
 */
export default function MeasurementDialog({
  measurement,
  value,
  note,
  unit,
  fractionalInches,
  onChangeValue,
  onChangeNote,
  onNavigate,
  onClose,
}) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [draft, setDraft] = useState('');

  // Reset the field whenever a different measurement is opened, or the unit
  // changes underneath us.
  useEffect(() => {
    if (!measurement) return;
    setDraft(formatValue(value, measurement.unitType, unit, { fractionalInches }));
    // Selecting the text means typing a new number just replaces the old one.
    requestAnimationFrame(() => inputRef.current?.select());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurement?.key, unit, fractionalInches]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (measurement && !dialog.open) dialog.showModal();
    if (!measurement && dialog.open) dialog.close();
  }, [measurement]);

  if (!measurement) return <dialog ref={dialogRef} className="dialog" onClose={onClose} />;

  const suffix = unitLabel(measurement.unitType, unit);
  const parsed = parseNumber(draft);
  const canonical = parsed == null ? null : toCanonical(parsed, measurement.unitType, unit);
  const unreadable = draft.trim() !== '' && parsed == null;
  const outOfRange = isOutOfRange(measurement, canonical);

  const index = MEASUREMENTS.findIndex((m) => m.key === measurement.key);
  const previous = MEASUREMENTS[index - 1];
  const next = MEASUREMENTS[index + 1];

  function commit(text) {
    setDraft(text);
    const number = parseNumber(text);
    if (text.trim() === '') onChangeValue(measurement.key, null);
    else if (number != null) onChangeValue(measurement.key, toCanonical(number, measurement.unitType, unit));
  }

  function nudge(direction) {
    const step = nudgeFor(measurement.unitType, unit);
    const current = parsed ?? fromCanonical(value, measurement.unitType, unit) ?? 0;
    const updated = Math.max(0, current + direction * step);
    const rounded = Number(updated.toFixed(3));
    commit(
      formatValue(
        toCanonical(rounded, measurement.unitType, unit),
        measurement.unitType,
        unit,
        { fractionalInches },
      ),
    );
  }

  function handleSubmit(event) {
    event.preventDefault();
    onClose();
  }

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onClose} aria-labelledby="dialog-title">
      <form className="dialog__form" method="dialog" onSubmit={handleSubmit}>
        <header className="dialog__header">
          <div>
            <p className="dialog__eyebrow">
              {groupLabel(measurement.group)}
              {measurement.ref ? ` · No. ${measurement.ref}` : ''}
            </p>
            <h2 className="dialog__title" id="dialog-title">
              {measurement.label}
            </h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <p className="dialog__how">{measurement.how}</p>
        {measurement.tip && <p className="dialog__tip">{measurement.tip}</p>}

        <div className="field">
          <label className="field__label" htmlFor="measurement-value">
            Measurement
          </label>
          <div className="stepper">
            <button type="button" className="stepper__button" onClick={() => nudge(-1)} aria-label="Decrease">
              −
            </button>
            <div className="stepper__input">
              <input
                id="measurement-value"
                ref={inputRef}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={draft}
                placeholder="0"
                onChange={(event) => commit(event.target.value)}
              />
              <span className="stepper__suffix">{suffix}</span>
            </div>
            <button type="button" className="stepper__button" onClick={() => nudge(1)} aria-label="Increase">
              +
            </button>
          </div>

          {unit === 'in' && (
            <p className="field__hint">
              Fractions welcome — type <code>38 1/2</code> or <code>38.5</code>.
            </p>
          )}
          {unreadable && <p className="field__warning">That does not read as a number.</p>}
          {outOfRange && !unreadable && (
            <p className="field__warning">
              That is outside the usual range for this measurement — worth double-checking.
            </p>
          )}
          {canonical != null && !unreadable && (
            <p className="field__echo">
              {formatValue(canonical, measurement.unitType, 'cm')}{' '}
              {measurement.unitType === 'mass' ? 'kg' : 'cm'}
              {'  ·  '}
              {formatValue(canonical, measurement.unitType, 'in', { fractionalInches })}{' '}
              {measurement.unitType === 'mass' ? 'lb' : 'in'}
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor="measurement-note">
            Note <span className="field__optional">optional</span>
          </label>
          <input
            id="measurement-note"
            type="text"
            value={note ?? ''}
            placeholder="e.g. taken over a shirt, right side lower"
            onChange={(event) => onChangeNote(measurement.key, event.target.value)}
          />
        </div>

        <footer className="dialog__footer">
          <button
            type="button"
            className="button button--ghost"
            onClick={() => commit('')}
            disabled={value == null}
          >
            Clear
          </button>
          <div className="dialog__nav">
            <button
              type="button"
              className="button button--quiet"
              onClick={() => onNavigate(previous.key)}
              disabled={!previous}
            >
              ‹ Previous
            </button>
            <button
              type="button"
              className="button button--quiet"
              onClick={() => onNavigate(next.key)}
              disabled={!next}
            >
              Next ›
            </button>
            <button type="submit" className="button button--primary">
              Done
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}
