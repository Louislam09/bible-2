import Icon from "@/components/Icon";
import { Text, View } from "@/components/Themed";
import { Animated, Dimensions, StyleSheet, TouchableOpacity } from "react-native";

const SCREEN_WIDTH = Dimensions.get('window').width;

const ColorPicker = ({ onSelectColor, mainColor, onClose }: any) => {
    const colors = [
        mainColor,
        "#000000",
        "#FFFFFF",
        "#FF0000",
        "#FF7F00",
        "#FFFF00",
        "#00FF00",
        "#00FFFF",
        "#0000FF",
        "#7F00FF",
        "#FF1493",
        "#FF69B4",
        "#8B4513",
        "#A52A2A",
        "#808080",
    ];

    return (
        <Animated.View
            style={styles.colorPickerContainer}
        >
            <View style={styles.colorPickerHeader}>
                <Text style={styles.colorPickerTitle}>Seleccionar color</Text>
                <TouchableOpacity onPress={onClose}>
                    <Icon name="X" size={22} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.colorGrid}>
                {colors.map((color) => (
                    <TouchableOpacity
                        key={color}
                        onPress={() => onSelectColor(color)}
                        style={[
                            styles.colorButton,
                            { backgroundColor: color },
                            color === mainColor && styles.selectedColor
                        ]}
                    />
                ))}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    colorPickerContainer: {
        position: 'absolute',
        bottom: 70,
        left: 16,
        right: 16,
        backgroundColor: '#333',
        borderRadius: 16,
        padding: 16,
        zIndex: 9999999,
    },
    colorPickerTitle: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    colorPickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: 'transparent',
    },

    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    colorButton: {
        width: SCREEN_WIDTH / 8 - 16,
        height: SCREEN_WIDTH / 8 - 16,
        margin: 4,
        borderRadius: SCREEN_WIDTH / 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: '#fff',
    },
});

export default ColorPicker;