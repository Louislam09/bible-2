import { useState, useEffect } from "react";

function useInternetConnection(): boolean {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch("https://www.google.com", {
          method: "HEAD",
          cache: "no-cache",
        });
        setIsConnected(response.ok);
      } catch (error) {
        setIsConnected(false);
      }
    }

    checkConnection();

    // const intervalId = setInterval(checkConnection, 10000);

    // return () => clearInterval(intervalId);
  }, []);

  return isConnected;
}

export default useInternetConnection;