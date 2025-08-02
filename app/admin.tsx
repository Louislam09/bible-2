import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { pb } from "@/globalConfig";
import useRealtimeCollection from "@/hooks/useRealtimeCollection";
import {
  NotificationPreferences,
  useNotificationService,
} from "@/services/notificationServices";
import {
  useDeleteRequest,
  useUpdateRequestStatus,
} from "@/services/queryService";
import { RequestStatus } from "@/services/types";
import { Collections, RequestData, TTheme } from "@/types";
import { showToast } from "@/utils/showToast";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { format } from "date-fns";
import { Stack, useRouter } from "expo-router";
import { icons } from "lucide-react-native";
import { RecordModel } from "pocketbase";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ApprovalStatus = {
  [key: string]: {
    icon: keyof typeof icons;
    color: string;
    label: string;
  };
};

const approvalStatus: ApprovalStatus = {
  pending: {
    icon: "Clock",
    color: "#efbf43",
    label: "Solicitud en proceso",
  },
  approved: {
    icon: "Check",
    color: "#16A34A",
    label: "Aprobado",
  },
  rejected: {
    icon: "X",
    color: "#DC2626",
    label: "Rechazado",
  },
};

const RequestItem = ({
  item,
  onUpdateStatus,
  onDeleteRequest,
}: {
  item: RequestStatus;
  onUpdateStatus: (
    item: RequestStatus,
    status: RequestStatus["status"]
  ) => void;
  onDeleteRequest: (id: string) => void;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const statusIcon = approvalStatus[item.status].icon;
  const statusColor = approvalStatus[item.status].color;
  const statusLabel = approvalStatus[item.status].label;

  const onUpdate = ({ status }: { status: RequestStatus["status"] }) => {
    onUpdateStatus(item, status);
  };

  return (
    <View
      style={[
        styles.requestItem,
        { borderLeftWidth: 4, borderLeftColor: statusColor },
      ]}
    >
      <View style={styles.requestInfo}>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.name}</Text>
          {/* <Text style={styles.requestEmail}>email</Text> */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Icon name={statusIcon} color={statusColor} size={16} />
            <Text style={[styles.statusLabel, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          <Text style={styles.requestDate}>
            {format(new Date(item.created), "dd MMM yyyy, hh:mm a")}
          </Text>
        </View>
        <Icon name={statusIcon} color={statusColor} size={28} />
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.approveButton,
            { opacity: item.status === "approved" ? 0.5 : 1 },
          ]}
          onPress={() => onUpdate({ status: "approved" })}
          disabled={item.status === "approved"}
          accessibilityLabel="Aprobar solicitud"
        >
          <Icon name="Check" color="#fff" size={16} />
          <Text style={styles.actionButtonText}>Aprobar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.rejectButton,
            { opacity: item.status === "rejected" ? 0.5 : 1 },
          ]}
          onPress={() => onUpdate({ status: "rejected" })}
          disabled={item.status === "rejected"}
          accessibilityLabel="Rechazar solicitud"
        >
          <Icon name="X" color="#fff" size={16} />
          <Text style={styles.actionButtonText}>Rechazar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDeleteRequest(item.id)}
          accessibilityLabel="Eliminar solicitud"
        >
          <Icon name="Trash2" color="#fff" size={16} />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Filter components
