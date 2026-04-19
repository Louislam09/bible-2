import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import {
  QUIZ_HISTORY_BOOK_CARD_OPTIONS,
  parseQuizHistoryBookCardVariant,
  type QuizHistoryBookCardVariant,
} from "@/constants/quizHistoryBookCardVariant";
import type { QuizHistoryBooksLayout } from "@/constants/quizHistoryWebViewHtml";
import { storedData$ } from "@/context/LocalstoreContext";
import { headerIconSize } from "@/constants/size";
import { use$ } from "@legendapp/state/react";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RADIUS, SP, type QuizSurfaces } from "./quizHistoryTokens";

type Props = {
  visible: boolean;
  onClose: () => void;
  surfaces: QuizSurfaces;
  booksLayout: QuizHistoryBooksLayout;
  onBooksLayoutChange: (next: QuizHistoryBooksLayout) => void;
};

export const QuizHistoryBooksSettingsModal: React.FC<Props> = ({
  visible,
  onClose,
  surfaces,
  booksLayout,
  onBooksLayoutChange,
}) => {
  const insets = useSafeAreaInsets();
  const selectedCard = use$(() =>
    parseQuizHistoryBookCardVariant(
      storedData$.quizHistoryBookCardVariant.get(),
    ),
  );

  const pickCard = useCallback((value: QuizHistoryBookCardVariant) => {
    void Haptics.selectionAsync();
    storedData$.quizHistoryBookCardVariant.set(value);
  }, []);

  const pickLayout = useCallback(
    (next: QuizHistoryBooksLayout) => {
      void Haptics.selectionAsync();
      onBooksLayoutChange(next);
    },
    [onBooksLayoutChange],
  );

  const close = useCallback(() => {
    void Haptics.selectionAsync();
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "fullScreen" : undefined}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.screen,
          {
            backgroundColor: surfaces.card,
            paddingTop: insets.top,
          },
        ]}
      >
        <View isTransparent style={styles.navRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            onPress={close}
            hitSlop={12}
            style={styles.navIconBtn}
          >
            <Icon name="X" size={26} color={surfaces.text} strokeWidth={2} />
          </Pressable>
          <Text
            style={[styles.navTitle, { color: surfaces.text }]}
            numberOfLines={1}
          >
            Listado de libros
          </Text>
          <View style={styles.navIconBtn} />
        </View>

        <Text style={[styles.sheetSubtitle, { color: surfaces.muted }]}>
          Disposición y estilo de las tarjetas
        </Text>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, SP.md) + SP.lg },
          ]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionLabel, { color: surfaces.muted }]}>
            Disposición
          </Text>
          <View isTransparent style={styles.layoutRow}>
            <Pressable
              onPress={() => pickLayout("list")}
              style={({ pressed }) => [
                styles.layoutChip,
                {
                  borderColor:
                    booksLayout === "list"
                      ? surfaces.accent
                      : surfaces.border,
                  backgroundColor:
                    booksLayout === "list"
                      ? surfaces.accentSoft
                      : "transparent",
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <Icon
                name="LayoutList"
                size={headerIconSize}
                color={
                  booksLayout === "list" ? surfaces.accent : surfaces.muted
                }
                strokeWidth={booksLayout === "list" ? 2.25 : 1.5}
              />
              <Text
                style={[styles.layoutChipLabel, { color: surfaces.text }]}
              >
                Lista
              </Text>
            </Pressable>
            <Pressable
              onPress={() => pickLayout("grid")}
              style={({ pressed }) => [
                styles.layoutChip,
                {
                  borderColor:
                    booksLayout === "grid"
                      ? surfaces.accent
                      : surfaces.border,
                  backgroundColor:
                    booksLayout === "grid"
                      ? surfaces.accentSoft
                      : "transparent",
                  opacity: pressed ? 0.92 : 1,
                },
              ]}
            >
              <Icon
                name="LayoutGrid"
                size={headerIconSize}
                color={
                  booksLayout === "grid" ? surfaces.accent : surfaces.muted
                }
                strokeWidth={booksLayout === "grid" ? 2.25 : 1.5}
              />
              <Text
                style={[styles.layoutChipLabel, { color: surfaces.text }]}
              >
                Cuadrícula
              </Text>
            </Pressable>
          </View>

          <Text
            style={[
              styles.sectionLabel,
              styles.sectionLabelSpaced,
              { color: surfaces.muted },
            ]}
          >
            Estilo de tarjeta
          </Text>
          {QUIZ_HISTORY_BOOK_CARD_OPTIONS.map((opt) => {
            const isOn = opt.value === selectedCard;
            return (
              <Pressable
                key={opt.value}
                onPress={() => pickCard(opt.value)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    borderColor: isOn ? surfaces.accent : surfaces.border,
                    backgroundColor: isOn
                      ? surfaces.accentSoft
                      : "transparent",
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <View isTransparent style={styles.rowText}>
                  <Text
                    style={[styles.rowTitle, { color: surfaces.text }]}
                    numberOfLines={2}
                  >
                    {opt.title}
                  </Text>
                  <Text
                    style={[styles.rowSub, { color: surfaces.muted }]}
                    numberOfLines={3}
                  >
                    {opt.subtitle}
                  </Text>
                  <Text style={[styles.badge, { color: surfaces.softText }]}>
                    {opt.value}
                  </Text>
                </View>
                {isOn ? (
                  <Icon
                    name="Check"
                    size={22}
                    color={surfaces.accent}
                    strokeWidth={2.5}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.md,
    paddingBottom: SP.sm,
    gap: SP.sm,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: SP.lg,
    paddingBottom: SP.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SP.md,
    gap: SP.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sectionLabelSpaced: {
    marginTop: SP.sm,
  },
  layoutRow: {
    flexDirection: "row",
    gap: SP.sm,
  },
  layoutChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SP.sm,
    paddingVertical: SP.md,
    paddingHorizontal: SP.md,
    borderRadius: RADIUS.cell,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  layoutChipLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SP.md,
    paddingHorizontal: SP.md,
    borderRadius: RADIUS.cell,
    borderWidth: StyleSheet.hairlineWidth * 2,
    gap: SP.md,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  rowSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    fontSize: 11,
    opacity: 0.85,
  },
});
