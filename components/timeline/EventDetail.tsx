import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
  FontAwesome,
} from "@expo/vector-icons";
import { BibleTimelineEvent, TTheme } from "@/types";
import { useTheme } from "@react-navigation/native";

interface RelatedPerson {
  slug: string;
  title: string;
}

interface ProfileImage {
  caption: string;
  file: string;
}

interface Profile {
  id: string;
  slug: string;
  title: string;
  period: string;
  description: string;
  article: string;
  date: string;
  scriptures: string[];
  related: RelatedPerson[];
  images: ProfileImage[];
}

const { width } = Dimensions.get("window");

const profile: Profile = {
  id: "1016",
  slug: "adam",
  title: "Adán",
  period: "1",
  description:
    "El nombre significa 'rojo' o 'hombre'. Es el primer hombre, creado por Dios, cuya esposa fue Eva. Adán recibió autoridad sobre la tierra. El pecado entró al mundo cuando Adán y Eva comieron del fruto prohibido en el Jardín del Edén, su hogar que perdieron pero que será restaurado.",
  article:
    "El primer miembro de la familia humana, creado por Dios del polvo de la tierra (Génesis 2:7). Su esposa, Eva, fue formada de una costilla de su costado (vs 21, 22). Adán recibió autoridad sobre la tierra y todas las criaturas vivientes (capítulo 1:26) y se le ordenó poblar el mundo (v 28). Él y su esposa fueron colocados en un 'jardín al oriente en Edén' y se les dio la tarea de cuidarlo (capítulo 2:8, 15). El producto de las plantas y los árboles sería su alimento (capítulo 1:29).",
  date: "3954-3024 a.C.",
  scriptures: ["1|2:7", "1|5:5"],
  related: [
    {
      slug: "cain",
      title: "Caín",
    },
    {
      slug: "abel",
      title: "Abel",
    },
    {
      slug: "seth",
      title: "Set",
    },
  ],
  images: [
    {
      caption:
        "Y el Señor Dios plantó un jardín al oriente en Edén; y allí puso al hombre que había formado. (Génesis 2:8)",
      file: "GoodSalt-prcas2581_8-8-2013 9-50-05 AM.jpg",
    },
    {
      caption:
        "Creación de Adán por Miguel Ángel entre 1508 y 1512. Ubicado en la Capilla Sixtina.",
      file: "Adam_4-4-2013 10-22-05 AM.jpg",
    },
  ],
};

const placeholderImages = [
  "https://via.placeholder.com/400x300/87CEEB/000000?text=Garden+of+Eden",
  "https://via.placeholder.com/400x300/FFB6C1/000000?text=Creation+of+Adam",
];

const formatScripture = (scripture: string): string => {
  const [book, reference] = scripture.split("|");
  const bookMap: Record<string, string> = {
    "1": "Génesis",
  };
  return `${bookMap[book]} ${reference}`;
};

interface BiblicalEventDetailProps {
  bibleTimelineEvent: BibleTimelineEvent;
}

