import lottieAssets from '@/constants/lottieAssets';
import { GameProgress } from '@/types';
import React, { useEffect, useMemo } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animation from '../Animation';
import { useRouter } from 'expo-router';
import { usePlaySound } from '@/hooks/usePlaySound';
import { SOUNDS } from '@/constants/gameSound';
import CofettiAnimation from '../CofettiAnimation';

interface IGameOverScreen {
  progress: GameProgress | null;
  handleNextLevel: () => void;
  handleTryAgain: () => void;
}

const GameOverScreen = ({
  progress,
  handleNextLevel,
  handleTryAgain,
}: IGameOverScreen) => {
  const router = useRouter();
  const levelCompletedAnimation = lottieAssets.star;
  const levelFailedAnimation = lottieAssets.violin;
  const { play: playLevelCompleted } = usePlaySound(SOUNDS.levelCompleted);
  const { play: playLevelFailed } = usePlaySound(SOUNDS.levelFailed);

  const hasPassed = progress && progress?.score >= progress?.total / 2;

  useEffect(() => {
    if (hasPassed) {
      playLevelCompleted();
    } else {
      playLevelFailed();
    }
  }, [hasPassed]);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={[
          styles.gameOverContainer,
          { backgroundColor: hasPassed ? '#E6FFFA' : '#FFE6E6' },
          { zIndex: 2 },
        ]}
      >
        {hasPassed && <CofettiAnimation top={-40} />}
        <Animation
          backgroundColor='transparent'
          source={hasPassed ? levelCompletedAnimation : levelFailedAnimation}
          loop
          size={{ width: 220, height: 220 }}
          style={{ background: 'transparent' }}
        />
        <Text
          style={[
            styles.title,
            { color: hasPassed ? '#2F855A' : '#C53030' }, // Adjust title color
          ]}
        >
          {hasPassed ? '¡Juego Completado!' : '¡Intento Fallido!'}
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: hasPassed ? '#38A169' : '#E53E3E' }, // Adjust subtitle color
          ]}
        >
          {hasPassed
            ? '¡Felicidades por completar el nivel!'
            : '¡Mejor suerte la próxima vez!'}
        </Text>
        <Text
          style={[
            styles.scoreText,
            { color: hasPassed ? '#276749' : '#742A2A' }, // Adjust score text color
          ]}
        >
          Puntuación final: {progress?.score} de {progress?.total}
        </Text>
        <View style={[styles.buttonContainer]}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: hasPassed ? '#48BB78' : '#F56565' }, // Adjust button color
            ]}
            onPress={hasPassed ? handleNextLevel : handleTryAgain}
          >
            <Text style={styles.buttonText}>
              {hasPassed ? 'Siguiente Nivel' : 'Reintentar'}
            </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  scoreText: {
    fontSize: 18,
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
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#718096', // Neutral close button color
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GameOverScreen;
