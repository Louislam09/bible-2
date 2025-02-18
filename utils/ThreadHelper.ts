import { InteractionManager } from "react-native";

type ThreadHelperType = {
  nextFrame: () => Promise<void>;
  runWhenThreadIsReady: (callback: () => void) => void;
};

const ThreadHelper: ThreadHelperType = {
  /**
   * Promise resolved as soon as the requestAnimationFrame goes on
   */
  nextFrame: (): Promise<void> => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        console.debug("ThreadHelper :: requestAnimationFrame");
        resolve();
      });
    });
  },

  /**
   * Runs a callback when the main thread is ready, without blocking UI
   */
  runWhenThreadIsReady: (callback: () => void): void => {
    InteractionManager.runAfterInteractions(() => {
      // Run in the background without blocking the UI
      setTimeout(async () => {
        await ThreadHelper.nextFrame(); // Ensure it's in the next frame
        callback(); // Execute the callback
      }, 0);
    });
  },
};

export default ThreadHelper;
