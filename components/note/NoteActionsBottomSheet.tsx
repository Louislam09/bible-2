import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { useMyTheme } from "@/context/ThemeContext";
import useBackHandler from "@/hooks/useBackHandler";
import { modalState$ } from "@/state/modalState";
import { TTheme } from "@/types";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { use$ } from "@legendapp/state/react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ActionItem {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  hide?: boolean;
}

interface NoteActionsBottomSheetProps {
  selectedCount: number;
  onSync: () => void;
  onExport: () => void;
  onShare: () => void;
  onDelete: () => void;
  onSelectAll: () => void;
  onClose: () => void;
  isAllSelected: boolean;
}

const NoteActionsBottomSheet: React.FC<NoteActionsBottomSheetProps> = ({
  selectedCount,
  onSync,
  onExport,
  onShare,
  onDelete,
  onSelectAll,
  onClose,
  isAllSelected,
}) => {
  const { theme } = useMyTheme();
  const styles = getStyles(theme);
  const isOpen = use$(() => modalState$.isNoteActionsOpen.get());
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useBackHandler("BottomSheet", isOpen, () => {
    bottomSheetRef.current?.close();
    modalState$.isNoteActionsOpen.set(false);
    onClose();
  });

  useEffect(() => {
    if (isOpen) {
      setHasBeenOpened(true);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleSheetChanges = useCallback((index: number) => {
    // Only handle close if the sheet was actually opened before
    // This prevents triggering onClose on initial render when index starts at -1
    if (index === -1 && hasBeenOpened) {
      setHasBeenOpened(false);
      modalState$.isNoteActionsOpen.set(false);
      onClose();
    }
  }, [onClose, hasBeenOpened]);

  const actions: ActionItem[] = useMemo(() => [
    {
      icon: isAllSelected ? "CircleX" : "CheckCheck",
      label: isAllSelected ? "Deseleccionar todo" : "Seleccionar todo",
      onPress: onSelectAll,
      color: isAllSelected ? "#F59E0B" : theme.colors.notification,
    },
    {
      icon: "RefreshCw",
      label: "Sincronizar con la nube",
      onPress: () => {
        onSync();
        modalState$.closeNoteActionsBottomSheet();
      },
      color: theme.colors.notification,
    },
    {
      icon: "Download",
      label: "Guardar en dispositivo",
      onPress: () => {
        onExport();
        modalState$.closeNoteActionsBottomSheet();
      },
      color: theme.colors.notification,
    },
    {
      icon: "Share2",
      label: "Compartir como PDF",
      onPress: () => {
        onShare();
        modalState$.closeNoteActionsBottomSheet();
      },
      color: theme.colors.notification,
      hide: selectedCount > 1,
    },
    {
      icon: "Trash2",
      label: "Eliminar notas",
      onPress: () => {
        onDelete();
        modalState$.closeNoteActionsBottomSheet();
      },
      color: "#EF4444",
    },
  ], [isAllSelected, onSelectAll, onSync, onExport, onShare, onDelete, selectedCount, theme.colors.notification]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={["45%"]}
      backgroundStyle={{
        ...styles.bottomSheet,
        backgroundColor: theme.colors.background,
      }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: theme.colors.notification }}
      enableDynamicSizing={false}
      onChange={handleSheetChanges}
    >
      <BottomSheetScrollView style={styles.container}>
        {/* Header with selection count */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {selectedCount} {selectedCount === 1 ? 'nota seleccionada' : 'notas seleccionadas'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Actions List */}
        <View style={styles.actionsList}>
          {actions.filter(action => !action.hide).map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionItem}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Icon name={action.icon as any} size={22} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    bottomSheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderColor: colors.notification + '30',
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      backgroundColor: "transparent",
    },
    header: {
      paddingVertical: 8,
      backgroundColor: "transparent",
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      textAlign: "center",
    },
    colorRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      paddingVertical: 16,
      backgroundColor: "transparent",
    },
    colorDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    colorDotSelected: {
      borderWidth: 2,
      borderColor: "#fff",
    },
    divider: {
      height: 1,
      backgroundColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      marginVertical: 8,
    },
    actionsList: {
      paddingVertical: 8,
      backgroundColor: "transparent",
    },
    actionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 4,
      backgroundColor: "transparent",
    },
    actionIconContainer: {
      width: 40,
      alignItems: "center",
      backgroundColor: "transparent",
    },
    actionLabel: {
      fontSize: 16,
      fontWeight: "500",
      marginLeft: 12,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      paddingHorizontal: 4,
      marginTop: "auto",
      backgroundColor: "transparent",
    },
    footerLeft: {
      backgroundColor: "transparent",
    },
    footerText: {
      fontSize: 14,
      color: colors.text + '60',
    },
    footerDots: {
      flexDirection: "row",
      gap: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
  });

export default NoteActionsBottomSheet;

