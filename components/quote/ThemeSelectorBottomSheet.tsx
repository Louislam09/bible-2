import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMyTheme } from "@/context/ThemeContext";
import { TTheme } from "@/types";
import {
  QUOTES_DATA,
  TQuoteDataItem,
  TQuoteDataSection,
  BACKGROUND_IMAGES,
} from "@/constants/quotesData";
import Icon from "@/components/Icon";

interface ThemeSelectorBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  selectedTheme?: TQuoteDataItem;
  onThemeSelect: (theme: TQuoteDataItem) => void;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get("window");
const CARD_SIZE = (screenWidth - 60) / 4; // 4 cards per row with padding

const ThemeSelectorBottomSheet: React.FC<ThemeSelectorBottomSheetProps> = ({
  bottomSheetRef,
  selectedTheme,
  onThemeSelect,
  onClose,
}) => {
  const { theme } = useMyTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleThemeSelect = useCallback(
    (themeItem: TQuoteDataItem) => {
      onThemeSelect(themeItem);
      bottomSheetRef.current?.dismiss();
    },
    [onThemeSelect, bottomSheetRef]
  );

  const renderThemeCard = useCallback(
    (themeItem: TQuoteDataItem, isSelected: boolean) => {
      return (
        <TouchableOpacity
          key={themeItem.id}
          style={[
            styles.themeCard,
            { width: CARD_SIZE, height: CARD_SIZE + 20 },
          ]}
          onPress={() => handleThemeSelect(themeItem)}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: themeItem.backgroundImageUrl }}
            style={styles.cardBackground}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay} />
          <Text
            style={[
              styles.previewText,
              { color: "#ffffff", fontFamily: themeItem.font.name },
            ]}
          >
            {themeItem.previewText}
          </Text>
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Icon name="Check" size={16} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      );
    },
    [handleThemeSelect, styles]
  );

  const renderSection = useCallback(
    (section: TQuoteDataSection) => {
      return (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          <View
            style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}
            // horizontal
            // showsHorizontalScrollIndicator={false}
            // contentContainerStyle={styles.themesContainer}
          >
            {section.items.map((themeItem) =>
              renderThemeCard(themeItem, selectedTheme?.id === themeItem.id)
            )}
          </View>
        </View>
      );
    },
    [renderThemeCard, selectedTheme, styles]
  );

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={["85%"]}
      backgroundStyle={styles.bottomSheet}
      handleIndicatorStyle={styles.indicator}
      enablePanDownToClose
    >
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <Text style={styles.title}>Themes</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="X" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {QUOTES_DATA.map(renderSection)}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    indicator: {
      backgroundColor: colors.text,
      width: 40,
      height: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 8,
    },
    closeText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: "500",
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    placeholder: {
      width: 60, // Same width as close button to center the title
    },
    contentContainer: {
      paddingBottom: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 12,
      paddingHorizontal: 20,
      textTransform: "capitalize",
    },
    themesContainer: {
      paddingHorizontal: 20,
      gap: 12,
    },
    themeCard: {
      borderRadius: 12,
      overflow: "hidden",
      position: "relative",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cardBackground: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    cardOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
    previewText: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -20 }, { translateY: -10 }],
      fontSize: 16,
      fontWeight: "600",
      textAlign: "center",
    },
    selectedIndicator: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
  });

export default ThemeSelectorBottomSheet;
