import { useState } from 'react';

/**
 * Who we are measuring. Several people can be kept side by side — handy for a
 * household, a wedding party, or the same person before and after alterations.
 */
export default function ProfileBar({ state, profile, actions, filledCount, totalCount }) {
  const [notesOpen, setNotesOpen] = useState(Boolean(profile.notes));

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete “${profile.name}” and all its measurements? This cannot be undone.`,
    );
    if (confirmed) actions.deleteProfile(profile.id);
  }

  function handleClear() {
    const confirmed = window.confirm(
      `Clear every measurement for “${profile.name}”? The record itself is kept.`,
    );
    if (confirmed) actions.clearValues();
  }

  const percent = totalCount === 0 ? 0 : Math.round((filledCount / totalCount) * 100);

  return (
    <div className="profile-bar">
      <div className="profile-bar__row">
        {/* A one-item dropdown is just noise — only show it once there's a choice. */}
        {state.profiles.length > 1 && (
          <label className="profile-bar__field">
            <span className="profile-bar__label">Record</span>
            <select
              value={profile.id}
              onChange={(event) => actions.selectProfile(event.target.value)}
              aria-label="Select a measurement record"
            >
              {state.profiles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name || 'Unnamed'}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="profile-bar__field profile-bar__field--grow">
          <span className="profile-bar__label">Name</span>
          <input
            type="text"
            value={profile.name}
            placeholder="Client name"
            onChange={(event) => actions.setProfileField('name', event.target.value)}
          />
        </label>

        <div className="profile-bar__actions">
          <button type="button" className="button button--quiet" onClick={() => actions.addProfile()}>
            New
          </button>
          <button type="button" className="button button--quiet" onClick={actions.duplicateProfile}>
            Duplicate
          </button>
          <button type="button" className="button button--quiet" onClick={handleClear}>
            Clear values
          </button>
          <button type="button" className="button button--danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="profile-bar__row profile-bar__row--meta">
        <div className="progress" role="img" aria-label={`${filledCount} of ${totalCount} measurements recorded`}>
          <div className="progress__track">
            <div className="progress__fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="progress__text">
            {filledCount} of {totalCount} recorded
          </span>
        </div>

        <button
          type="button"
          className="button button--quiet"
          aria-expanded={notesOpen}
          onClick={() => setNotesOpen((open) => !open)}
        >
          {notesOpen ? 'Hide notes' : 'Fitting notes'}
        </button>
      </div>

      {notesOpen && (
        <textarea
          className="profile-bar__notes"
          value={profile.notes}
          rows={3}
          placeholder="Posture, preferences, cloth, anything worth remembering at the next fitting…"
          onChange={(event) => actions.setProfileField('notes', event.target.value)}
        />
      )}
    </div>
  );
}
