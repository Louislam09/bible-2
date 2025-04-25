import { storedData$ } from "@/context/LocalstoreContext";
import { showToast } from "@/utils/showToast";
import { use$ } from "@legendapp/state/react";
import { useState } from "react";

type Position = "top-left" | "bottom-right" | "top-right";
const SECRET_PATTERN: Position[] = ["top-left", "bottom-right", "top-right"];

interface UseSecretUnlockReturn {
  handleTap: (position: Position) => Promise<void>;
  isAdmin: boolean;
}

export function useSecretUnlock(): UseSecretUnlockReturn {
  const [tapSequence, setTapSequence] = useState<Position[]>([]);
  const isAdmin = use$(() => storedData$.isAdmin.get());

  async function handleTap(position: Position): Promise<void> {
    if (isAdmin) return;
    
    const newSequence = [...tapSequence, position];

    if (newSequence.length > SECRET_PATTERN.length) {
      setTapSequence([]);
      showToast('🔄');
      return;
    }

    setTapSequence(newSequence);
    if (newSequence.join(",") === SECRET_PATTERN.join(",")) {
      showToast("Admin Mode Unlocked!");
      storedData$.isAdmin.set(!storedData$.isAdmin.get());
    }
  }

  return { handleTap, isAdmin };
}
