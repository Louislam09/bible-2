import { singleScreenHeader, SingleScreenHeaderProps } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import { Text } from "@/components/Themed";
import { storedData$ } from "@/context/LocalstoreContext";
import { useMyTheme } from "@/context/ThemeContext";
import { aiManager, ProviderStatus } from "@/services/ai/aiManager";
import { GROQ_MODEL } from "@/services/ai/providers/groqProvider";
import { CEREBRAS_MODEL } from "@/services/ai/providers/cerebrasProvider";
import { OPENROUTER_MODEL } from "@/services/ai/providers/openRouterProvider";
import { GEMINI_MODEL } from "@/constants/geminiModel";
import { TTheme } from "@/types";
import { use$ } from "@legendapp/state/react";
import { Redirect, Stack } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// ---------------------------------------------------------------------------
// Provider meta (static display info, not configurable by user)
// ---------------------------------------------------------------------------

const PROVIDER_META: Record<
  string,
  {
    model: string;
    quota: string;
    description: string;
    url: string;
    urlLabel: string;
    color: string;
    source: "app" | "user";
  }
> = {
  groq: {
    model: GROQ_MODEL,
    quota: "~1 000 req/día gratis",
    description:
      "El más rápido. Llama 3.3 70B genera quizzes a ~500 tokens/s. " +
      "Clave incluida en la app.",
    url: "https://console.groq.com",
    urlLabel: "console.groq.com",
    color: "#f97316",
    source: "app",
  },
  cerebras: {
    model: CEREBRAS_MODEL,
    quota: "14 400 req/día gratis · 30 RPM",
    description:
      "Inferencia ultra-rápida en chips propios. Qwen-3 235B. " +
      "Clave incluida en la app.",
    url: "https://cloud.cerebras.ai",
    urlLabel: "cloud.cerebras.ai",
    color: "#a855f7",
    source: "app",
  },
  openrouter: {
    model: OPENROUTER_MODEL,
    quota: "~200 req/día gratis · 200k contexto",
    description:
      "Router inteligente que selecciona automáticamente el mejor modelo " +
      "gratuito disponible. Tercer respaldo. Clave incluida en la app.",
    url: "https://openrouter.ai/openrouter/free",
    urlLabel: "openrouter.ai/openrouter/free",
    color: "#6366f1",
    source: "app",
  },
  gemini: {
    model: GEMINI_MODEL,
    quota: "~20 req/día gratis",
    description:
      "Clave configurada en .env (EXPO_PUBLIC_GEMINI_API_KEY). " +
      "Cuarto respaldo. Si la clave de la app no está configurada, " +
      "se puede definir un override en ai-setup.",
    url: "https://aistudio.google.com/app/apikey",
    urlLabel: "aistudio.google.com",
    color: "#3b82f6",
    source: "app",
  },
};

const PRIORITY_ORDER = ["groq", "cerebras", "openrouter", "gemini"];

// ---------------------------------------------------------------------------
// ProviderStatusCard
// ---------------------------------------------------------------------------

interface ProviderCardProps {
  status: ProviderStatus;
  styles: ReturnType<typeof getStyles>;
  theme: TTheme;
}

