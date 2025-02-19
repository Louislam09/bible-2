import { useRef, useEffect, ComponentType } from "react";

const withRenderCount = <P extends object>(
  WrappedComponent: ComponentType<P>
) => {
  return (props: P) => {
    const renderCount = useRef(0);
    renderCount.current += 1;

    useEffect(() => {
      console.log(
        `${WrappedComponent.name || "Component"} rendered ${
          renderCount.current
        } times`
      );
    });

    return <WrappedComponent {...props} />;
  };
};

export default withRenderCount;
