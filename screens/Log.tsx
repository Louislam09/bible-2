import { Text } from "components/Themed";
import React, { useState } from "react";
import Popover, { Rect } from "react-native-popover-view";

const LogScreen = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    {
      text: "Paso 1: Haz clic aquí para comenzar",
      target: "button",
      pos: new Rect(10, 0, 40, 40),
    },
    {
      text: "Paso 2: Ahora toca esta área",
      target: "area",
      pos: new Rect(10, 100, 40, 40),
    },
    {
      text: "Paso 3: Sigue las instrucciones",
      target: "instructions",
      pos: new Rect(10, 200, 40, 40),
    },
    {
      text: "Paso 4: Completa el proceso",
      target: "process",
      pos: new Rect(10, 300, 40, 40),
    },
    {
      text: "Paso 5: ¡Felicidades, has terminado!",
      target: "finish",
      pos: new Rect(10, 400, 40, 40),
    },
  ];

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <Popover
      from={stepIndex === -1 ? "" : steps[stepIndex].pos}
      isVisible={stepIndex === -1 ? false : stepIndex < steps.length}
    >
      <Text>Log Page</Text>
      {/* <Walkthrough
        close={() => setStepIndex(-1)}
        content={stepIndex === -1 ? "" : steps[stepIndex].text}
        next={nextStep}
        previuos={() => setStepIndex(stepIndex - 1)}
        skip={() => setStepIndex(-1)}
        totalStep={steps.length}
        currentStep={stepIndex}
      /> */}
    </Popover>
  );
};

export default LogScreen;
