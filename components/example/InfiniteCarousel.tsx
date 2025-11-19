import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    SharedValue,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useFrameCallback,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';

export type CarouselItemRenderer<T> = (params: {
    item: T;
    index: number;
}) => React.ReactNode;

export type InfiniteCarouselProps<T> = {
    carouselItems: T[];
    renderItem: CarouselItemRenderer<T>;
    onIndexChange?: (index: number) => void;
    autoPlaySpeed?: number;
    itemWidthRatio?: number;
    rotateDeg?: number; // maximum rotation
};

type ItemProps = PropsWithChildren<{
    index: number;
    scroll: SharedValue<number>;
    containerW: number;
    itemW: number;
    rotateDeg: number;
}>;

function CarouselItem({
    index,
    scroll,
    containerW,
    itemW,
    rotateDeg,
    children,
}: ItemProps) {
    const { width: screenW } = useWindowDimensions();
    const halfShift = (containerW - screenW) / 2;
    const basePos = itemW * index - halfShift;

    const style = useAnimatedStyle(() => {
        const pos = ((basePos - scroll.value) % containerW) + halfShift;

        const rotate = interpolate(
            pos,
            [0, screenW - itemW],
            [-rotateDeg, rotateDeg],
        );
        const translateY = interpolate(
            pos,
            [0, (screenW - itemW) / 2, screenW - itemW],
            [4, 0, 4],
        );

        return {
            left: pos,
            transform: [{ rotateZ: `${rotate}deg` }, { translateY }],
        };
    }, []);

    return (
        <Animated.View
            style={[
                styles.item,
                { width: itemW, transformOrigin: 'bottom' },
                style,
            ]}
        >
            {children}
        </Animated.View>
    );
}

/* ---------- Main carousel component ---------- */
export default function InfiniteCarousel<T>({
    carouselItems,
    renderItem,
    onIndexChange,
    autoPlaySpeed = 40,
    itemWidthRatio = 0.65,
    rotateDeg = 1,
}: InfiniteCarouselProps<T>) {
    const scroll = useSharedValue(0);
    const speed = useSharedValue(autoPlaySpeed);
    const { width: screenW } = useWindowDimensions();

    const [active, setActive] = useState(0);
    const itemW = screenW * itemWidthRatio;
    const containerW = carouselItems.length * itemW;

    /* Forward active index to parent */
    useEffect(() => onIndexChange?.(active), [active]);

    /* Calculate active index whenever scroll changes */
    useAnimatedReaction(
        () => scroll.value,
        (val) => {
            const normalized = (val + screenW / 2) % containerW;
            const next = Math.floor(normalized / itemW);
            runOnJS(setActive)(next);
        },
    );

    /* Autoplay */
    useFrameCallback((frame) => {
        const dt = (frame.timeSincePreviousFrame ?? 0) / 1000;
        scroll.value += speed.value * dt;
    });

    /* Pan gesture for manual control */
    const gesture = useRef(
        Gesture.Pan()
            .onBegin(() => {
                speed.value = 0;
            })
            .onChange((e) => {
                scroll.value -= e.changeX;
            })
            .onFinalize((e) => {
                speed.value = -e.velocityX;
                speed.value =
                    withTiming(autoPlaySpeed, {
                        duration: 800,
                    });
            }),
    ).current;

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.container}>
                {carouselItems.map((item, index) => (
                    <CarouselItem
                        key={`carousel-${index}`}
                        index={index}
                        scroll={scroll}
                        containerW={containerW}
                        itemW={itemW}
                        rotateDeg={rotateDeg}
                    >
                        {renderItem({ item, index })}
                    </CarouselItem>
                ))}
            </View>
        </GestureDetector>
    );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: '100%',
    },
    item: {
        position: 'absolute',
        height: '100%',
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
});