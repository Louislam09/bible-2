import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { ZoomIn } from "react-native-reanimated";
import PinchZoomView from "./Zoom";
import BrowserZoomView from "./Zoom";

const { width, height } = Dimensions.get("window");
const ITEM_HEIGHT = 60;
const ROWS = 24;

const COLORS = [
  "#3498db",
  "#e74c3c",
  "#2ecc71",
  "#f39c12",
  "#9b59b6",
  "#1abc9c",
  "#d35400",
  "#c0392b",
  "#16a085",
  "#8e44ad",
  "#27ae60",
  "#e67e22",
  "#2980b9",
  "#f1c40f",
  "#7f8c8d",
];

const EventTimeline = ({ data }) => {
  const [currentYear, setCurrentYear] = useState(-3805);
  const [yearWidth, setYearWidth] = useState(5);
  const scrollViewRef = useRef<ScrollView>(null);
  const verticalScrollRef = useRef<ScrollView>(null);

  // Calculate timeline dimensions
  const minYear = Math.min(...data.map((item) => item.start));
  const maxYear = Math.max(...data.map((item) => item.end));
  const timelineWidth = Math.abs(maxYear - minYear) * yearWidth;

  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const newYear = Math.round(minYear + (scrollX + width / 2) / yearWidth);
    setCurrentYear(newYear);
  };

  const getItemStyle = (item) => ({
    position: "absolute",
    left: (item.start - minYear) * yearWidth,
    width: Math.max(100, (item.end - item.start) * yearWidth),
    top: (item.row - 1) * ITEM_HEIGHT,
    height: ITEM_HEIGHT - 10,
    backgroundColor:
      COLORS[Math.abs((item.titleEn || "").length % COLORS.length)],
  });

  const renderItems = () =>
    data.map((item, index) => (
      <View
        key={item.titleEn + "as" + index}
        style={[styles.item, getItemStyle(item)]}
      >
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.image} />
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.titleEn || item.title}</Text>
          <Text style={styles.dates}>
            {Math.abs(item.start)}-{Math.abs(item.end)} BC
            {item.end - item.start > 0 &&
              ` (${Math.abs(item.end - item.start)})`}
          </Text>
        </View>
      </View>
    ));

  const renderYearMarkers = () => {
    const markers = [];
    for (let year = minYear; year <= maxYear; year += 100) {
      markers.push(
        <View
          key={year}
          style={[
            styles.yearMarker,
            {
              left: (year - minYear) * yearWidth,
            },
          ]}
        >
          <Text style={styles.yearText}>{Math.abs(year)}</Text>
        </View>
      );
    }
    return markers;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <PinchZoomView minZoom={0.1} maxZoom={5}> */}
      <BrowserZoomView>
        <ScrollView ref={verticalScrollRef} style={styles.verticalScroll}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <View
              style={[
                styles.timelineContainer,
                {
                  width: timelineWidth,
                  height: ROWS * ITEM_HEIGHT,
                },
              ]}
            >
              {renderYearMarkers()}
              {renderItems()}
            </View>
          </ScrollView>
        </ScrollView>
      </BrowserZoomView>
      {/* </PinchZoomView> */}

      {/* Current Year Indicator */}
      <View style={styles.currentYearContainer}>
        <Text style={styles.currentYearText}>{Math.abs(currentYear)} BC</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a1c2b",
  },
  verticalScroll: {
    flex: 1,
  },
  timelineContainer: {
    height: ROWS * ITEM_HEIGHT,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 2,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dates: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  yearMarker: {
    position: "absolute",
    top: 0,
    height: ROWS * ITEM_HEIGHT,
    width: 1,
    backgroundColor: "#2a4359",
  },
  yearText: {
    color: "#7f8c8d",
    fontSize: 10,
    position: "absolute",
    top: 5,
    left: 5,
  },
  currentYearContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 5,
    transform: [{ translateX: -50 }, { translateY: -25 }],
  },
  currentYearText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EventTimeline;
