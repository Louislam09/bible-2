import Challenge from '@/components/learn/Challenge'
import { View } from '@/components/Themed'
import gameUnits from '@/constants/gameUnits'
import useParams from '@/hooks/useParams'
import { Lesson as ILesson, Unit } from '@/types'
import React, { useMemo } from 'react'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'

const Lesson = () => {
    const { unitId, lessonId } = useParams()
    const challanges = useMemo(() => {
        const unit = gameUnits.find(x => x.id === unitId) as Unit
        return (unit.lessons.find(x => x.id === lessonId) as ILesson).challenges
    }, [unitId, lessonId])

    const [currentIndex, setCurrentIndex] = React.useState<number>(0);
    const isLastChallenge = challanges.length - 1 === currentIndex

    const handleNext = () => {
        setCurrentIndex(currentIndex + 1)
    }


    return (
        <View style={styles.container}>
            <Challenge
                key={challanges[currentIndex].id}
                challenge={challanges[currentIndex]}
            />
            <TouchableOpacity
                style={styles.nextButton}
                onPress={() => handleNext()}
            >
                <Text style={styles.text}>Siguiente</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Lesson

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    nextButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 16,
    },
})
