import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";

const withPerformanceMeasure = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const [startTime] = useState(performance.now());
    const [renderTime, setRenderTime] = useState<number | null>(null);

    useEffect(() => {
      requestAnimationFrame(() => {
        const endTime = performance.now();
        setRenderTime((endTime - startTime) / 1000);
      });
    }, []);

    return (
      <View style={{ flex: 1 }}>
        <WrappedComponent {...props} />
        {renderTime !== null && (
          <Text
            style={{
              position: "absolute",
              bottom: 100,
              right: 10,
              backgroundColor: "rgba(0,0,0,0.5)",
              color: "white",
              padding: 5,
            }}
          >
            Render Time: {renderTime.toFixed(2)} sec
          </Text>
        )}
      </View>
    );
  };
};

export default withPerformanceMeasure;
