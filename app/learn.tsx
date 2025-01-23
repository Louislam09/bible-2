import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import StatusBarBackground from '../components/StatusBarBackground';
import UnitCard from '../components/UnitCard';
import LessonButton from '../components/LessonButton';
import CircularProgressBar from '@/components/CircularProgressBar';
import gameUnits from '@/constants/gameUnits';

const LanguageLearningUI: React.FC = () => {
    const currentUnitProgress = 30


    return (
        <StatusBarBackground>
            <ScrollView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                {gameUnits.map((unit, index) => (
                    <View key={index} style={styles.unit}>
                        <UnitCard title={unit.title} subtitle={unit.subtitle} />

                        <View style={styles.lessonsContainer}>
                            {unit.lessons.map((lesson, lessonIndex) => (
                                <View
                                    key={lessonIndex}
                                    style={[
                                        styles.lesson,
                                        { transform: [{ translateX: Math.sin(lessonIndex * 1.1) * 50 }] }
                                    ]}
                                >
                                    <CircularProgressBar
                                        size={100}
                                        strokeWidth={10}
                                        progress={lesson.completed ? 100 : 0}
                                        maxProgress={100}
                                        color="#4caf50"
                                        backgroundColor="#c9c6cdb0"
                                    >
                                        <LessonButton
                                            type={lesson.type as any}
                                            completed={lesson.completed}
                                            label={'Start'}
                                            isCurrent={lessonIndex === 1}
                                        />
                                        {/* <View style={{ borderRadius: 50, width: 40, height: 40, backgroundColor: 'red' }} /> */}
                                    </CircularProgressBar>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </StatusBarBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        padding: 16,
    },
    unit: {
        width: '100%',
        maxWidth: 400,
    },
    lessonsContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        marginVertical: 16,
        // borderWidth: 1, borderColor: 'red'
    },
    lesson: {
        marginBottom: 16,
    },
});

export default LanguageLearningUI;