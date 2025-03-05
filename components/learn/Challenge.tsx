import React, { FC, useState } from 'react'
import { StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import { Challenge as TChallenge, TrueFalseChallenge, MultipleChoiceChallenge, FillInTheBlankChallenge, MemoryTaskChallenge, DragAndDropChallenge } from '@/types'
import { Text, View } from '../Themed'

type ChallengeProps = {
    challenge: TChallenge
    onAnswer?: (isCorrect: boolean) => void
}

const Challenge: FC<ChallengeProps> = ({ challenge, onAnswer }) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null)
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)

    const checkAnswer = (answer: string | boolean) => {
        let correct = false
        switch (challenge.type) {
            case 'multiple_choice':
                correct = answer === (challenge as MultipleChoiceChallenge).answer
                break
            case 'true_false':
                correct = answer === (challenge as TrueFalseChallenge).answer
                break
            case 'fill_in_the_blank':
                correct = answer === (challenge as FillInTheBlankChallenge).answer
                break
            // Add more type checks as needed
        }

        setSelectedAnswer(answer)
        setIsCorrect(correct)
        onAnswer?.(correct)
    }

    const renderMultipleChoice = () => {
        const multipleChoiceChallenge = challenge as MultipleChoiceChallenge
        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{challenge.question}</Text>
                {multipleChoiceChallenge.options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.optionButton,
                            selectedAnswer === option && styles.selectedButton,
                            isCorrect === false && selectedAnswer === option && styles.incorrectButton,
                            isCorrect === true && selectedAnswer === option && styles.correctButton
                        ]}
                        onPress={() => checkAnswer(option)}
                    >
                        <Text style={styles.optionText}>{option}</Text>
                    </TouchableOpacity>
                ))}
                {isCorrect !== null && (
                    <Text style={[
                        styles.feedbackText,
                        isCorrect ? styles.correctFeedback : styles.incorrectFeedback
                    ]}>
                        {isCorrect ? '¡Correcto!' : 'Intenta de nuevo'}
                    </Text>
                )}
            </View>
        )
    }

    const renderTrueFalse = () => {
        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{challenge.question}</Text>
                <View style={styles.trueFalseContainer}>
                    <TouchableOpacity
                        style={[
                            styles.trueFalseButton,
                            selectedAnswer === true && styles.selectedButton,
                            isCorrect === false && selectedAnswer === true && styles.incorrectButton,
                            isCorrect === true && selectedAnswer === true && styles.correctButton
                        ]}
                        onPress={() => checkAnswer(true)}
                    >
                        <Text style={styles.optionText}>Verdadero</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.trueFalseButton,
                            selectedAnswer === false && styles.selectedButton,
                            isCorrect === false && selectedAnswer === false && styles.incorrectButton,
                            isCorrect === true && selectedAnswer === false && styles.correctButton
                        ]}
                        onPress={() => checkAnswer(false)}
                    >
                        <Text style={styles.optionText}>Falso</Text>
                    </TouchableOpacity>
                </View>
                {isCorrect !== null && (
                    <Text style={[
                        styles.feedbackText,
                        isCorrect ? styles.correctFeedback : styles.incorrectFeedback
                    ]}>
                        {isCorrect ? '¡Correcto!' : 'Intenta de nuevo'}
                    </Text>
                )}
            </View>
        )
    }

    const renderFillInTheBlank = () => {
        const fillBlankChallenge = challenge as FillInTheBlankChallenge
        const [userAnswer, setUserAnswer] = useState('')

        const handleSubmit = () => {
            checkAnswer(userAnswer.trim())
        }

        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{challenge.question}</Text>
                <Text style={styles.blankSentenceText}>
                    {fillBlankChallenge.fullSentence.split('___').map((part, index) => (
                        <React.Fragment key={index}>
                            {part}
                            {index < fillBlankChallenge.fullSentence.split('___').length - 1 && (
                                <TextInput
                                    style={styles.blankInput}
                                    value={userAnswer}
                                    onChangeText={setUserAnswer}
                                    placeholder="Escribe aquí"
                                />
                            )}
                        </React.Fragment>
                    ))}
                </Text>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Enviar</Text>
                </TouchableOpacity>
                {isCorrect !== null && (
                    <Text style={[
                        styles.feedbackText,
                        isCorrect ? styles.correctFeedback : styles.incorrectFeedback
                    ]}>
                        {isCorrect ? '¡Correcto!' : 'Intenta de nuevo'}
                    </Text>
                )}
            </View>
        )
    }

    const renderMemoryTask = () => {
        const memoryChallenge = challenge as MemoryTaskChallenge
        const [memorizing, setMemorizing] = useState(true)
        const [userAnswer, setUserAnswer] = useState('')

        React.useEffect(() => {
            const timer = setTimeout(() => {
                setMemorizing(false)
            }, memoryChallenge.timeToMemorize * 1000)

            return () => clearTimeout(timer)
        }, [])

        const handleSubmit = () => {
            checkAnswer(userAnswer.trim())
        }

        if (memorizing) {
            return (
                <View style={styles.container}>
                    <Text style={styles.questionText}>Memoriza estos elementos:</Text>
                    {memoryChallenge.itemsToMemorize.map((item, index) => (
                        <Text key={index} style={styles.memoryItem}>{item}</Text>
                    ))}
                    <Text style={styles.timerText}>
                        Tiempo restante: {memoryChallenge.timeToMemorize} segundos
                    </Text>
                </View>
            )
        }

        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{memoryChallenge.questionAfterMemorization}</Text>
                <TextInput
                    style={styles.blankInput}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    placeholder="Escribe tu respuesta"
                />
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Enviar</Text>
                </TouchableOpacity>
                {isCorrect !== null && (
                    <Text style={[
                        styles.feedbackText,
                        isCorrect ? styles.correctFeedback : styles.incorrectFeedback
                    ]}>
                        {isCorrect ? '¡Correcto!' : 'Intenta de nuevo'}
                    </Text>
                )}
            </View>
        )
    }

    const renderDragAndDrop = () => {
        const dragDropChallenge = challenge as DragAndDropChallenge
        // Placeholder for drag and drop implementation
        return (
            <View style={styles.container}>
                <Text style={styles.questionText}>{challenge.question}</Text>
                <Text>Implementación de arrastrar y soltar pendiente</Text>
            </View>
        )
    }

    const renderChallenge = () => {
        console.log(challenge.type)
        switch (challenge.type || 'multiple_choice') {
            case 'multiple_choice':
                return renderMultipleChoice()
            case 'true_false':
                return renderTrueFalse()
            case 'fill_in_the_blank':
                return renderFillInTheBlank()
            case 'memory_task':
                return renderMemoryTask()
            case 'drag_and_drop':
                return renderDragAndDrop()
            default:
                return null
        }
    }

    return (
        <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContentContainer}
        >
            {renderChallenge()}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        flexGrow: 1,
        padding: 16,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#000',
    },
    optionButton: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    trueFalseContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },
    trueFalseButton: {
        flex: 1,
        marginHorizontal: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#000',
    },
    selectedButton: {
        borderColor: '#000',
    },
    correctButton: {
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'green',
    },
    incorrectButton: {
        backgroundColor: 'rgba(244, 67, 54, 0.2)',
        borderColor: '#000',
    },
    optionText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#000',
    },
    feedbackText: {
        marginTop: 16,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    correctFeedback: {
        color: 'green',
    },
    incorrectFeedback: {
        color: '#000',
    },
    blankSentenceText: {
        fontSize: 16,
        marginBottom: 16,
    },
    blankInput: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingVertical: 8,
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#000',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    memoryItem: {
        fontSize: 18,
        textAlign: 'center',
        marginVertical: 8,
        fontWeight: 'bold',
    },
    timerText: {
        textAlign: 'center',
        marginTop: 16,
        fontSize: 16,
        color: '#ddd',
    },
});

export default Challenge