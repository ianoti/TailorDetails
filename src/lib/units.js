/**
 * Unit handling.
 *
 * Canonical storage rules (never change these without a storage migration):
 *   - every `length` measurement is stored as a number of MILLIMETRES
 *   - every `mass` measurement is stored as a number of GRAMS
 *
 * Display/parse conversion happens only at the edges (inputs, lists, PDF), so
 * switching units never mutates saved data and never accumulates rounding error.
 */

/** `nudge` is how much the +/- buttons move a value, in display units. */
export const LENGTH_UNITS = {
  mm: { id: 'mm', label: 'mm', name: 'Millimetres', perMm: 1, decimals: 0, nudge: 5 },
  cm: { id: 'cm', label: 'cm', name: 'Centimetres', perMm: 0.1, decimals: 1, nudge: 0.5 },
  in: { id: 'in', label: 'in', name: 'Inches', perMm: 1 / 25.4, decimals: 2, nudge: 0.125 },
};

/** Mass nudges, in display units (kg or lb). */
export const MASS_NUDGE = { kg: 0.5, lb: 1 };

export const LENGTH_UNIT_IDS = Object.keys(LENGTH_UNITS);

export const DEFAULT_UNIT = 'cm';

/** Imperial-minded tailors weigh in pounds; metric ones in kilos. */
export function massUnitFor(lengthUnit) {
  return lengthUnit === 'in' ? 'lb' : 'kg';
}

const GRAMS_PER_LB = 453.59237;

export function isLengthUnit(unit) {
  return Object.hasOwn(LENGTH_UNITS, unit);
}

/* ------------------------------------------------------------------ *
 * Conversion
 * ------------------------------------------------------------------ */

/** Canonical (mm or g) -> display number in the given unit. */
export function fromCanonical(value, unitType, lengthUnit) {
  if (value == null || Number.isNaN(value)) return null;
  if (unitType === 'mass') {
    return massUnitFor(lengthUnit) === 'lb' ? value / GRAMS_PER_LB : value / 1000;
  }
  return value * LENGTH_UNITS[lengthUnit].perMm;
}

/** Display number in the given unit -> canonical (mm or g). */
export function toCanonical(value, unitType, lengthUnit) {
  if (value == null || Number.isNaN(value)) return null;
  if (unitType === 'mass') {
    return massUnitFor(lengthUnit) === 'lb' ? value * GRAMS_PER_LB : value * 1000;
  }
  return value / LENGTH_UNITS[lengthUnit].perMm;
}

/* ------------------------------------------------------------------ *
 * Formatting
 * ------------------------------------------------------------------ */

function trimZeros(text) {
  return text.includes('.') ? text.replace(/\.?0+$/, '') : text;
}

/**
 * Inches the way a tape measure reads them: whole inches plus a fraction
 * rounded to the nearest 1/8 (`38 1/2`, `17 3/8`, `40`).
 */
export function formatInchFraction(inches, denominator = 8) {
  const sign = inches < 0 ? '-' : '';
  const abs = Math.abs(inches);
  let whole = Math.floor(abs);
  let numerator = Math.round((abs - whole) * denominator);

  if (numerator === denominator) {
    whole += 1;
    numerator = 0;
  }
  if (numerator === 0) return `${sign}${whole}`;

  let den = denominator;
  while (numerator % 2 === 0 && den % 2 === 0) {
    numerator /= 2;
    den /= 2;
  }
  return `${sign}${whole} ${numerator}/${den}`;
}

/**
 * Canonical value -> a display string (no unit suffix).
 * `fractionalInches` renders inches as eighths instead of decimals.
 */
export function formatValue(value, unitType, lengthUnit, { fractionalInches = true } = {}) {
  const converted = fromCanonical(value, unitType, lengthUnit);
  if (converted == null) return '';

  if (unitType === 'mass') {
    return trimZeros(converted.toFixed(1));
  }
  if (lengthUnit === 'in' && fractionalInches) {
    return formatInchFraction(converted);
  }
  return trimZeros(converted.toFixed(LENGTH_UNITS[lengthUnit].decimals));
}

/** Display string including the unit suffix, e.g. `38 1/2 in`. */
export function formatWithUnit(value, unitType, lengthUnit, options) {
  const text = formatValue(value, unitType, lengthUnit, options);
  if (!text) return '';
  const suffix = unitType === 'mass' ? massUnitFor(lengthUnit) : LENGTH_UNITS[lengthUnit].label;
  return `${text} ${suffix}`;
}

export function unitLabel(unitType, lengthUnit) {
  return unitType === 'mass' ? massUnitFor(lengthUnit) : LENGTH_UNITS[lengthUnit].label;
}

/** Step size for the +/- buttons, in display units. */
export function nudgeFor(unitType, lengthUnit) {
  return unitType === 'mass' ? MASS_NUDGE[massUnitFor(lengthUnit)] : LENGTH_UNITS[lengthUnit].nudge;
}

/* ------------------------------------------------------------------ *
 * Parsing
 * ------------------------------------------------------------------ */

/**
 * Accepts what a tailor would actually type:
 *   `38`, `38.5`, `38,5`, `38 1/2`, `38-1/2`, `1/2`, `38 1/2 in`
 * Returns a number in the *display* unit, or null if it can't be read.
 */
export function parseNumber(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (!input) return null;

  const cleaned = String(input)
    .trim()
    .toLowerCase()
    .replace(/[a-z"'′″]+$/g, '')
    .replace(/,/g, '.')
    .replace(/[-–]/g, ' ')
    .trim();
  if (!cleaned) return null;

  const mixed = cleaned.match(/^(\d+(?:\.\d+)?)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const [, whole, num, den] = mixed;
    if (Number(den) === 0) return null;
    return Number(whole) + Number(num) / Number(den);
  }

  const fraction = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (fraction) {
    const [, num, den] = fraction;
    if (Number(den) === 0) return null;
    return Number(num) / Number(den);
  }

  const plain = cleaned.match(/^\d+(?:\.\d+)?$/);
  if (plain) return Number(cleaned);

  return null;
}
