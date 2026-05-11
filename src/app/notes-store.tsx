import { createContext, useContext, useMemo, useState } from "react";

type Note = {
	id: string;
	title: string;
	body: string;
	updatedAt: string;
};

const initialNotes: Note[] = [
	{
		id: "1",
		title: "Morning ideas",
		body: "Capture one clear idea, one next action, and one thing to remove before the day gets busy.",
		updatedAt: "Today · 8:15 AM",
	},
	{
		id: "2",
		title: "Assignment checklist",
		body: "Review the brief, build both screens, add search and theme toggles, then validate the layout on a wider screen.",
		updatedAt: "Today · 7:40 AM",
	},
	{
		id: "3",
		title: "Reading list",
		body: "Design systems, mobile spacing rules, React Native core components, and keyboard-safe forms.",
		updatedAt: "Yesterday",
	},
	{
		id: "4",
		title: "Shopping note",
		body: "Paper, coffee, fruit, and a backup charger.",
		updatedAt: "Mon · 6:10 PM",
	},
];

type NotesContextValue = {
	notes: Note[];
	getNoteById: (id?: string) => Note | undefined;
	upsertNote: (note: Note) => void;
};

const NotesContext = createContext<NotesContextValue | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
	const [notes, setNotes] = useState<Note[]>(initialNotes);

	const value = useMemo<NotesContextValue>(() => {
		return {
			notes,
			getNoteById: (id) => notes.find((note) => note.id === id),
			upsertNote: (note) => {
				setNotes((currentNotes) => {
					const existingIndex = currentNotes.findIndex(
						(existingNote) => existingNote.id === note.id,
					);

					if (existingIndex === -1) {
						return [
							{ ...note, id: note.id || String(Date.now()) },
							...currentNotes,
						];
					}

					const updatedNotes = [...currentNotes];
					updatedNotes[existingIndex] = note;
					return updatedNotes;
				});
			},
		};
	}, [notes]);

	return (
		<NotesContext.Provider value={value}>{children}</NotesContext.Provider>
	);
}

export function useNotes() {
	const context = useContext(NotesContext);

	if (!context) {
		throw new Error("useNotes must be used inside NotesProvider");
	}

	return context;
}

export type { Note };
