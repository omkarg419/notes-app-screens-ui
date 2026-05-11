# Notes App UI

This repository contains a small Expo React Native project implementing a two-screen Notes UI (no external navigation requirements). It demonstrates list and editor screens, theme toggling, responsive layout, and keyboard-safe editing.

---
## Demo

---

## Project structure (important files)

- `src/app/index.tsx` — Notes list screen (home). Shows `FlatList` of notes, search `TextInput`, theme & focus `Switch`, and New note button.
- `src/app/editor.tsx` — Editor screen (route `/editor`). Uses `KeyboardAvoidingView`, `ImageBackground`, `TextInput` for title and multiline body, Back and Save `Pressable` buttons.
- `src/app/notes-store.tsx` — Minimal shared in-memory notes store (React Context) used by both screens.
- `src/app/_layout.tsx` — Expo Router layout wrapping the app in `NotesProvider`.

---

## Components & Hooks used

- React Native components: `FlatList`, `Pressable`, `Text`, `TextInput`, `Switch`, `ImageBackground`, `KeyboardAvoidingView`, `SafeAreaView`, `ScrollView`, `View`.
- React hooks: `useState`, `useEffect`, `useMemo`.
- Platform & layout hooks: `useColorScheme`, `useWindowDimensions`.
- Expo Router: `router`, `useLocalSearchParams` for route navigation and receiving note `id`.
- Styling: `StyleSheet.create()` and theme-specific style objects composed at runtime.

---

## Key behavior and features

- Notes Listing (home):
  - `FlatList` renders note cards with title, body preview, and timestamp.
  - Search `TextInput` filters notes by title or body.
  - `Pressable` cards open the Editor screen for the selected note.
  - `Switch` toggles: Theme (dark/light) and Focus mode (hides long preview content).
  - Responsive: switches to two-column layout on wide screens (via `useWindowDimensions`).

- Note Editor (`/editor`):
  - `KeyboardAvoidingView` keeps inputs visible when the keyboard is open.
  - `TextInput` for `title` and multiline `TextInput` for `body`.
  - `ImageBackground` in the header area for visual polish.
  - Back and Save `Pressable` buttons: Save upserts the note back to the shared store and navigates back.

---

## UI improvements added (beyond the brief)

- Split the app into two explicit routes for clearer separation of concerns.
- Created a shared `NotesProvider` to keep state in-memory across routes.
- Improved spacing, card layout, and subtle shadows for a more polished look.
- Added small icon markers inside primary action buttons for clarity.

---

## How to run locally

1. Install dependencies

```bash
npm install
```

2. Start the Expo dev server

```bash
npx expo start
```

Open the app in an emulator or on a device via Expo Go / development build and follow the demo steps above.

---


