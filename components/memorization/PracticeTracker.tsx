import { useMyTheme } from "@/context/ThemeContext";
import { Memorization, TTheme } from "@/types";
import { formatDateShortDayMonth } from "@/utils/formatDateShortDayMonth";
import { icons } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Icon from "../Icon";
import { Text, View } from "../Themed";
import ProgressBar from "../home/footer/ProgressBar";

interface PracticeTrackerProps {
  item: Memorization;
  currentTimeStat: any;
}

const PracticeTracker: React.FC<PracticeTrackerProps> = ({
  item,
  currentTimeStat,
}) => {
  const [status, setStatus] = useState("");
  const { theme } = useMyTheme();
  const [iconName, setIconName] = useState<keyof typeof icons>("CircleCheck");
  const [iconColor, setIconColor] = useState(theme.colors.notification);
  const styles = getStyles(theme);

  useEffect(() => {
    if (item.progress >= 100) {
      setStatus("Completado");
      setIconName("CircleCheck");
      setIconColor("#1ce265");
    } else if (currentTimeStat.remainingTime < 0) {
      setStatus("Atrasado");
      setIconName("CircleAlert");
      setIconColor("#e63946");
    } else if (currentTimeStat.isActive) {
      setStatus("En Progreso");
      setIconName("Clock");
      setIconColor(theme.colors.notification);
    } else {
      setStatus("Necesita Práctica");
      setIconName("AlarmClockCheck");
      setIconColor("#ffcc00");
    }
  }, [item.progress, currentTimeStat]);

  return (
    <View style={styles.practiceContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.practiceTitle}>{status}</Text>
        <Icon name={iconName} size={24} color={iconColor} />
      </View>
      {currentTimeStat.remainingDate && (
        <Text style={styles.practiceTime}>
          {currentTimeStat.remainingDate} restantes
        </Text>
      )}

      <View style={styles.progressContainer}>
        <ProgressBar
          height={8}
          color={iconColor}
          barColor={theme.colors.text}
          progress={(currentTimeStat.progress || 0) / 100}
          hideCircle
          circleColor={theme.colors.notification}
        />
      </View>

      <View style={styles.dateContainer}>
        <View style={{ backgroundColor: "transparent" }}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            Añadido
          </Text>
          <Text style={styles.dateSubText}>
            {formatDateShortDayMonth(item?.addedDate || "")}
          </Text>
        </View>
        <View style={{ backgroundColor: "transparent" }}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            Última práctica
          </Text>
          <Text style={styles.dateSubText}>
            {formatDateShortDayMonth(item?.lastPracticed || "")}
          </Text>
        </View>
      </View>
    </View>
  );
};

const getStyles = ({ colors, dark }: TTheme) =>
  StyleSheet.create({
    practiceContainer: {
      backgroundColor: colors.text + 20,
      padding: 16,
      borderRadius: 12,
      marginTop: 20,
      borderColor: dark ? colors.text : colors.notification,
      borderWidth: 2,
    },
    practiceTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "bold",
    },
    practiceTime: {
      color: colors.text,
      fontSize: 16,
    },
    progressBar: {
      height: 6,
      borderRadius: 5,
      marginVertical: 8,
    },
    dateContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 10,
      backgroundColor: "transparent",
    },
    dateText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "bold",
    },
    dateSubText: {
      color: colors.text,
      fontSize: 14,
    },
    headerContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    progressContainer: {
      marginVertical: 10,
    },
  });

export default PracticeTracker;
