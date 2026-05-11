import { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
	useColorScheme,
	useWindowDimensions,
} from "react-native";

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

export default function Index() {
	const systemColorScheme = useColorScheme();
	const { width } = useWindowDimensions();

	const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
	const [isFocusMode, setIsFocusMode] = useState(false);
	const [activeView, setActiveView] = useState<"list" | "editor">("list");
	const [searchText, setSearchText] = useState("");
	const [notes, setNotes] = useState<Note[]>(initialNotes);
	const [draft, setDraft] = useState<Note>({
		id: "new",
		title: "",
		body: "",
		updatedAt: "",
	});

	useEffect(() => {
		setIsDarkMode(systemColorScheme === "dark");
	}, [systemColorScheme]);

	const isWideLayout = width >= 760;
	const numColumns = isWideLayout ? 2 : 1;
	const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

	const filteredNotes = useMemo(() => {
		const query = searchText.trim().toLowerCase();

		if (!query) {
			return notes;
		}

		return notes.filter((note) => {
			return (
				note.title.toLowerCase().includes(query) ||
				note.body.toLowerCase().includes(query)
			);
		});
	}, [notes, searchText]);

	const openEditor = (note?: Note) => {
		setDraft(
			note ?? {
				id: "new",
				title: "",
				body: "",
				updatedAt: "",
			},
		);
		setActiveView("editor");
	};

	const saveDraft = () => {
		const cleanTitle = draft.title.trim();
		const cleanBody = draft.body.trim();
		const nextNote: Note = {
			...draft,
			title: cleanTitle.length > 0 ? cleanTitle : "Untitled note",
			body: cleanBody.length > 0 ? cleanBody : "Start typing your note here.",
			updatedAt: "Just now",
		};

		setNotes((currentNotes) => {
			const existingIndex = currentNotes.findIndex(
				(note) => note.id === draft.id,
			);

			if (existingIndex === -1 || draft.id === "new") {
				return [{ ...nextNote, id: String(Date.now()) }, ...currentNotes];
			}

			const updatedNotes = [...currentNotes];
			updatedNotes[existingIndex] = nextNote;
			return updatedNotes;
		});

		setActiveView("list");
		setDraft({ id: "new", title: "", body: "", updatedAt: "" });
	};

	function NotesListingScreen() {
		return (
			<View style={baseStyles.viewWrap}>
				<View style={[baseStyles.searchCard, themeStyles.searchCard]}>
					<Text style={[baseStyles.sectionLabel, themeStyles.sectionLabel]}>
						Search notes
					</Text>
					<TextInput
						value={searchText}
						onChangeText={setSearchText}
						placeholder="Search by title or content"
						placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
						style={[baseStyles.searchInput, themeStyles.searchInput]}
						returnKeyType="search"
					/>
					<Text style={[baseStyles.helperText, themeStyles.helperText]}>
						{filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}{" "}
						found
					</Text>
				</View>

				<FlatList
					data={filteredNotes}
					keyExtractor={(item) => item.id}
					numColumns={numColumns}
					contentContainerStyle={StyleSheet.compose(
						baseStyles.listContent,
						isFocusMode ? baseStyles.listContentFocused : undefined,
					)}
					columnWrapperStyle={
						numColumns > 1 ? baseStyles.columnWrapper : undefined
					}
					renderItem={({ item }) => {
						const noteCardStyle = StyleSheet.flatten([
							baseStyles.noteCard,
							themeStyles.noteCard,
							isWideLayout && baseStyles.noteCardWide,
							isFocusMode && baseStyles.noteCardFocused,
						]);

						return (
							<Pressable
								onPress={() => openEditor(item)}
								style={({ pressed }) => [
									noteCardStyle,
									pressed && baseStyles.noteCardPressed,
								]}
							>
								<View style={baseStyles.noteCardTopRow}>
									<Text
										style={[baseStyles.noteTitle, themeStyles.noteTitle]}
										numberOfLines={1}
									>
										{item.title}
									</Text>
									<Text style={[baseStyles.noteDate, themeStyles.noteDate]}>
										{item.updatedAt}
									</Text>
								</View>
								{!isFocusMode ? (
									<Text
										style={[baseStyles.notePreview, themeStyles.notePreview]}
										numberOfLines={3}
									>
										{item.body}
									</Text>
								) : null}
								<Text style={[baseStyles.noteHint, themeStyles.noteHint]}>
									Tap to edit
								</Text>
							</Pressable>
						);
					}}
					ListEmptyComponent={
						<View style={[baseStyles.emptyState, themeStyles.emptyState]}>
							<Text style={[baseStyles.emptyTitle, themeStyles.emptyTitle]}>
								No notes match your search.
							</Text>
							<Text style={[baseStyles.emptyText, themeStyles.emptyText]}>
								Try a different keyword or create a new note.
							</Text>
						</View>
					}
				/>
			</View>
		);
	}

	function NoteEditorScreen() {
		return (
			<KeyboardAvoidingView
				style={baseStyles.editorShell}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={StyleSheet.compose(
						baseStyles.editorContent,
						isWideLayout ? baseStyles.editorContentWide : undefined,
					)}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View
						style={[baseStyles.editorHeaderCard, themeStyles.editorHeaderCard]}
					>
						<ImageBackground
							source={require("../../assets/images/logo-glow.png")}
							style={baseStyles.editorImage}
							imageStyle={baseStyles.editorImageStyle}
							resizeMode="cover"
						>
							<View style={baseStyles.editorOverlay}>
								<Text style={baseStyles.editorImageKicker}>Writing space</Text>
								<Text style={baseStyles.editorImageTitle}>
									Compose with focus
								</Text>
							</View>
						</ImageBackground>
					</View>

					<View style={[baseStyles.editorCard, themeStyles.editorCard]}>
						<Text style={[baseStyles.sectionLabel, themeStyles.sectionLabel]}>
							Note title
						</Text>
						<TextInput
							value={draft.title}
							onChangeText={(text) =>
								setDraft((currentDraft) => ({ ...currentDraft, title: text }))
							}
							placeholder="Enter a title"
							placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
							style={[baseStyles.titleInput, themeStyles.titleInput]}
							returnKeyType="next"
						/>

						<Text style={[baseStyles.sectionLabel, themeStyles.sectionLabel]}>
							Note content
						</Text>
						<TextInput
							value={draft.body}
							onChangeText={(text) =>
								setDraft((currentDraft) => ({ ...currentDraft, body: text }))
							}
							placeholder="Write your note here..."
							placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
							style={[baseStyles.bodyInput, themeStyles.bodyInput]}
							multiline
							textAlignVertical="top"
						/>

						<View style={baseStyles.editorActions}>
							<Pressable
								onPress={() => setActiveView("list")}
								style={({ pressed }) => [
									baseStyles.secondaryButton,
									themeStyles.secondaryButton,
									pressed && baseStyles.secondaryButtonPressed,
								]}
							>
								<Text
									style={[
										baseStyles.secondaryButtonText,
										themeStyles.secondaryButtonText,
									]}
								>
									Back
								</Text>
							</Pressable>

							<Pressable
								onPress={saveDraft}
								style={({ pressed }) => [
									baseStyles.primaryButton,
									themeStyles.primaryButton,
									pressed && baseStyles.primaryButtonPressed,
								]}
							>
								<Text style={baseStyles.primaryButtonText}>Save note</Text>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}

	return (
		<SafeAreaView style={[baseStyles.safeArea, themeStyles.safeArea]}>
			<View style={[baseStyles.shell, themeStyles.shell]}>
				<View style={baseStyles.header}>
					<View style={baseStyles.headerTextBlock}>
						<Text
							style={StyleSheet.compose(baseStyles.kicker, themeStyles.kicker)}
						>
							{isDarkMode ? "Night writing mode" : "Clean note taking"}
						</Text>
						<Text
							style={StyleSheet.compose(baseStyles.title, themeStyles.title)}
						>
							Notes App UI
						</Text>
						<Text
							style={StyleSheet.compose(
								baseStyles.subtitle,
								themeStyles.subtitle,
							)}
						>
							Two explicit screen components are wired into one shell so the
							assignment can show both views without navigation.
						</Text>
					</View>

					<View style={[baseStyles.modePanel, themeStyles.modePanel]}>
						<View style={baseStyles.modeRow}>
							<View>
								<Text style={[baseStyles.modeLabel, themeStyles.modeLabel]}>
									Theme
								</Text>
								<Text style={[baseStyles.modeValue, themeStyles.modeValue]}>
									{isDarkMode ? "Dark" : "Light"}
								</Text>
							</View>
							<Switch
								value={isDarkMode}
								onValueChange={setIsDarkMode}
								trackColor={{ false: "#9AA9B6", true: "#4F87FF" }}
								thumbColor={isDarkMode ? "#EAF1FF" : "#F5F8FC"}
							/>
						</View>

						<View style={[baseStyles.divider, themeStyles.divider]} />

						<View style={baseStyles.modeRow}>
							<View>
								<Text style={[baseStyles.modeLabel, themeStyles.modeLabel]}>
									Focus
								</Text>
								<Text style={[baseStyles.modeValue, themeStyles.modeValue]}>
									{isFocusMode ? "On" : "Off"}
								</Text>
							</View>
							<Switch
								value={isFocusMode}
								onValueChange={setIsFocusMode}
								trackColor={{ false: "#9AA9B6", true: "#4F87FF" }}
								thumbColor={isDarkMode ? "#EAF1FF" : "#F5F8FC"}
							/>
						</View>
					</View>
				</View>

				<View style={baseStyles.segmentRow}>
					<Pressable
						onPress={() => setActiveView("list")}
						style={({ pressed }) => [
							baseStyles.segmentButton,
							themeStyles.segmentButton,
							activeView === "list" && baseStyles.segmentButtonActive,
							pressed && baseStyles.segmentButtonPressed,
						]}
					>
						<Text
							style={[
								baseStyles.segmentText,
								themeStyles.segmentText,
								activeView === "list" && baseStyles.segmentTextActive,
							]}
						>
							Notes
						</Text>
					</Pressable>

					<Pressable
						onPress={() => openEditor()}
						style={({ pressed }) => [
							baseStyles.primaryButton,
							themeStyles.primaryButton,
							pressed && baseStyles.primaryButtonPressed,
						]}
					>
						<Text style={baseStyles.primaryButtonText}>New note</Text>
					</Pressable>

					<Pressable
						onPress={() => setActiveView("editor")}
						style={({ pressed }) => [
							baseStyles.segmentButton,
							themeStyles.segmentButton,
							activeView === "editor" && baseStyles.segmentButtonActive,
							pressed && baseStyles.segmentButtonPressed,
						]}
					>
						<Text
							style={[
								baseStyles.segmentText,
								themeStyles.segmentText,
								activeView === "editor" && baseStyles.segmentTextActive,
							]}
						>
							Editor
						</Text>
					</Pressable>
				</View>

				{activeView === "list" ? <NotesListingScreen /> : <NoteEditorScreen />}
			</View>
		</SafeAreaView>
	);
}

const baseStyles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	shell: {
		flex: 1,
		paddingHorizontal: 18,
		paddingTop: 12,
		paddingBottom: 10,
	},
	header: {
		gap: 14,
	},
	headerTextBlock: {
		gap: 8,
	},
	kicker: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 1.4,
		textTransform: "uppercase",
	},
	title: {
		fontSize: 32,
		lineHeight: 36,
		fontWeight: "800",
		letterSpacing: -0.8,
	},
	subtitle: {
		fontSize: 15,
		lineHeight: 22,
		maxWidth: 680,
	},
	modePanel: {
		borderRadius: 24,
		padding: 16,
		gap: 12,
	},
	modeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	modeLabel: {
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	modeValue: {
		marginTop: 4,
		fontSize: 17,
		fontWeight: "700",
	},
	divider: {
		height: StyleSheet.hairlineWidth,
	},
	segmentRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginTop: 6,
		flexWrap: "wrap",
	},
	segmentButton: {
		flexGrow: 1,
		minWidth: 104,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 18,
		borderWidth: 1,
	},
	segmentButtonActive: {
		borderWidth: 0,
	},
	segmentButtonPressed: {
		opacity: 0.88,
		transform: [{ scale: 0.99 }],
	},
	segmentText: {
		fontSize: 14,
		fontWeight: "700",
	},
	segmentTextActive: {
		color: "#FFFFFF",
	},
	primaryButton: {
		minWidth: 120,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 18,
	},
	primaryButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.99 }],
	},
	primaryButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "800",
		letterSpacing: 0.2,
	},
	secondaryButton: {
		minWidth: 96,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 18,
		borderWidth: 1,
	},
	secondaryButtonPressed: {
		opacity: 0.9,
	},
	secondaryButtonText: {
		fontSize: 14,
		fontWeight: "800",
	},
	viewWrap: {
		flex: 1,
		marginTop: 12,
	},
	searchCard: {
		borderRadius: 24,
		padding: 16,
		gap: 10,
	},
	sectionLabel: {
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 1.2,
	},
	searchInput: {
		borderRadius: 18,
		borderWidth: 1,
		minHeight: 54,
		paddingHorizontal: 16,
		fontSize: 15,
		fontWeight: "600",
	},
	helperText: {
		fontSize: 13,
		lineHeight: 18,
	},
	listContent: {
		paddingTop: 14,
		paddingBottom: 24,
		gap: 12,
	},
	listContentFocused: {
		gap: 10,
	},
	columnWrapper: {
		gap: 12,
	},
	noteCard: {
		flex: 1,
		borderRadius: 24,
		padding: 18,
		gap: 12,
	},
	noteCardWide: {
		minHeight: 170,
	},
	noteCardFocused: {
		paddingVertical: 20,
	},
	noteCardPressed: {
		transform: [{ scale: 0.985 }],
	},
	noteCardTopRow: {
		gap: 8,
	},
	noteTitle: {
		fontSize: 18,
		lineHeight: 23,
		fontWeight: "800",
	},
	noteDate: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	notePreview: {
		fontSize: 14,
		lineHeight: 21,
	},
	noteHint: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
		marginTop: "auto",
	},
	emptyState: {
		marginTop: 16,
		borderRadius: 24,
		padding: 20,
		alignItems: "center",
		gap: 8,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "800",
		textAlign: "center",
	},
	emptyText: {
		fontSize: 14,
		lineHeight: 20,
		textAlign: "center",
	},
	editorShell: {
		flex: 1,
		marginTop: 12,
	},
	editorContent: {
		paddingBottom: 28,
		gap: 14,
	},
	editorContentWide: {
		alignSelf: "center",
		width: "100%",
		maxWidth: 880,
	},
	editorHeaderCard: {
		borderRadius: 28,
		overflow: "hidden",
	},
	editorImage: {
		minHeight: 180,
		justifyContent: "flex-end",
	},
	editorImageStyle: {
		borderRadius: 28,
	},
	editorOverlay: {
		padding: 20,
		gap: 6,
	},
	editorImageKicker: {
		color: "#FFFFFF",
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 1.3,
		textTransform: "uppercase",
	},
	editorImageTitle: {
		color: "#FFFFFF",
		fontSize: 24,
		fontWeight: "800",
		letterSpacing: -0.4,
	},
	editorCard: {
		borderRadius: 28,
		padding: 18,
		gap: 12,
	},
	titleInput: {
		borderRadius: 18,
		borderWidth: 1,
		minHeight: 54,
		paddingHorizontal: 16,
		fontSize: 16,
		fontWeight: "700",
	},
	bodyInput: {
		borderRadius: 20,
		borderWidth: 1,
		minHeight: 240,
		paddingHorizontal: 16,
		paddingTop: 16,
		paddingBottom: 16,
		fontSize: 15,
		lineHeight: 22,
		fontWeight: "500",
	},
	editorActions: {
		flexDirection: "row",
		gap: 12,
		marginTop: 4,
	},
});

