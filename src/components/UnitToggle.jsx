import { LENGTH_UNITS, LENGTH_UNIT_IDS } from '../lib/units.js';

/**
 * Switching units only changes how stored millimetres are displayed, so it is
 * always safe — nothing is re-rounded or lost.
 */
export default function UnitToggle({ unit, onChange }) {
  return (
    <div className="unit-toggle" role="group" aria-label="Measurement unit">
      {LENGTH_UNIT_IDS.map((id) => (
        <button
          key={id}
          type="button"
          className={`unit-toggle__option ${id === unit ? 'is-selected' : ''}`}
          aria-pressed={id === unit}
          title={LENGTH_UNITS[id].name}
          onClick={() => onChange(id)}
        >
          {LENGTH_UNITS[id].label}
        </button>
      ))}
    </div>
  );
}
