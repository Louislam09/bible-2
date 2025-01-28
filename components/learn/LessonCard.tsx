import { Lesson } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from '../Icon';
import { useRouter } from 'expo-router';

interface LessonCardProps {
    lesson: Lesson;
    unitIndex: number;
}

const LessonCard: React.FC<LessonCardProps> = ({ lesson, unitIndex }) => {
    const router = useRouter()
    const isStartButton = true

    const handleLessonPress = (lessonIndex: number) => {
        console.log({ unitIndex, lessonIndex })
        router.push(`learn/${unitIndex}/lesson/${lessonIndex}`)
    }


    return (
        <LinearGradient colors={["#1ed9e7", "#1e94e9", "#006aff"]}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <View style={styles.headerTitle}>
                        <Icon name="LibraryBig" size={24} color="#ffffff" />
                        {/* <Text style={styles.activity}>{lesson.title}</Text> */}
                    </View>
                    <Text style={styles.duration}>3 MIN</Text>
                </View>

                <Text style={styles.title}>{lesson.title}</Text>
                <Text style={styles.description}>{lesson.activity}</Text>

                <View style={styles.buttonContainer}>
                    {isStartButton ? (
                        <TouchableOpacity onPress={() => handleLessonPress(lesson.id)} style={[styles.button, styles.reviewButton]}>
                            <Text style={[styles.buttonText, styles.reviewButtonText]}>
                                Iniciar
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.button, styles.reviewButton]}>
                                <Text style={[styles.buttonText, styles.reviewButtonText]}>
                                    Review skills
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, styles.restartButton]}>
                                <Text style={[styles.buttonText, styles.restartButtonText]}>
                                    Restart lesson
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                </View>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        paddingHorizontal: 4,
        width: "100%",
        // borderWidth: 1, borderColor: 'red',
    },
    headerTitle: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        flex: 1,
    },
    activity: {
        color: "#ffffff",
        fontWeight: "bold",
        fontSize: 14,
        flexShrink: 1,
        alignItems: "flex-start",
    },
    duration: {
        color: "#ffffff",
        fontSize: 14,
    },
    title: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 4,
    },
    description: {
        color: "#ffffff",
        fontSize: 14,
        marginBottom: 16,
    },
    buttonContainer: {
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 10
    },
    button: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 4,
        alignItems: "center",
    },
    reviewButton: {
        backgroundColor: "#ffffff",
    },
    restartButton: {
        backgroundColor: "transparent",
        borderColor: "#ffffff",
        borderWidth: 2,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    reviewButtonText: {
        color: "#007FFF",
    },
    restartButtonText: {
        color: "#ffffff",
    },
});

export default LessonCard;
