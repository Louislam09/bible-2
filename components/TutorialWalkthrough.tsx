import { useTutorial } from "@/context/TutorialContext";
import { getTourRef } from "@/state/tourState";
import React from "react";
import Walkthrough from "./Walkthrough";

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
        ...step,
        text: step.text,
        target: targetRef,
        action: step.action,
        startActionOnMount: step.startActionOnMount,
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

