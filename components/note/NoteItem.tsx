import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { noteSelectors$ } from "@/state/notesState";
import { TNote, TTheme } from "@/types";
import convertHtmlToText from "@/utils/convertHtmlToText";
import { use$ } from "@legendapp/state/react";
import { format } from "date-fns";
import { NotebookText } from "lucide-react-native";
import React from "react";
import {
    Platform,
    StyleSheet,
    TouchableOpacity,
} from "react-native";

interface NoteItemProps {
    item: TNote | any;
    onPress: (id: number) => void;
    theme: TTheme;
}

const NoteItem: React.FC<NoteItemProps> = ({
    item,
    onPress,
    theme,
}) => {
    const isSelectionActive = use$(() => noteSelectors$.isSelectionMode.get());
    const selectedItems = use$(() => noteSelectors$.selectedNoteIds.get());
    const isSelected = selectedItems.has(item.id)

    const formattedDate = format(
        new Date(item.updated_at || item.created_at),
        "MMM dd, yyyy - hh:mm a"
    );
    const preview = item.note_text?.trim().substring(0, 50);
    let data;
    try {
        data = JSON.parse(item.note_text);
    } catch (error) {
        data = { htmlString: item.note_text || "" };
    }
    const notePreview = preview ? convertHtmlToText(data?.htmlString || item.note_text, { maxLength: 100, preserveLineBreaks: false, preserveWhitespace: true }) : '';

    const styles = getStyles(theme);

    const handlePress = () => {
        if (isSelectionActive) {
            noteSelectors$.toggleNoteSelection(item.id);
            return;
        }
        onPress(item.id);
    };

    return (
        <TouchableOpacity
            style={styles.verseContainer}
            activeOpacity={0.7}
            onPress={() => handlePress()}
            onLongPress={() => noteSelectors$.toggleNoteSelection(item.id)}
            accessible={true}
            accessibilityLabel={`Nota: ${item.title}`}
            accessibilityRole="button"
            accessibilityHint="Pulsa para ver o editar esta nota"
        >
            <View style={styles.verseItem}>
                {isSelectionActive && (
                    <View style={styles.checkboxContainer}>
                        <View style={[
                            styles.checkbox,
                            isSelected && styles.checkboxSelected
                        ]}>
                            {isSelected && <Icon name="Check" size={16} color="#fff" />}
                        </View>
                    </View>
                )}
                <View style={styles.verseBody}>
                    <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        style={styles.verseText}
                    >
                        {item.title || 'Sin título'}
                    </Text>

                    {notePreview && (
                        <Text
                            ellipsizeMode="tail"
                            numberOfLines={2}
                            style={styles.notePreview}
                        >
                            {notePreview}
                        </Text>
                    )}

                    <View style={styles.dateContainer}>
                        <Icon
                            name="CalendarDays"
                            size={16}
                            color={theme.colors.notification}
                        />
                        <Text style={styles.verseDate}>
                            {formattedDate}
                        </Text>
                    </View>
                </View>
                <View style={styles.noteIconContainer}>
                    <NotebookText
                        size={30}
                        color={theme.colors.text}
                        style={{ opacity: 0.8 }}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const getStyles = ({ colors }: TTheme) =>
    StyleSheet.create({
        verseContainer: {
            borderColor: colors.border,
            borderWidth: 0.5,
            borderRadius: 8,
            backgroundColor: colors.card,
            marginHorizontal: 4,
            marginVertical: 3,
        },
        verseItem: {
            flex: 1,
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexDirection: "row",
            padding: 12,
        },
        verseBody: {
            flex: 1,
            height: "100%",
            alignItems: "flex-start",
            justifyContent: "space-around",
            marginRight: 10,
        },
        verseText: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 6,
            color: colors.text,
        },
        checkboxContainer: {
            marginRight: 12,
            justifyContent: "center",
            marginBottom: 10
        },
        checkbox: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: colors.notification,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
        },
        checkboxSelected: {
            backgroundColor: colors.notification,
            borderColor: colors.notification,
        },
        notePreview: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.8,
            marginBottom: 8,
        },
        dateContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
        },
        verseDate: {
            fontSize: 14,
            color: colors.text,
            opacity: 0.7,
        },
        noteIconContainer: {
            backgroundColor: "transparent",
            justifyContent: "center",
            alignItems: "center",
            width: 40,
            height: 40,
            borderRadius: 20,
            overflow: 'hidden',
        },
    });

export default NoteItem;