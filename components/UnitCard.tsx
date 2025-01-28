import { Lesson, Unit } from '@/types';
import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CircularProgressBar from './CircularProgressBar';
import LessonCard from './learn/LessonCard';
import Tooltip from './learn/Tooltip';
import LessonButton from './LessonButton';

type UnitCardProps = {
    unit: Unit;
    currentUnit: number
};

const UnitCard: React.FC<UnitCardProps> = ({ unit, currentUnit }) => {
    const { title, description, id: unitIndex, lessons } = unit
    const [currentLessonIndex, setCurrentLessonIndex] = React.useState(-1);
    const [currentLesson, setCurrentLesson] = React.useState<Lesson | null>(null);
    const currentPopRef = useRef(null)

    const onPress = (lesson: Lesson, ref: any, lessonIndex: number) => {
        currentPopRef.current = ref.current
        setCurrentLessonIndex(lessonIndex)
        setCurrentLesson(lesson)
    }


    return (
        <View style={{ flex: 1 }}>

            <View style={styles.unitCard}>
                <View style={styles.unitCardContent}>
                    <Text style={styles.unitTitle}>U{unitIndex}. {title}</Text>
                    <Text style={styles.unitSubtitle}>{description}</Text>
                </View>
                {/* <View style={styles.continueButtonContainer}>
                <TouchableOpacity style={styles.continueButton}>
                    <Text style={styles.continueButtonText}>CONTINUE</Text>
                </TouchableOpacity>
            </View> */}
            </View>
            <View style={styles.lessonsContainer}>
                {lessons.map((lesson: any, lessonIndex: number) => {
                    const lessonRef = useRef(null)
                    return (
                        <View
                            ref={lessonRef}
                            key={lessonIndex}
                            style={[
                                styles.lesson,
                                { transform: [{ translateX: Math.sin(lessonIndex * 1.1) * 50 }] }
                            ]}
                        >
                            <CircularProgressBar
                                size={100}
                                strokeWidth={10}
                                progress={0}
                                maxProgress={100}
                                color="#4caf50"
                                backgroundColor={unitIndex === currentUnit && lessonIndex === currentLessonIndex ? "#c9c6cdb0" : "#fff"}
                            >
                                <LessonButton
                                    action={() => onPress(lesson, lessonRef, lessonIndex)}
                                    type={unit.lessons.length - 1 === lessonIndex ? 'crown' : 'star'}
                                    completed={false}
                                    label={'Empezar'}
                                    isCurrent={unitIndex === currentUnit && lessonIndex === currentLessonIndex}
                                />
                            </CircularProgressBar>

                        </View>
                    )
                })}
            </View>
            <Tooltip
                offset={-20}
                target={currentPopRef}
                isVisible={currentLessonIndex !== -1}
                onClose={() => setCurrentLessonIndex(-1)}
            >
                <LessonCard unitIndex={unitIndex} key={currentLesson?.id} lesson={currentLesson as any} />
            </Tooltip>
        </View>
    );
}

const styles = StyleSheet.create({
    unitCard: {
        backgroundColor: '#10b981',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        marginBottom: 16,
    },
    unitCardContent: {
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    unitTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    unitSubtitle: {
        color: '#fff',
        fontSize: 14,
        opacity: 0.9,
    },
    continueButtonContainer: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -16 }],
    },
    continueButton: {
        backgroundColor: '#34d399',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    continueButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
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

export default UnitCard;