const FilterOption = ({
  label,
  value,
  currentFilter,
  onSelect,
}: {
  label: string;
  value: string | null;
  currentFilter: string | null;
  onSelect: (value: string | null) => void;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);
  const isSelected = value === currentFilter;

  return (
    <TouchableOpacity
      style={[styles.filterOption, isSelected && styles.selectedFilterOption]}
      onPress={() => onSelect(value)}
    >
      <Text
        style={[
          styles.filterOptionText,
          isSelected && styles.selectedFilterOptionText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Search bar component
const SearchBar = ({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.searchContainer}>
      <Icon
        name="Search"
        color={theme.colors.text}
        size={20}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor={`${theme.colors.text}80`}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Icon name="X" color={theme.colors.text} size={20} />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Empty state component
const EmptyState = ({
  icon,
  title,
  message,
}: {
  icon: keyof typeof icons;
  title: string;
  message: string;
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.emptyStateContainer}>
      <Icon name={icon} color={`${theme.colors.text}60`} size={64} />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateMessage}>{message}</Text>
    </View>
  );
};

const RequestAccessScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"request" | "check" | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<
    RequestStatus["status"] | null
  >(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { sendPushNotificationToUser } = useNotificationService();

  const theme = useTheme();
  const styles = getStyles(theme);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    data: requests,
    loading: isFetchingRequests,
    error: requestError,
  } = useRealtimeCollection<RequestData & RecordModel>({
    collection: Collections.AccessRequest,
    options: {
      expand: "user",
      sort: "-created",
    },
  });

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateRequestStatus();
  const { mutate: deleteRequest, isPending: isDeleting } = useDeleteRequest();

  const filteredAndSortedRequests = useMemo(() => {
    if (!requests) return [];

    // First sort by date
    const sortedRequests = [...(requests as any)].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Then apply filters
    return sortedRequests.filter((request) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        request?.name?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        request?.email?.toLowerCase().includes(searchQuery?.toLowerCase());

      const matchesStatus =
        statusFilter === null || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleUpdateStatus = useCallback(
    async (item: RequestStatus, status: RequestStatus["status"]) => {
      try {
        const { id, user } = item;
        console.log({ user, status });
        let currentUserPushToken = null;

        const currentUserSettings = await pb
          .collection(Collections.Settings)
          .getFirstListItem(`user = "${user}"`);

        if (currentUserSettings) {
          const currentUserNotificationPreferences = currentUserSettings
            ?.settings?.notificationPreferences as NotificationPreferences;

          if (currentUserNotificationPreferences?.notificationEnabled) {
            currentUserPushToken = currentUserNotificationPreferences.pushToken;
          }
        }

        updateStatus(
          { id, status },
          {
            onSuccess: () => {
              showToast("Estado actualizado exitosamente", "SHORT");
              if (currentUserPushToken) {
                sendPushNotificationToUser({
                  pushToken: currentUserPushToken,
                  title: "📖 Solicitud de acceso al himnario",
                  body: `Tu solicitud ha sido ${
                    status === "approved"
                      ? "aprobada ✅. Ya puedes acceder al himnario."
                      : "rechazada ❌. Si crees que se trata de un error, contáctanos."
                  }`,
                  options: {
                    badge: 1,
                  },
                });
              }
            },
            onError: (error) => {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Error al actualizar el estado"
              );
            },
          }
        );
      } catch (error: any) {
        console.log({ error }, error.originalError);
      }
    },
    [updateStatus]
  );

  const handleDeleteRequest = useCallback(
    (id: string) => {
      Alert.alert(
        "Confirmar Eliminación",
        "¿Estás seguro que deseas eliminar esta solicitud?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => {
              deleteRequest(id, {
                onSuccess: () => {
                  Alert.alert("Éxito", "Solicitud eliminada exitosamente");
                },
                onError: (error) => {
                  Alert.alert(
                    "Error",
                    error instanceof Error
                      ? error.message
                      : "Error al eliminar la solicitud"
                  );
                },
              });
            },
          },
        ]
      );
    },
    [deleteRequest]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    console.log("refreshing");
    setIsRefreshing(false);
  }, []);

  const renderRequestItem: ListRenderItem<RequestStatus> = useCallback(
    ({ item }) => {
      return (
        <RequestItem
          item={item}
          onUpdateStatus={handleUpdateStatus}
          onDeleteRequest={handleDeleteRequest}
        />
      );
    },
    [handleUpdateStatus, handleDeleteRequest]
  );

  const loading = isFetchingRequests || isUpdating || isDeleting;

  const renderContent = () => {
    if (loading && !isRefreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.notification} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case "all":
      default:
        return (
          <View style={styles.listContainer}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por nombre o email"
            />

            <View style={styles.filterContainer}>
              <Text style={styles.filterLabel}>Filtrar por estado:</Text>
              <View style={styles.filterOptions}>
                <FilterOption
                  label="Todos"
                  value={null}
                  currentFilter={statusFilter}
                  onSelect={setStatusFilter as any}
                />
                <FilterOption
                  label="Pendientes"
                  value="pending"
                  currentFilter={statusFilter}
                  onSelect={setStatusFilter as any}
                />
                <FilterOption
                  label="Aprobados"
                  value="approved"
                  currentFilter={statusFilter}
                  onSelect={setStatusFilter as any}
                />
                <FilterOption
                  label="Rechazados"
                  value="rejected"
                  currentFilter={statusFilter}
                  onSelect={setStatusFilter as any}
                />
              </View>
            </View>

            <Text style={styles.resultCount}>
              Mostrando {filteredAndSortedRequests.length}{" "}
              {filteredAndSortedRequests.length === 1
                ? "solicitud"
                : "solicitudes"}
            </Text>

            {filteredAndSortedRequests.length > 0 ? (
              <FlashList
                data={filteredAndSortedRequests}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item.id}
                estimatedItemSize={150}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[theme.colors.notification]}
                    tintColor={theme.colors.notification}
                  />
                }
              />
            ) : (
              <EmptyState
                icon="Inbox"
                title="Sin resultados"
                message="No se encontraron solicitudes que coincidan con tu búsqueda."
              />
            )}
          </View>
        );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Gestión de Accesos",
            titleIcon: "ShieldCheck",
            headerRightProps: {
              headerRightIcon: "House",
              headerRightIconColor: theme.colors.text,
              onPress: () => router.push("/"),
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
      <View style={styles.container}>{renderContent()}</View>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: colors.text,
    },
    formContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      height: 50,
      borderColor: colors.border,
      borderWidth: 1,
      paddingHorizontal: 16,
      borderRadius: 8,
      color: colors.text,
      backgroundColor: `${colors.card}50`,
      fontSize: 16,
    },
    submitButton: {
      backgroundColor: colors.notification,
      padding: 16,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "center",
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonIcon: {
      marginRight: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: "600",
      marginLeft: 12,
      color: colors.text,
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      borderRadius: 8,
      marginHorizontal: 4,
    },
    activeTab: {
      backgroundColor: colors.notification,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginLeft: 6,
    },
    activeTabText: {
      color: "white",
      fontWeight: "600",
    },
    listContainer: {
      flex: 1,
      padding: 16,
    },
    requestItem: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    requestInfo: {
      marginBottom: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    requestDetails: {
      flex: 1,
      marginRight: 12,
    },
    requestName: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 4,
      color: colors.text,
    },
    requestEmail: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
      opacity: 0.7,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 16,
      alignSelf: "flex-start",
      marginBottom: 8,
    },
    statusLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginLeft: 4,
    },
    requestDate: {
      fontSize: 12,
      color: colors.text,
      opacity: 0.7,
    },
    requestActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    actionButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      marginLeft: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    approveButton: {
      backgroundColor: "#16A34A",
    },
    rejectButton: {
      backgroundColor: "#DC2626",
    },
    deleteButton: {
      backgroundColor: "#6B0000",
    },
    actionButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 12,
      marginLeft: 4,
    },
    statusResultContainer: {
      marginTop: 24,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      color: colors.text,
    },
    searchContainer: {
      paddingVertical: 8,
      borderRadius: 8,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: `${colors.card}50`,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    searchIcon: {
      marginRight: 8,
      opacity: 0.7,
    },
    searchInput: {
      flex: 1,
      height: 40,
      color: colors.text,
      fontSize: 16,
    },
    filterContainer: {
      marginBottom: 16,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: "row",
      // flexWrap: "wrap",
    },
    filterOption: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
      backgroundColor: `${colors.card}50`,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedFilterOption: {
      backgroundColor: `${colors.notification}20`,
      borderColor: colors.notification,
    },
    filterOptionText: {
      fontSize: 12,
      color: colors.text,
    },
    selectedFilterOptionText: {
      color: colors.notification,
      fontWeight: "600",
    },
    resultCount: {
      fontSize: 14,
      color: `${colors.text}80`,
      marginBottom: 12,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateMessage: {
      fontSize: 16,
      color: `${colors.text}80`,
      textAlign: "center",
    },
  });

export default RequestAccessScreen;