function ProviderStatusCard({ status, styles, theme }: ProviderCardProps) {
  const meta = PROVIDER_META[status.id];
  if (!meta) return null;

  const isActive = status.available && !status.onCooldown;
  const color = meta.color;

  const statusLabel = !status.available
    ? status.id === "gemini"
      ? "Sin configurar"
      : "Sin clave"
    : status.onCooldown
      ? `En cooldown — disponible en ${status.cooldownLabel}`
      : "Activo";

  const statusIcon = !status.available
    ? "Circle"
    : status.onCooldown
      ? "Clock"
      : "CheckCircle2";

  const statusColor = !status.available
    ? theme.colors.text + "50"
    : status.onCooldown
      ? "#f59e0b"
      : "#22c55e";

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: isActive ? color + "55" : theme.colors.border,
          opacity: status.available ? 1 : 0.75,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={styles.cardTitle}>{status.name}</Text>
          <View
            style={[
              styles.sourceBadge,
              {
                backgroundColor: meta.source === "app" ? color + "22" : "#3b82f622",
                borderColor: meta.source === "app" ? color : "#3b82f6",
              },
            ]}
          >
            <Text
              style={[
                styles.sourceBadgeText,
                { color: meta.source === "app" ? color : "#3b82f6" },
              ]}
            >
              {meta.source === "app" ? "CLAVE DE LA APP" : "CLAVE DEL USUARIO"}
            </Text>
          </View>
        </View>

        <Text style={[styles.cardModel, { color: theme.colors.text + "80" }]}>
          {meta.model} · {meta.quota}
        </Text>
      </View>

      {/* Status row */}
      <View style={styles.statusRow}>
        <Icon name={statusIcon as any} size={15} color={statusColor} />
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusLabel}
        </Text>
      </View>

      <Text style={[styles.description, { color: theme.colors.text + "CC" }]}>
        {meta.description}
      </Text>

      {/* Docs link */}
      <TouchableOpacity
        style={styles.link}
        onPress={() => Linking.openURL(meta.url)}
      >
        <Icon name="ExternalLink" size={14} color={theme.colors.notification} />
        <Text style={[styles.linkText, { color: theme.colors.notification }]}>
          {meta.urlLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function AIProvidersScreen() {
  const { theme } = useMyTheme();
  const styles = getStyles(theme as TTheme);

  const storedIsAdmin = use$(() => storedData$.isAdmin.get());
  const user = use$(() => storedData$.user.get());
  const isAdmin = storedIsAdmin || user?.isAdmin;

  // Keep Gemini key in sync so statuses are accurate
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  useEffect(() => {
    aiManager.setGeminiKey(googleAIKey ?? "");
  }, [googleAIKey]);

  if (!isAdmin) return <Redirect href="/settings" />;

  const [tick, setTick] = useState(0);
  // Refresh statuses every 30 s (for cooldown countdowns)
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const statuses = useMemo(
    () => {
      const raw = aiManager.getProviderStatuses();
      return PRIORITY_ORDER.map((id) => raw.find((s) => s.id === id)).filter(
        (s): s is ProviderStatus => !!s,
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tick, googleAIKey],
  );

  const activeCount = statuses.filter((s) => s.available && !s.onCooldown).length;

  const screenOptions: any = useMemo(
    () =>
      ({
        theme,
        title: "Proveedores de IA",
        titleIcon: "Cpu",
        headerRightProps: {
          headerRightIcon: "RefreshCw",
          headerRightIconColor: theme.colors.text,
          onPress: () => setTick((n) => n + 1),
          disabled: false,
          style: {},
        },
      }) as SingleScreenHeaderProps,
    [theme],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={singleScreenHeader(screenOptions)} />
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Proveedores de IA</Text>
        <Text style={[styles.pageDescription, { color: theme.colors.text + "CC" }]}>
          La app prueba los proveedores en orden (Groq → Cerebras → OpenRouter →
          Gemini) y pasa automáticamente al siguiente cuando uno alcanza su límite.
          Las claves de la app son gratuitas para todos los usuarios.
        </Text>

        {/* Summary banner */}
        <View
          style={[
            styles.summaryBox,
            {
              backgroundColor: theme.colors.card,
              borderColor: activeCount > 0 ? "#22c55e55" : theme.colors.border,
            },
          ]}
        >
          <View style={styles.summaryTitleRow}>
            <Icon
              name={activeCount > 0 ? "Zap" : "ZapOff"}
              size={16}
              color={activeCount > 0 ? "#22c55e" : "#ef4444"}
            />
            <Text
              style={[
                styles.summaryTitle,
                { color: activeCount > 0 ? "#22c55e" : "#ef4444" },
              ]}
            >
              {activeCount} de {statuses.length} proveedores activos
            </Text>
          </View>
          <Text style={[styles.summaryNote, { color: theme.colors.text + "80" }]}>
            Con caché local, un usuario típico genera solo 1-5 quizzes nuevos/día.
            Los cooldowns se reinician al cerrar la app.
          </Text>
        </View>

        {/* Provider cards */}
        {statuses.map((status, index) => (
          <View key={status.id}>
            {index > 0 && (
              <View style={styles.priorityConnector}>
                <Icon name="ArrowDown" size={14} color={theme.colors.text + "40"} />
                <Text style={[styles.priorityLabel, { color: theme.colors.text + "40" }]}>
                  respaldo
                </Text>
              </View>
            )}
            <ProviderStatusCard
              status={status}
              styles={styles}
              theme={theme as TTheme}
            />
          </View>
        ))}

        <Text style={[styles.footer, { color: theme.colors.text + "50" }]}>
          Para añadir un nuevo proveedor: crea un archivo en{" "}
          services/ai/providers/ y regístralo en aiManager.ts.
        </Text>

      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, gap: 4 },

    pageTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 6,
    },
    pageDescription: { fontSize: 14, lineHeight: 21, marginBottom: 12 },

    summaryBox: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 6,
      marginBottom: 16,
    },
    summaryTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    summaryTitle: { fontSize: 14, fontWeight: "700" },
    summaryNote: { fontSize: 12, lineHeight: 18 },

    priorityConnector: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingLeft: 20,
      paddingVertical: 2,
    },
    priorityLabel: { fontSize: 11 },

    card: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
      gap: 8,
      marginBottom: 2,
    },
    cardHeader: { gap: 3 },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    cardTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
    sourceBadge: {
      borderWidth: 1,
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 2,
    },
    sourceBadgeText: { fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
    cardModel: { fontSize: 12 },

    statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    statusText: { fontSize: 13, fontWeight: "600" },

    description: { fontSize: 13, lineHeight: 19 },

    link: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 2 },
    linkText: { fontSize: 13 },

    footer: { fontSize: 11, textAlign: "center", marginTop: 20, lineHeight: 17 },
  });
