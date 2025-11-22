import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TutorialFeature } from '@/constants/tutorialData';

type TutorialContextType = {
  activeTutorial: TutorialFeature | null;
  currentStep: number;
  isTutorialActive: boolean;
  startTutorial: (tutorial: TutorialFeature) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  setStep: (step: number) => void;
  completedTutorials: string[];
  markTutorialComplete: (tutorialId: string) => void;
  resetTutorialProgress: () => void;
};

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

type TutorialProviderProps = {
  children: ReactNode;
};

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [activeTutorial, setActiveTutorial] = useState<TutorialFeature | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const startTutorial = useCallback((tutorial: TutorialFeature) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [activeTutorial, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    setActiveTutorial(null);
    setCurrentStep(-1);
  }, []);

  const completeTutorial = useCallback(() => {
    if (activeTutorial) {
      setCompletedTutorials((prev) => {
        if (!prev.includes(activeTutorial.id)) {
          return [...prev, activeTutorial.id];
        }
        return prev;
      });
      setActiveTutorial(null);
      setCurrentStep(-1);
    }
  }, [activeTutorial]);

  const setStep = useCallback((step: number) => {
    setCurrentStep(step);
    if (step === -1) {
      skipTutorial();
    } else if (activeTutorial && step >= activeTutorial.steps.length) {
      completeTutorial();
    }
  }, [activeTutorial, skipTutorial, completeTutorial]);

  const markTutorialComplete = useCallback((tutorialId: string) => {
    setCompletedTutorials((prev) => {
      if (!prev.includes(tutorialId)) {
        return [...prev, tutorialId];
      }
      return prev;
    });
  }, []);

  const resetTutorialProgress = useCallback(() => {
    setCompletedTutorials([]);
  }, []);

  const value: TutorialContextType = {
    activeTutorial,
    currentStep,
    isTutorialActive: activeTutorial !== null && currentStep >= 0,
    startTutorial,
    nextStep,
    previousStep,
    skipTutorial,
    completeTutorial,
    setStep,
    completedTutorials,
    markTutorialComplete,
    resetTutorialProgress,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = (): TutorialContextType => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

