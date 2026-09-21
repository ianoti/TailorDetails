# TailorDetails

A single-page app for recording bespoke tailoring measurements. Tap a point on
the silhouette, type the measurement, switch freely between mm / cm / inches,
and export the whole sheet as a PDF.

Everything is stored in the browser's `localStorage`. There is no server and
nothing is uploaded.

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then `npm run build` produces a static `dist/` you can host anywhere (the build
uses relative paths, so a subfolder or even `file://` works).

## What it does

- **Interactive silhouette** — 16 hotspots, one per measurement. Clicking one
  opens a dialog with how to take it, a numeric field with ± buttons, and a
  per-measurement note. The point being measured is drawn on the figure as a
  tape line or girth loop while its dialog is open.
- **Units** — mm, cm and inches. Values are stored canonically in millimetres
  and converted only for display, so switching units never loses precision.
  Inches read as eighths (`38 1/2`), and the input accepts `38 1/2`, `38.5` or
  `38,5`.
- **Records** — several people can be kept side by side, each with fitting
  notes. New / Duplicate / Delete are in the bar at the top.
- **Export** — a formatted PDF, an email draft with the measurements typed out,
  and a JSON backup that can be restored later.

The sixteen measurements and their numbering follow the
[Michael Tailors measurement guide](https://michaeltailors.com/measurements/),
so a printed sheet can be read alongside it.

## Layout

```
src/
  data/
    measurements.js   the measurement catalogue — the main thing to edit
    silhouette.js     the SVG figure: head, torso and arm paths
  lib/
    units.js          conversion, formatting and parsing
    storage.js        localStorage load/save, normalisation, migrations
    exportPdf.js      the PDF sheet (jsPDF, loaded on demand)
    exportText.js     email draft and JSON backup/restore
  hooks/
    useMeasurementStore.js   all app state, in one reducer
  components/
    SilhouetteFigure.jsx  the figure, its guides and its hotspots
    MeasurementMarker.jsx  one hotspot
    MeasurementDialog.jsx  the pop-out editor
    MeasurementList.jsx    the written list beside the figure
    ProfileBar.jsx         record picker, name, notes, progress
    ExportMenu.jsx         PDF / email / backup
    UnitToggle.jsx
  styles/
    index.css        design tokens, resets, page layout
    components.css   component styling
```

## Extending it

**Add a measurement.** Add an entry to `MEASUREMENTS` in
`src/data/measurements.js`. It automatically gets a hotspot, a list row, a slot
in storage and a line in the PDF — nothing else needs changing. The entry shape
is documented at the top of that file. `marker` is a point in the silhouette's
`0 0 400 1000` viewBox; leave it `null` for something with no sensible place on
a front-view figure and it will appear in the list only.

**Add a group.** Add to `MEASUREMENT_GROUPS`; groups render in the order listed,
and empty ones are skipped.

**Change the figure.** Replace the paths in `src/data/silhouette.js`. The body
is drawn as a left half that is mirrored, and the arm is a separate shape from
the torso — if they were one path, the gap between arm and body would fill in.
Marker coordinates will need repointing to match.

**Add a unit.** Add it to `LENGTH_UNITS` in `src/lib/units.js` with its
conversion factor and nudge step. Length values are stored in millimetres and
mass values in grams; `unitType` on a catalogue entry picks between them. (No
current measurement uses `mass` — the support is there for when one does.)

**Change the storage shape.** Bump `SCHEMA_VERSION` in `src/lib/storage.js` and
add a function to `MIGRATIONS` keyed by the new version number. Measurement keys
are the storage keys, so renaming one needs a migration.

## Licence

See [LICENSE](LICENSE).