const lightThemeStyles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#F2F6FB",
	},
	shell: {
		backgroundColor: "#F2F6FB",
	},
	kicker: {
		color: "#5C6C7E",
	},
	title: {
		color: "#0E1726",
	},
	subtitle: {
		color: "#516173",
	},
	modePanel: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
		shadowColor: "#0E1726",
		shadowOpacity: 0.08,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
		elevation: 3,
	},
	modeLabel: {
		color: "#5C6C7E",
	},
	modeValue: {
		color: "#0E1726",
	},
	divider: {
		backgroundColor: "rgba(14, 23, 38, 0.08)",
	},
	segmentButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.12)",
	},
	segmentButtonActive: {
		backgroundColor: "#0E1726",
	},
	segmentText: {
		color: "#233045",
	},
	primaryButton: {
		backgroundColor: "#2D6DF6",
	},
	secondaryButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.12)",
	},
	secondaryButtonText: {
		color: "#0E1726",
	},
	searchCard: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
		shadowColor: "#0E1726",
		shadowOpacity: 0.06,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		elevation: 2,
	},
	sectionLabel: {
		color: "#5C6C7E",
	},
	searchInput: {
		backgroundColor: "#F7FAFD",
		borderColor: "rgba(14, 23, 38, 0.10)",
		color: "#0E1726",
	},
	helperText: {
		color: "#5C6C7E",
	},
	noteCard: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
		shadowColor: "#0E1726",
		shadowOpacity: 0.06,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 10 },
		elevation: 2,
	},
	noteTitle: {
		color: "#0E1726",
	},
	noteDate: {
		color: "#6D7B8D",
	},
	notePreview: {
		color: "#445364",
	},
	noteHint: {
		color: "#2D6DF6",
	},
	emptyState: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
	},
	emptyTitle: {
		color: "#0E1726",
	},
	emptyText: {
		color: "#516173",
	},
	editorHeaderCard: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
		shadowColor: "#0E1726",
		shadowOpacity: 0.08,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
		elevation: 3,
	},
	editorCard: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.08)",
		borderWidth: 1,
		shadowColor: "#0E1726",
		shadowOpacity: 0.08,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 10 },
		elevation: 3,
	},
	titleInput: {
		backgroundColor: "#F7FAFD",
		borderColor: "rgba(14, 23, 38, 0.10)",
		color: "#0E1726",
	},
	bodyInput: {
		backgroundColor: "#F7FAFD",
		borderColor: "rgba(14, 23, 38, 0.10)",
		color: "#0E1726",
	},
});

