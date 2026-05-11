import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
	ImageBackground,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
	useColorScheme,
} from "react-native";
import { Note, useNotes } from "./notes-store";

const emptyDraft: Note = {
	id: "new",
	title: "",
	body: "",
	updatedAt: "",
};

export default function EditorScreen() {
	const systemColorScheme = useColorScheme();
	const { getNoteById, upsertNote } = useNotes();
	const params = useLocalSearchParams<{ id?: string }>();
	const noteId = typeof params.id === "string" ? params.id : undefined;
	const note = getNoteById(noteId);

	const [draft, setDraft] = useState<Note>(note ?? emptyDraft);
	const isDarkMode = systemColorScheme === "dark";
	const themeStyles = isDarkMode ? darkThemeStyles : lightThemeStyles;

	useEffect(() => {
		setDraft(note ?? emptyDraft);
	}, [noteId, note]);

	const saveDraft = () => {
		const cleanTitle = draft.title.trim();
		const cleanBody = draft.body.trim();
		const nextNote: Note = {
			id: draft.id === "new" ? String(Date.now()) : draft.id,
			title: cleanTitle.length > 0 ? cleanTitle : "Untitled note",
			body: cleanBody.length > 0 ? cleanBody : "Start typing your note here.",
			updatedAt: "Just now",
		};

		upsertNote(nextNote);
		router.back();
	};

	return (
		<SafeAreaView style={[styles.safeArea, themeStyles.safeArea]}>
			<KeyboardAvoidingView
				style={styles.editorShell}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
			>
				<ScrollView
					contentContainerStyle={styles.editorContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.editorHeaderCard, themeStyles.editorHeaderCard]}>
						<ImageBackground
							source={require("../../assets/images/logo-glow.png")}
							style={styles.editorImage}
							imageStyle={styles.editorImageStyle}
							resizeMode="cover"
						>
							<View style={styles.editorOverlay}>
								<Text style={styles.editorImageKicker}>Writing space</Text>
								<Text style={styles.editorImageTitle}>Compose with focus</Text>
							</View>
						</ImageBackground>
					</View>

					<View style={[styles.editorCard, themeStyles.editorCard]}>
						<Text style={[styles.sectionLabel, themeStyles.sectionLabel]}>
							Note title
						</Text>
						<TextInput
							value={draft.title}
							onChangeText={(text) =>
								setDraft((currentDraft) => ({ ...currentDraft, title: text }))
							}
							placeholder="Enter a title"
							placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
							style={[styles.titleInput, themeStyles.titleInput]}
							returnKeyType="next"
						/>

						<Text style={[styles.sectionLabel, themeStyles.sectionLabel]}>
							Note content
						</Text>
						<TextInput
							value={draft.body}
							onChangeText={(text) =>
								setDraft((currentDraft) => ({ ...currentDraft, body: text }))
							}
							placeholder="Write your note here..."
							placeholderTextColor={isDarkMode ? "#8C9AAD" : "#8593A3"}
							style={[styles.bodyInput, themeStyles.bodyInput]}
							multiline
							textAlignVertical="top"
						/>

						<View style={styles.editorActions}>
							<Pressable
								onPress={() => router.back()}
								style={({ pressed }) => [
									styles.secondaryButton,
									themeStyles.secondaryButton,
									pressed && styles.secondaryButtonPressed,
								]}
							>
								<Text
									style={[
										styles.secondaryButtonText,
										themeStyles.secondaryButtonText,
									]}
								>
									Back
								</Text>
							</Pressable>

							<Pressable
								onPress={saveDraft}
								style={({ pressed }) => [
									styles.primaryButton,
									themeStyles.primaryButton,
									pressed && styles.primaryButtonPressed,
								]}
							>
								<View style={styles.buttonContent}>
									<Text style={styles.buttonIcon}>✓</Text>
									<Text style={styles.primaryButtonText}>Save note</Text>
								</View>
							</Pressable>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	editorShell: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 18,
		paddingBottom: 16,
	},
	editorContent: {
		paddingBottom: 28,
		gap: 14,
	},
	editorHeaderCard: {
		borderRadius: 28,
		overflow: "hidden",
	},
	editorImage: {
		minHeight: 180,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0,0,0,0.06)",
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
	sectionLabel: {
		fontSize: 12,
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 1.2,
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
	primaryButton: {
		minWidth: 120,
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		paddingHorizontal: 18,
		borderRadius: 18,
		borderWidth: 1,
		gap: 8,
	},
	secondaryButtonPressed: {
		opacity: 0.9,
	},
	secondaryButtonText: {
		fontSize: 14,
		fontWeight: "800",
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
});

const lightThemeStyles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#F2F6FB",
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
	sectionLabel: {
		color: "#5C6C7E",
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
	secondaryButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "rgba(14, 23, 38, 0.12)",
	},
	secondaryButtonText: {
		color: "#0E1726",
	},
	primaryButton: {
		backgroundColor: "#2D6DF6",
	},
});

const darkThemeStyles = StyleSheet.create({
	safeArea: {
		backgroundColor: "#09111F",
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
	sectionLabel: {
		color: "#8FA2BB",
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
	secondaryButton: {
		backgroundColor: "#101A2C",
		borderColor: "rgba(255, 255, 255, 0.10)",
	},
	secondaryButtonText: {
		color: "#F3F7FD",
	},
	primaryButton: {
		backgroundColor: "#4F87FF",
	},
});
