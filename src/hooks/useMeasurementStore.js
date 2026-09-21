/**
 * The single source of truth for the app.
 *
 * All state changes go through a reducer and the whole tree is written back to
 * localStorage on every change, so a refresh (or a closed tab mid-fitting)
 * never loses anything.
 */

import { useEffect, useMemo, useReducer } from 'react';
import {
  createProfile,
  createInitialState,
  getActiveProfile,
  loadState,
  normaliseState,
  saveState,
} from '../lib/storage.js';

function touch(profile, changes) {
  return { ...profile, ...changes, updatedAt: new Date().toISOString() };
}

function updateActive(state, updater) {
  return {
    ...state,
    profiles: state.profiles.map((profile) =>
      profile.id === state.activeProfileId ? updater(profile) : profile,
    ),
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'setUnit':
      return { ...state, unit: action.unit };

    case 'setValue': {
      const { key, value } = action;
      return updateActive(state, (profile) => {
        const values = { ...profile.values };
        if (value == null || Number.isNaN(value)) delete values[key];
        else values[key] = value;
        return touch(profile, { values });
      });
    }

    case 'setFieldNote': {
      const { key, note } = action;
      return updateActive(state, (profile) => {
        const fieldNotes = { ...profile.fieldNotes };
        if (note && note.trim()) fieldNotes[key] = note;
        else delete fieldNotes[key];
        return touch(profile, { fieldNotes });
      });
    }

    case 'setProfileField':
      return updateActive(state, (profile) => touch(profile, { [action.field]: action.value }));

    case 'clearValues':
      return updateActive(state, (profile) => touch(profile, { values: {}, fieldNotes: {} }));

    case 'addProfile': {
      const profile = createProfile(action.name || 'New client');
      return { ...state, profiles: [...state.profiles, profile], activeProfileId: profile.id };
    }

    case 'duplicateProfile': {
      const source = getActiveProfile(state);
      const copy = {
        ...createProfile(`${source.name} (copy)`),
        values: { ...source.values },
        fieldNotes: { ...source.fieldNotes },
        notes: source.notes,
      };
      return { ...state, profiles: [...state.profiles, copy], activeProfileId: copy.id };
    }

    case 'deleteProfile': {
      const remaining = state.profiles.filter((p) => p.id !== action.id);
      if (remaining.length === 0) return createInitialState();
      return {
        ...state,
        profiles: remaining,
        activeProfileId: state.activeProfileId === action.id ? remaining[0].id : state.activeProfileId,
      };
    }

    case 'selectProfile':
      return { ...state, activeProfileId: action.id };

    case 'replaceState':
      return normaliseState(action.state);

    default:
      return state;
  }
}

export function useMeasurementStore() {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const profile = useMemo(() => getActiveProfile(state), [state]);

  const actions = useMemo(
    () => ({
      setUnit: (unit) => dispatch({ type: 'setUnit', unit }),
      setValue: (key, value) => dispatch({ type: 'setValue', key, value }),
      setFieldNote: (key, note) => dispatch({ type: 'setFieldNote', key, note }),
      setProfileField: (field, value) => dispatch({ type: 'setProfileField', field, value }),
      clearValues: () => dispatch({ type: 'clearValues' }),
      addProfile: (name) => dispatch({ type: 'addProfile', name }),
      duplicateProfile: () => dispatch({ type: 'duplicateProfile' }),
      deleteProfile: (id) => dispatch({ type: 'deleteProfile', id }),
      selectProfile: (id) => dispatch({ type: 'selectProfile', id }),
      replaceState: (next) => dispatch({ type: 'replaceState', state: next }),
    }),
    [],
  );

  return { state, profile, unit: state.unit, actions };
}
