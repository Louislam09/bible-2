import { useState } from "react";

function useInternetConnection(): { isConnected: boolean; checkConnection: () => Promise<boolean> } {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  async function checkConnection() {
    try {
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
          cache: "no-cache",
        });
        setIsConnected(response.ok);
        return response.ok;
      } catch (error) {
        setIsConnected(false);
        return false;
      }
    }

  return { isConnected, checkConnection };
}

export default useInternetConnection;
