import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
	FlatList,
	Pressable,
	StyleSheet,
	Switch,
	Text,
	TextInput,
	View,
	useColorScheme,
	useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note, useNotes } from "./notes-store";

export default function Index() {
	const systemColorScheme = useColorScheme();
	const { width } = useWindowDimensions();
	const { notes } = useNotes();

	const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");
	const [isFocusMode, setIsFocusMode] = useState(false);
	const [searchText, setSearchText] = useState("");

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
		router.push({
			pathname: "/editor",
			params: note ? { id: note.id } : undefined,
		});
	};

	return (
		<SafeAreaView style={[styles.safeArea, themeStyles.safeArea]}>
			<View style={[styles.shell, themeStyles.shell]}>
				<View style={styles.header}>
					<View style={styles.headerTextBlock}>
						<Text style={[styles.kicker, themeStyles.kicker]}>
							Clean note taking
						</Text>
						<Text style={[styles.title, themeStyles.title]}>Notes App </Text>
						{/* <Text style={[styles.subtitle, themeStyles.subtitle]}>
							A focused list page that opens a separate editor screen when you
							tap a note.
						</Text> */}
					</View>

					<View style={[styles.modePanel, themeStyles.modePanel]}>
						<View style={styles.modeRow}>
							<View>
								<Text style={[styles.modeLabel, themeStyles.modeLabel]}>
									Theme
								</Text>
								<Text style={[styles.modeValue, themeStyles.modeValue]}>
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

						<View style={[styles.divider, themeStyles.divider]} />

						<View style={styles.modeRow}>
							<View>
								<Text style={[styles.modeLabel, themeStyles.modeLabel]}>
									Focus
								</Text>
								<Text style={[styles.modeValue, themeStyles.modeValue]}>
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

				<Pressable
					onPress={() => openEditor()}
					style={({ pressed }) => [
						styles.createButton,
						themeStyles.createButton,
						pressed && styles.createButtonPressed,
					]}
				>
					<View style={styles.buttonContent}>
						<Text style={styles.buttonIcon}>+</Text>
						<Text style={styles.createButtonText}>New note</Text>
					</View>
				</Pressable>

				<View style={[styles.searchCard, themeStyles.searchCard]}>
					<Text style={[styles.sectionLabel, themeStyles.sectionLabel]}>
						Search notes
					</Text>
					<TextInput
						value={searchText}
						onChangeText={setSearchText}
						placeholder="Search by title or content"
						placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
						style={[styles.searchInput, themeStyles.searchInput]}
						returnKeyType="search"
					/>
					<Text style={[styles.helperText, themeStyles.helperText]}>
						{filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}{" "}
						found
					</Text>
				</View>

				<FlatList
					data={filteredNotes}
					keyExtractor={(item) => item.id}
					numColumns={numColumns}
					contentContainerStyle={StyleSheet.compose(
						styles.listContent,
						isFocusMode ? styles.listContentFocused : undefined,
					)}
					columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
					renderItem={({ item }) => {
						const noteCardStyle = StyleSheet.flatten([
							styles.noteCard,
							themeStyles.noteCard,
							isWideLayout && styles.noteCardWide,
							isFocusMode && styles.noteCardFocused,
						]);

						return (
							<Pressable
								onPress={() => openEditor(item)}
								style={({ pressed }) => [
									noteCardStyle,
									pressed && styles.noteCardPressed,
								]}
							>
								<View style={styles.noteCardTopRow}>
									<Text
										style={[styles.noteTitle, themeStyles.noteTitle]}
										numberOfLines={1}
									>
										{item.title}
									</Text>
									<Text style={[styles.noteDate, themeStyles.noteDate]}>
										{item.updatedAt}
									</Text>
								</View>
								{!isFocusMode ? (
									<Text
										style={[styles.notePreview, themeStyles.notePreview]}
										numberOfLines={3}
									>
										{item.body}
									</Text>
								) : null}
								<Text style={[styles.noteHint, themeStyles.noteHint]}>
									Tap to open editor
								</Text>
							</Pressable>
						);
					}}
					ListEmptyComponent={
						<View style={[styles.emptyState, themeStyles.emptyState]}>
							<Text style={[styles.emptyTitle, themeStyles.emptyTitle]}>
								No notes match your search.
							</Text>
							<Text style={[styles.emptyText, themeStyles.emptyText]}>
								Try a different keyword or create a new note.
							</Text>
						</View>
					}
				/>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	shell: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 18,
		paddingBottom: 16,
		gap: 12,
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
		fontSize: 34,
		lineHeight: 40,
		fontWeight: "800",
		letterSpacing: -0.6,
		marginTop: -2,
	},
	subtitle: {
		fontSize: 15,
		lineHeight: 22,
		maxWidth: 720,
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
	createButton: {
		alignSelf: "flex-start",
		minWidth: 140,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 18,
		gap: 8,
		shadowColor: "#2D6DF6",
		shadowOpacity: 0.16,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		elevation: 3,
	},
	createButtonPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.99 }],
	},
	createButtonText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "800",
		letterSpacing: 0.2,
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	buttonIcon: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "900",
		lineHeight: 16,
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
		borderWidth: 0,
		minHeight: 54,
		paddingHorizontal: 16,
		fontSize: 15,
		fontWeight: "600",
		shadowColor: "#000",
		shadowOpacity: 0.04,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		elevation: 1,
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
		borderRadius: 20,
		padding: 16,
		gap: 10,
		minHeight: 140,
		justifyContent: "flex-start",
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
		lineHeight: 24,
		fontWeight: "800",
		marginBottom: 4,
	},
	noteDate: {
		fontSize: 12,
		fontWeight: "700",
		letterSpacing: 0.3,
	},
	notePreview: {
		fontSize: 14,
		lineHeight: 20,
		color: "#576679",
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
	createButton: {
		backgroundColor: "#2D6DF6",
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
	createButton: {
		backgroundColor: "#4F87FF",
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
});