const darkThemeStyles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#09111F",
	},
	shell: {
		backgroundColor: "#09111F",
	},
	kicker: {
		color: "#8FA2BB",
	},
	title: {
		color: "#F3F7FD",
	},
	subtitle: {
		color: "#B2C0D2",
	},
	modePanel: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		shadowColor: "#000000",
		shadowOpacity: 0.28,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 5,
	},
	modeLabel: {
		color: "#8FA2BB",
	},
	modeValue: {
		color: "#F3F7FD",
	},
	divider: {
		backgroundColor: "rgba(255, 255, 255, 0.08)",
	},
	segmentButton: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.10)",
	},
	segmentButtonActive: {
		backgroundColor: "#4F87FF",
	},
	segmentText: {
		color: "#D7E2F1",
	},
	primaryButton: {
		backgroundColor: "#4F87FF",
	},
	secondaryButton: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.10)",
	},
	secondaryButtonText: {
		color: "#F3F7FD",
	},
	searchCard: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		shadowColor: "#000000",
		shadowOpacity: 0.2,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 5,
	},
	sectionLabel: {
		color: "#8FA2BB",
	},
	searchInput: {
		backgroundColor: "#0B1426",
		borderColor: "rgba(255, 255, 255, 0.08)",
		color: "#F3F7FD",
	},
	helperText: {
		color: "#A9B8CB",
	},
	noteCard: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		shadowColor: "#000000",
		shadowOpacity: 0.18,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 4,
	},
	noteTitle: {
		color: "#F3F7FD",
	},
	noteDate: {
		color: "#97AACC",
	},
	notePreview: {
		color: "#C4D0E0",
	},
	noteHint: {
		color: "#7FB0FF",
	},
	emptyState: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
	},
	emptyTitle: {
		color: "#F3F7FD",
	},
	emptyText: {
		color: "#B2C0D2",
	},
	editorHeaderCard: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		shadowColor: "#000000",
		shadowOpacity: 0.24,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 4,
	},
	editorCard: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.08)",
		borderWidth: 1,
		shadowColor: "#000000",
		shadowOpacity: 0.24,
		shadowRadius: 18,
		shadowOffset: { width: 0, height: 12 },
		elevation: 4,
	},
	titleInput: {
		backgroundColor: "#0B1426",
		borderColor: "rgba(255, 255, 255, 0.08)",
		color: "#F3F7FD",
	},
	bodyInput: {
		backgroundColor: "#0B1426",
		borderColor: "rgba(255, 255, 255, 0.08)",
		color: "#F3F7FD",
	},
});
