import React, { useEffect, useRef } from "react";
import { useTutorial } from "@/context/TutorialContext";
import { getTourRef } from "@/state/tourState";
import Walkthrough from "./Walkthrough";

/**
 * TutorialWalkthrough Component
 * 
 * A wrapper component that automatically connects the enhanced Walkthrough
 * component with the TutorialContext and tourState$ refs. This component 
 * should be placed at the root level of screens where tutorials will be displayed.
 * 
 * @example
 * // In your screen component:
 * function HomeScreen() {
 *   return (
 *     <>
 *       <YourScreenContent />
 *       <TutorialWalkthrough />
 *     </>
 *   );
 * }
 */
const TutorialWalkthrough: React.FC = () => {
  const {
    activeTutorial,
    currentStep,
    setStep,
    completeTutorial,
    isTutorialActive,
  } = useTutorial();

  // Convert tutorial steps to Walkthrough format with refs from tourState$
  const walkthroughSteps = React.useMemo(() => {
    if (!activeTutorial) return [];

    return activeTutorial.steps.map((step) => {
      // If step has targetRef string, get the ref from tourState$
      let targetRef = step.target;

      if (step.targetRef && !step.target) {
        try {
          targetRef = getTourRef(step.targetRef);
        } catch (error) {
          console.warn(`Failed to get ref for ${step.targetRef}:`, error);
        }
      }

      return {
        text: step.text,
        target: targetRef,
        action: step.action,
      };
    });
  }, [activeTutorial]);

  if (!isTutorialActive || walkthroughSteps.length === 0) {
    return null;
  }

  return (
    <Walkthrough
      currentStep={currentStep}
      steps={walkthroughSteps}
      setStep={setStep}
      onComplete={completeTutorial}
    />
  );
};

export default TutorialWalkthrough;

