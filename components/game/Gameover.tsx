import lottieAssets from '@/constants/lottieAssets';
import { GameProgress } from '@/types';
import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import Animation from '../Animation';
import { useRouter } from 'expo-router';

interface IGameOverScreen {
    progress: GameProgress | null;
    handleRestart: () => void;
}
const getRandomNumberFromLength = (length: number) => Math.floor(Math.random() * length)

const GameOverScreen = ({ progress, handleRestart }: IGameOverScreen) => {
    const router = useRouter()
    const assets = [...Object.values(lottieAssets)]
    const pickARandomAsset = assets[getRandomNumberFromLength(assets.length)]

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.gameOverContainer}>
                <Animation
                    backgroundColor={'transparent'}
                    source={pickARandomAsset}
                    loop
                    size={{ width: 220, height: 220 }}
                    style={{ backgrund: 'transparent' }}
                />
                {/* <Image
                    source={require('./assets/trophy.png')}
                    style={styles.trophyImage}
                    resizeMode="contain"
                /> */}
                <Text style={styles.title}>¡Juego Completado!</Text>
                <Text style={styles.subtitle}>¡Felicidades por completar el nivel!</Text>
                <Text style={styles.scoreText}>
                    Puntuación final: {progress?.score} de {progress?.total}
                </Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={handleRestart}>
                        <Text style={styles.buttonText}>Siguiente Nivel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.closeButton]}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E1E2C',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    gameOverContainer: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    trophyImage: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginBottom: 16,
    },
    scoreText: {
        fontSize: 18,
        color: '#444444',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 8,
        marginHorizontal: 8,
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#F44336',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default GameOverScreen;
