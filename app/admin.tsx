import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import {
  useCheckStatus,
  useDeleteRequest,
  useGetAllRequests,
  useRequestAccess,
  useUpdateRequestStatus,
} from "@/services/queryService";
import { RequestStatus } from "@/services/types";
import { TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { format } from "date-fns";
import { Stack } from "expo-router";
import { icons } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ApprovalStatus = {
  [key: string]: {
    icon: keyof typeof icons;
    color: string;
    label: string;
  };
};

const RequestAccessScreen: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"request" | "check" | "all">(
    "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const theme = useTheme();
  const styles = getStyles(theme);

  const { mutate: submitRequest, isPending: isSubmitting } = useRequestAccess();
  const {
    mutate: checkStatus,
    isPending: isChecking,
    data: statusResult,
  } = useCheckStatus();

  const { data: requests, isFetching: isFetchingRequests } =
    useGetAllRequests();
  const { mutate: updateStatus } = useUpdateRequestStatus();
  const { mutate: deleteRequest } = useDeleteRequest();
  const requestsOrdenByCreatedAsc = ((requests as any) || []).sort(
    (a: RequestStatus, b: RequestStatus) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleSubmitRequest = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "El nombre y el correo son requeridos");
      return;
    }

    submitRequest(
      { name, email },
      {
        onSuccess: () => {
          Alert.alert(
            "Éxito",
            "Tu solicitud de acceso ha sido enviada exitosamente"
          );
          setName("");
          setEmail("");
        },
        onError: (error) => {
          Alert.alert(
            "Error",
            error instanceof Error
              ? error.message
              : "Error al enviar la solicitud"
          );
        },
      }
    );
  };

  const handleCheckStatus = () => {
    if (!searchEmail.trim()) {
      Alert.alert("Error", "El correo es requerido");
      return;
    }
    checkStatus(searchEmail);
  };

  const handleUpdateStatus = (id: string, status: RequestStatus["status"]) => {
    updateStatus(
      { id, status },
      {
        onSuccess: () => {
          Alert.alert("Éxito", "Estado actualizado exitosamente");
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
  };

  const handleDeleteRequest = (id: string) => {
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
  };

  const filteredRequests =
    ((requestsOrdenByCreatedAsc as any) || []).filter(
      (request: { name: string; email: string }) =>
        request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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

  const renderRequestItem: ListRenderItem<RequestStatus> = ({ item }) => {
    const statudIcon = approvalStatus[item.status].icon;
    const statusColor = approvalStatus[item.status].color;
    const statusLabel = approvalStatus[item.status].label;

    return (
      <View style={[styles.requestItem, { borderColor: statusColor }]}>
        <View style={styles.requestInfo}>
          <View>
            <Text style={styles.requestName}>{item.name}</Text>
            <Text style={styles.requestEmail}>{item.email}</Text>
            <Text style={styles.requestName}>{statusLabel}</Text>
            <Text style={styles.requestDate}>
              {format(new Date(item.created_at), "dd MMM yyyy, hh:mm a")}
              {/* {new Date(item.created_at).toLocaleString()} */}
            </Text>
          </View>
          <Icon name={statudIcon} color={statusColor} size={24} />
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.approveButton,
              { opacity: item.status === "approved" ? 0.5 : 1 },
            ]}
            onPress={() => handleUpdateStatus(item.id, "approved")}
          >
            <Text style={styles.actionButtonText}>Aprobar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              { opacity: item.status === "rejected" ? 0.5 : 1 },
            ]}
            onPress={() => handleUpdateStatus(item.id, "rejected")}
          >
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteRequest(item.id)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const loading = isSubmitting || isChecking || isFetchingRequests;

  return (
    <>
      <Stack.Screen
        options={{
          ...singleScreenHeader({
            theme,
            title: "Panel Admin",
            titleIcon: "ChartArea",
            headerRightProps: {
              headerRightIcon: "Trash2",
              headerRightIconColor: "red",
              onPress: () => console.log(),
              disabled: true,
              style: { opacity: 0 },
            },
          }),
        }}
      />
      <View style={styles.container}>
        {/* <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'request' && styles.activeTab]}
                        onPress={() => setActiveTab('request')}
                    >
                        <Text style={[styles.tabText, activeTab === 'request' && styles.activeTabText]}>
                            Solicitar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'check' && styles.activeTab]}
                        onPress={() => setActiveTab('check')}
                    >
                        <Text style={[styles.tabText, activeTab === 'check' && styles.activeTabText]}>
                            Verificar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.activeTab]}
                        onPress={() => setActiveTab('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
                            Todas
                        </Text>
                    </TouchableOpacity>
                </View> */}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.notification} />
          </View>
        ) : (
          <>
            {/* {activeTab === 'request' && (
                            <ScrollView style={styles.formContainer}>
                                <Text style={styles.title}>Solicitud de Acceso</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre"
                                    placeholderTextColor={theme.colors.text}
                                    value={name}
                                    onChangeText={setName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo"
                                    placeholderTextColor={theme.colors.text}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleSubmitRequest}
                                    disabled={loading}
                                >
                                    <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}

                        {activeTab === 'check' && (
                            <ScrollView style={styles.formContainer}>
                                <Text style={styles.title}>Verificar Estado</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Correo"
                                    placeholderTextColor={theme.colors.text}
                                    value={searchEmail}
                                    onChangeText={setSearchEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleCheckStatus}
                                    disabled={loading}
                                >
                                    <Text style={styles.submitButtonText}>Verificar</Text>
                                </TouchableOpacity>

                                {statusResult && (
                                    <View style={styles.statusContainer}>
                                        <Text style={styles.statusTitle}>Resultado:</Text>
                                        <FlashList
                                            data={[statusResult.data]}
                                            renderItem={renderRequestItem}
                                            estimatedItemSize={10}
                                        />
                                    </View>
                                )}
                            </ScrollView>
                        )} */}
            {activeTab === "all" && (
              <View style={styles.listContainer}>
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar por nombre o email"
                    placeholderTextColor={theme.colors.text}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
                <FlashList
                  data={filteredRequests}
                  renderItem={renderRequestItem}
                  keyExtractor={(item) => item.id}
                  estimatedItemSize={100}
                />
              </View>
            )}
          </>
        )}
      </View>
    </>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    formContainer: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 16,
    },
    input: {
      height: 40,
      borderColor: colors.text,
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      color: colors.text,
    },
    submitButton: {
      backgroundColor: colors.notification,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    title: {
      fontSize: 24,
      fontWeight: "600",
      marginBottom: 20,
      textAlign: "center",
      color: colors.text,
    },
    tabContainer: {
      flexDirection: "row",
      marginBottom: 20,
      borderRadius: 8,
      overflow: "hidden",
      borderColor: colors.text,
      borderWidth: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
    },
    activeTab: {
      backgroundColor: colors.notification,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text,
    },
    activeTabText: {
      color: "white",
      fontWeight: "600",
    },
    listContainer: {
      flex: 1,
    },
    requestItem: {
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      borderColor: colors.text,
      borderWidth: 1,
    },
    requestInfo: {
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    requestName: {
      fontSize: 16,
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
    requestStatus: {
      fontSize: 12,
      fontWeight: "bold",
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 4,
      alignSelf: "flex-start",
      color: colors.text,
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
      borderRadius: 4,
      marginLeft: 8,
    },
    approveButton: {
      backgroundColor: "#16A34A",
    },
    rejectButton: {
      backgroundColor: "#DC2626",
      marginHorizontal: 8,
    },
    deleteButton: {
      backgroundColor: "#6B0000",
    },
    actionButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 12,
    },
    statusContainer: {
      marginTop: 20,
    },
    statusTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 8,
      color: colors.text,
    },
    noRequests: {
      textAlign: "center",
      fontSize: 16,
      color: "#666",
      marginTop: 40,
    },
    searchContainer: {
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      height: 40,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      color: colors.text,
    },
  });

export default RequestAccessScreen;