const BiblicalEventDetail: React.FC<BiblicalEventDetailProps> = ({
  bibleTimelineEvent,
}) => {
  const [activeTab, setActiveTab] = useState<
    "description" | "article" | "references"
  >("description");
  const [imageIndex, setImageIndex] = useState<number>(0);
  const theme = useTheme();
  const styles = getStyles(theme);
  const noData = bibleTimelineEvent.title ? false : true;
  const images = bibleTimelineEvent.images;

  const nextImage = () => {
    setImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (noData) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={32} color="#AAAAAA" />
            <Text style={styles.noImageText}>No hay datos disponibles</Text>
            <Text style={styles.noImageText}>Disponible pronto</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{bibleTimelineEvent.title}</Text>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons
              name="calendar"
              size={18}
              color={theme.colors.notification}
              style={styles.icon}
            />
            <Text style={styles.dateText}>{bibleTimelineEvent.date}</Text>
          </View>
        </View>

        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <View style={{ height: 250 }}>
              <Image
                source={{
                  //   uri: placeholderImages[imageIndex % placeholderImages.length],
                  uri: `http://timeline.biblehistory.com/media/images/original/${
                    images[imageIndex % images.length].file
                  }`,
                }}
                style={styles.image}
                resizeMode="contain"
              />

              {/* Image Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  {images[imageIndex].caption}
                </Text>
              </View>

              {/* Navigation */}
              {images.length > 1 && (
                <View style={styles.imageNavigation}>
                  <TouchableOpacity
                    onPress={prevImage}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-back" size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={nextImage}
                    style={styles.navButton}
                  >
                    <Ionicons name="chevron-forward" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Image Counter */}
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {imageIndex + 1}/{images.length}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={32} color="#AAAAAA" />
              <Text style={styles.noImageText}>
                No hay imágenes disponibles
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "description" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("description")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "description" && styles.activeTabText,
              ]}
            >
              Resumen
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "article" && styles.activeTab]}
            onPress={() => setActiveTab("article")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "article" && styles.activeTabText,
              ]}
            >
              Artículo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "references" && styles.activeTab]}
            onPress={() => setActiveTab("references")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "references" && styles.activeTabText,
              ]}
            >
              Referencias
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.contentContainer}>
          {activeTab === "description" && (
            <Text style={styles.descriptionText}>
              {bibleTimelineEvent.description}
            </Text>
          )}

          {activeTab === "article" && (
            <Text style={styles.articleText}>{bibleTimelineEvent.article}</Text>
          )}

          {activeTab === "references" && (
            <View style={styles.referencesContainer}>
              {/* Scripture References */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <FontAwesome5
                    name="bible"
                    size={18}
                    color={theme.colors.notification}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>Pasajes Bíblicos</Text>
                </View>

                <View style={styles.scripturesContainer}>
                  {bibleTimelineEvent.scriptures.map((scripture, index) => (
                    <View key={index} style={styles.scriptureItem}>
                      <Text style={styles.scriptureText}>
                        {formatScripture(scripture)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Related Characters */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <FontAwesome
                    name="user"
                    size={18}
                    color={theme.colors.notification}
                    style={styles.sectionIcon}
                  />
                  <Text style={styles.sectionTitle}>
                    Personajes Relacionados
                  </Text>
                </View>

                <View style={styles.relatedContainer}>
                  {bibleTimelineEvent.related.map((person, index) => (
                    <TouchableOpacity key={index} style={styles.relatedItem}>
                      <Text style={styles.relatedText}>{person.title}</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={theme.colors.notification}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = ({ colors }: TTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingHorizontal: 4,
    },
    header: {
      //   backgroundColor: "transparent",
      backgroundColor: colors.notification + 10,
      padding: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: colors.text,
    },
    dateContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
    },
    icon: {
      marginRight: 6,
    },
    dateText: {
      fontSize: 16,
      color: colors.text,
    },
    imageContainer: {
      height: 250,
      //   backgroundColor: colors.text + 50,
      position: "relative",
    },
    image: {
      flex: 1,
    },
    captionContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background + 80,
      padding: 10,
    },
    captionText: {
      color: colors.text,
      fontSize: 14,
    },
    imageNavigation: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    navButton: {
      backgroundColor: colors.background + 90,
      //   backgroundColor: "rgba(0, 0, 0, 0.5)",
      borderRadius: 20,
      padding: 8,
    },
    imageCounter: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: colors.background + 90,
      //   backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    imageCounterText: {
      color: colors.text,
      fontSize: 12,
    },
    noImageContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    noImageText: {
      color: colors.text,
      marginTop: 10,
    },
    tabContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.text,
    },
    tab: {
      flex: 1,
      paddingVertical: 14,
      alignItems: "center",
    },
    activeTab: {
      borderBottomWidth: 2,
      borderBottomColor: colors.notification,
    },
    tabText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text + 99,
    },
    activeTabText: {
      color: colors.notification,
    },
    contentContainer: {
      padding: 16,
    },
    descriptionText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    articleText: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
    },
    referencesContainer: {
      gap: 20,
    },
    sectionContainer: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    sectionIcon: {
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
    },
    scripturesContainer: {
      backgroundColor: colors.notification + 10,
      borderRadius: 8,
      overflow: "hidden",
    },
    scriptureItem: {
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.text + 40,
    },
    scriptureText: {
      fontSize: 16,
      color: colors.text,
    },
    relatedContainer: {
      backgroundColor: colors.notification + 10,
      borderRadius: 8,
      overflow: "hidden",
    },
    relatedItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.text + 40,
    },
    relatedText: {
      fontSize: 16,
      color: colors.text,
    },
  });

export default BiblicalEventDetail;
