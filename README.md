# Personal Finance Tracker UI

A minimal React + Tailwind UI scaffold for a personal finance tracker.

## Structure

- `src/App.jsx` — main app layout, tabs, and state
- `src/components/` — reusable page sections
- `src/index.css` — Tailwind base styles and app background

## Notes

- Uses local React state for now.
- Remaining budget styling is conditional:
  - positive: green
  - zero: yellow
  - negative: red
