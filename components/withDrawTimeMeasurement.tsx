import React, { useEffect, useRef, ComponentType, useState } from "react";
import {
  View,
  LayoutChangeEvent,
  ViewStyle,
  findNodeHandle,
  UIManager,
  StyleSheet,
} from "react-native";
import { Text } from "./Themed";

interface DrawTimeMeasurementOptions {
  componentName?: string;
  onDrawComplete?: (drawTime: number) => void;
}

interface RenderStats {
  drawTime: number;
  dimensions: {
    width: number;
    height: number;
  } | null;
  fps: number;
}

type WithDrawTimeMeasurement = <P extends object>(
  WrappedComponent: ComponentType<P>,
  options?: DrawTimeMeasurementOptions
) => ComponentType<P>;

const withDrawTimeMeasurement: WithDrawTimeMeasurement = (
  WrappedComponent,
  {
    componentName = "Component",
    onDrawComplete,
  }: DrawTimeMeasurementOptions = {}
) => {
  return function MeasuredComponent(props: any) {
    const startTimeRef = useRef<number | null>(null);
    const componentRef = useRef<View>(null);
    const hasDrawnRef = useRef(false);
    const [renderStats, setRenderStats] = useState<RenderStats>({
      drawTime: 0,
      dimensions: null,
      fps: 0,
    });

    useEffect(() => {
      startTimeRef.current = performance.now();
      return () => {
        hasDrawnRef.current = false;
      };
    }, []);

    const measureComponent = () => {
      if (componentRef.current && !hasDrawnRef.current) {
        const nodeHandle = findNodeHandle(componentRef.current);
        if (nodeHandle) {
          UIManager.measure(nodeHandle, (x, y, width, height, pageX, pageY) => {
            if (
              width > 0 &&
              height > 0 &&
              !hasDrawnRef.current &&
              startTimeRef.current
            ) {
              hasDrawnRef.current = true;
              const endTime = performance.now();
              const drawTime = endTime - startTimeRef.current;
              const timeInSeconds = drawTime / 1000;
              const fps = Math.round(1000 / drawTime);

              setRenderStats({
                drawTime: timeInSeconds,
                dimensions: { width, height },
                fps: fps,
              });

              //   console.log(
              //     `[${componentName}] Performance Metrics:
              //     • Draw Time: ${timeInSeconds.toFixed(3)} sec
              //     • FPS: ${fps}
              //     • Dimensions: ${width}x${height}
              //     • Component: ${componentName}`
              //   );

              if (onDrawComplete) {
                onDrawComplete(drawTime);
              }
            }
          });
        }
      }
    };

    const handleLayout = (event: LayoutChangeEvent) => {
      requestAnimationFrame(() => {
        measureComponent();
      });
    };

    const containerStyle: ViewStyle = {
      flex: 1,
    };

    return (
      <View ref={componentRef} onLayout={handleLayout} style={containerStyle}>
        <WrappedComponent {...props} />
        {renderStats.drawTime > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>
              {componentName} Performance Metrics:
            </Text>
            <Text style={styles.statsText}>
              Draw Time: {renderStats.drawTime.toFixed(3)} sec
            </Text>
            <Text style={styles.statsText}>FPS: {renderStats.fps}</Text>
            {renderStats.dimensions && (
              <Text style={styles.statsText}>
                Size: {renderStats.dimensions.width}x
                {renderStats.dimensions.height}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };
};

const styles = StyleSheet.create({
  statsContainer: {
    position: "absolute",
    bottom: 100,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.75)",
    padding: 10,
    borderRadius: 8,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.3)",
    paddingBottom: 3,
  },
  statsText: {
    color: "#fff",
    fontSize: 12,
    marginVertical: 2,
    fontFamily: "monospace",
  },
});

export default withDrawTimeMeasurement;
