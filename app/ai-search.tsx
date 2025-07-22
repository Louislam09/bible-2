import BibleEmptyState from "@/components/AISearchEmptyState";
import { singleScreenHeader } from "@/components/common/singleScreenHeader";
import Icon from "@/components/Icon";
import ScreenWithAnimation from "@/components/ScreenWithAnimation";
import { DB_BOOK_NAMES } from "@/constants/BookNames";
import { storedData$ } from "@/context/LocalstoreContext";
import useBibleAI from "@/hooks/useBibleAI";
import { bibleState$ } from "@/state/bibleState";
import { Screens, TTheme } from "@/types";
import { parseBibleReferences } from "@/utils/extractVersesInfo";
import { use$ } from "@legendapp/state/react";
import { useTheme } from "@react-navigation/native";
import { Stack, useRouter } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const BibleAIScreen = ({ }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTranslation, setSelectedTranslation] = useState("RV1960");
  const [activeTab, setActiveTab] = useState("Verses");
  const googleAIKey = use$(() => storedData$.googleAIKey.get());
  const theme = useTheme();
  const styles = getStyles(theme);
  const router = useRouter();

  const {
    loading,
    error,
    predictedAnswer,
    verses,
    articles,
    searchBible,
    clearResults,
    retry,
    hasResults,
    isEmpty,
  } = useBibleAI(googleAIKey);


  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchBible(searchQuery, selectedTranslation);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    clearResults();
  };

  const handleRetry = () => {
    retry(searchQuery, selectedTranslation);
  };

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert("Error de búsqueda", error, [
        { text: "Cancelar", style: "cancel" },
        { text: "Reintentar", onPress: handleRetry },
      ]);
    }
  }, [error]);

  const TabButton = ({
    title,
    isActive,
    onPress,
  }: {
    title: string;
    isActive: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <Icon name="Book" size={20} color={theme.colors.text} />
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const onVersePress = (reference: string) => {
    const parsedReferences = parseBibleReferences(reference)[0];
    const currentBook = DB_BOOK_NAMES.find(
      (x) => x.longName?.toLocaleLowerCase() === parsedReferences?.book?.toLocaleLowerCase() ||
        x.longName?.toLocaleLowerCase().includes(parsedReferences?.book?.toLocaleLowerCase())
    );

    const queryInfo = {
      book: currentBook?.longName || "Mateo",
      chapter: +parsedReferences.chapter,
      verse: +parsedReferences.verse || 0,
    };
    bibleState$.changeBibleQuery({
      ...queryInfo,
      shouldFetch: true,
      isHistory: true,
    });
    router.push({ pathname: Screens.Home, params: queryInfo });
  };

  return (
    <ScreenWithAnimation
      icon="Sparkles"
      iconColor="#fedf75"
      speed={2}
      title="Busqueda Inteligente"
    >
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            ...singleScreenHeader({
              theme,
              title: "Busqueda Inteligente",
              titleIcon: "Sparkles",
              titleIconColor: "#fedf75",
              headerRightProps: {
                headerRightIconColor: "",
                onPress: () => console.log(),
                disabled: true,
                style: { opacity: 0 },
              },
            }),
          }}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Haz una pregunta sobre la Biblia..."
            placeholderTextColor={theme.colors.text + "95"}
            onSubmitEditing={handleSearch}
            editable={!loading}
          />
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Icon name="X" size={20} color={theme.colors.text + 90} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchButton, loading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="Search" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>

        {/* Translation Selector */}
        <View style={styles.translationContainer}>
          <Text style={styles.translationLabel}>Traducción: </Text>
          <TouchableOpacity style={styles.translationSelector}>
            <Text style={styles.translationText}>{selectedTranslation}</Text>
            <ChevronDown size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.notification} />
              <Text style={styles.loadingText}>
                Buscando en las escrituras...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Icon name="CircleAlert" size={48} color="#d32f2f" />
              <Text style={styles.errorText}>Algo salió mal</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State */}
          {isEmpty && !loading && !error && (
            <BibleEmptyState
              onExamplePress={(question) => {
                setSearchQuery(question);
                searchBible(question, selectedTranslation);
              }}
            />
          )}

          {/* Predicted Answer */}
          {predictedAnswer && !loading && (
            <View style={styles.predictedAnswerCard}>
              <Text style={styles.predictedAnswerTitle}>Respuesta Predicha*</Text>
              <Text style={styles.answerTitle}>{predictedAnswer.title}</Text>
              <Text style={styles.answerDescription}>
                {predictedAnswer.description}
              </Text>
              <Text style={styles.answerReference}>
                {predictedAnswer.reference}
              </Text>
            </View>
          )}

          {/* Tabs - only show if we have results */}
          {hasResults && !loading && (
            <View style={styles.tabContainer}>
              <TabButton
                title={`Versículos (${verses.length})`}
                isActive={activeTab === "Verses"}
                onPress={() => setActiveTab("Verses")}
              />
              <TabButton
                title={`Artículos (${articles.length})`}
                isActive={activeTab === "Articles"}
                onPress={() => setActiveTab("Articles")}
              />
            </View>
          )}

          {/* Content based on active tab */}
          {hasResults && !loading && (
            <View style={styles.resultsContainer}>
              {activeTab === "Verses" &&
                verses.map((verse, index) => (
                  <TouchableOpacity onPress={() => onVersePress(verse.reference)} key={index} style={styles.verseCard}>
                    <Text style={styles.verseReference}>{verse.reference}</Text>
                    <Text style={styles.verseText}>{verse.text}</Text>
                    {verse.relevance && (
                      <Text style={styles.verseRelevance}>{verse.relevance}</Text>
                    )}
                  </TouchableOpacity>
                ))}

              {activeTab === "Articles" &&
                articles.map((article, index) => (
                  <View key={index} style={styles.articleCard}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleSummary}>{article.summary}</Text>
                    {article.keyPoints && article.keyPoints.length > 0 && (
                      <View style={styles.keyPointsContainer}>
                        <Text style={styles.keyPointsTitle}>Key Points:</Text>
                        {article.keyPoints.map((point, pointIndex) => (
                          <Text key={pointIndex} style={styles.keyPoint}>
                            • {point}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenWithAnimation>
  );
};

const getStyles = ({ colors }: TTheme) => StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f9fa",
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.text + 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.text + 50,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  clearButton: {
    padding: 8,
  },
  searchButton: {
    backgroundColor: colors.notification,
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
    minWidth: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonDisabled: {
    backgroundColor: colors.text + 50,
  },
  translationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  translationLabel: {
    fontSize: 14,
    color: colors.text,
  },
  translationSelector: {
    flexDirection: "row",
    alignItems: "center",
  },
  translationText: {
    fontSize: 14,
    color: colors.notification,
    fontWeight: "500",
    marginRight: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  predictedAnswerCard: {
    backgroundColor: colors.text + 30,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.notification,
    marginBottom: 20,
  },
  predictedAnswerTitle: {
    fontSize: 14,
    color: colors.notification,
    fontWeight: "600",
    marginBottom: 8,
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.notification,
    marginBottom: 8,
  },
  answerDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  answerReference: {
    fontSize: 12,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.text + 30,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  activeTab: {
    backgroundColor: colors.text + 30,
  },
  tabText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: "500",
    opacity: 1,
  },
  resultsContainer: {
    paddingBottom: 20,
  },
  verseCard: {
    backgroundColor: colors.text + 30,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.notification,
  },
  verseReference: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.notification,
    marginBottom: 8,
  },
  verseText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  verseRelevance: {
    fontSize: 12,
    color: colors.text,
    fontStyle: "italic",
    marginTop: 8,
  },
  // Loading styles
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  // Error styles
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.notification,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
  },
  // Empty state styles
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
  // Article styles
  articleCard: {
    backgroundColor: colors.text + 30,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.notification,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.notification,
    marginBottom: 8,
  },
  articleSummary: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  keyPointsContainer: {
    marginTop: 8,
  },
  keyPointsTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  keyPoint: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 2,
  },
  // Coming soon styles
  comingSoonContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  comingSoonText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 16,
  },
});

export default BibleAIScreen;
