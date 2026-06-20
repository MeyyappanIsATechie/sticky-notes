# Sticky Notes App

A feature-rich sticky notes web app built with React + Tailwind CSS. Create, drag, resize, pin, and search notes on a free-form canvas, with full undo/redo and state that survives a page refresh.

## Features

- **Create notes** via a debounced input + submit button
- **Edit / Copy / Delete** each note from icon controls in its header
- **Undo / Redo** for create and delete actions (array-based history stacks)
- **Auto-placement** — new notes occupy the next free grid slot, never overlapping
- **Drag** notes anywhere on the canvas (restricted away from inputs/buttons)
- **Resize** notes by dragging the bottom-right corner
- **Persistence** — full state (notes, history, theme) restored on refresh via local/session storage
- **Search/filter** notes by content
- **Pin** a note to bring it to the front without disturbing layout
- **Dark mode** toggle for the whole app

## Tech stack

- React (Vite)
- Tailwind CSS
- lucide-react (icons)

## Project plan

The app is being built in stages:

1. Constants — sizing, spacing, color palette
2. Utils — grid layout logic, storage read/write helpers
3. Hooks — `useDebounce`, `useHistory`, `useDrag`, `useResize`
4. Components — `NoteCard`, `NotesCanvas`, `Toolbar`
5. `App.jsx` — wiring everything together
6. Persistence — `useEffect` load/save cycle
7. Optional features — search, pin, dark mode, resize
8. Polish — styling, edge cases, accessibility
9. Future enhancements — see below

## Folder structure

```
sticky-notes-app/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Toolbar.jsx
│   │   ├── NoteCard.jsx
│   │   └── NotesCanvas.jsx
│   ├── hooks/
│   │   ├── useDebounce.js
│   │   ├── useHistory.js
│   │   ├── useDrag.js
│   │   └── useResize.js
│   ├── utils/
│   │   ├── layout.js
│   │   └── storage.js
│   ├── constants.js
│   └── index.css
├── index.html
├── tailwind.config.js
└── package.json
```

## Getting started

```bash
npm install
npm run dev
```

## Roadmap / future enhancements

- Categories/tags with color-coding
- Rich text content (markdown or contentEditable)
- Reminders with browser notifications
- IndexedDB for larger note collections
- Cloud sync (Firebase/Supabase)
- Real-time collaboration (WebSockets/CRDTs)
- Collision-aware dragging
- Export/import (JSON, Markdown, PDF)
- Voice-to-note via Web Speech API
- PWA support (offline + installable)
- Framer Motion transitions
- AI-assisted note summarization and tagging

## License

MIT
