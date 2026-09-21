/**
 * localStorage persistence.
 *
 * Everything the app knows lives in one JSON blob under STORAGE_KEY:
 *
 *   {
 *     version: 1,
 *     unit: 'cm',
 *     activeProfileId: 'p_...',
 *     profiles: [ { id, name, notes, createdAt, updatedAt, values, fieldNotes } ]
 *   }
 *
 * `values` maps a measurement key to a canonical number (mm for lengths, grams
 * for mass) and `fieldNotes` maps the same keys to free text. Unset keys are
 * simply absent, so adding a measurement to the catalogue never needs a
 * migration — only renaming or changing the meaning of a key does.
 */

import { DEFAULT_UNIT, isLengthUnit } from './units.js';

export const STORAGE_KEY = 'tailordetails.v1';
export const SCHEMA_VERSION = 1;

/**
 * Migrations run in order for any stored state older than SCHEMA_VERSION.
 * Add `2: (state) => ...` here when the shape changes, and bump SCHEMA_VERSION.
 */
const MIGRATIONS = {};

function uid(prefix = 'p') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function createProfile(name = 'New client') {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name,
    notes: '',
    createdAt: now,
    updatedAt: now,
    values: {},
    fieldNotes: {},
  };
}

export function createInitialState() {
  const profile = createProfile('My measurements');
  return {
    version: SCHEMA_VERSION,
    unit: DEFAULT_UNIT,
    activeProfileId: profile.id,
    profiles: [profile],
  };
}

/** Defensive normalisation — hand-edited or partial state should never crash the app. */
export function normaliseState(input) {
  if (!input || typeof input !== 'object') return createInitialState();

  let state = { ...input };
  let version = Number(state.version) || 0;
  while (version < SCHEMA_VERSION && MIGRATIONS[version + 1]) {
    state = MIGRATIONS[version + 1](state);
    version += 1;
  }

  const profiles = Array.isArray(state.profiles) ? state.profiles.filter(Boolean) : [];
  const cleaned = profiles.map((profile) => ({
    ...createProfile(),
    ...profile,
    values: sanitiseValues(profile.values),
    fieldNotes: sanitiseNotes(profile.fieldNotes),
  }));

  if (cleaned.length === 0) cleaned.push(createProfile('My measurements'));

  const activeExists = cleaned.some((p) => p.id === state.activeProfileId);

  return {
    version: SCHEMA_VERSION,
    unit: isLengthUnit(state.unit) ? state.unit : DEFAULT_UNIT,
    activeProfileId: activeExists ? state.activeProfileId : cleaned[0].id,
    profiles: cleaned,
  };
}

function sanitiseValues(values) {
  if (!values || typeof values !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(values)) {
    const num = Number(value);
    if (Number.isFinite(num)) out[key] = num;
  }
  return out;
}

function sanitiseNotes(notes) {
  if (!notes || typeof notes !== 'object') return {};
  const out = {};
  for (const [key, value] of Object.entries(notes)) {
    if (typeof value === 'string' && value.trim()) out[key] = value;
  }
  return out;
}

export function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return normaliseState(JSON.parse(raw));
  } catch (error) {
    // Corrupt or blocked storage (private mode, quota, hand-edited JSON):
    // start clean rather than leaving the app unusable.
    console.warn('TailorDetails: could not read saved measurements.', error);
    return createInitialState();
  }
}

export function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('TailorDetails: could not save measurements.', error);
    return false;
  }
}

export function getActiveProfile(state) {
  return state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0];
}
