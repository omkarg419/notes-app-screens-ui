import { Stack } from "expo-router";
import { NotesProvider } from "./notes-store";

export default function RootLayout() {
	return (
		<NotesProvider>
			<Stack
				screenOptions={{
					headerShown: false,
				}}
			/>
		</NotesProvider>
	);
}
