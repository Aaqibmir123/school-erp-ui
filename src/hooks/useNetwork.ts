import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    void NetInfo.fetch().then((state) => {
      setIsConnected(!!state.isConnected && state.isInternetReachable !== false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(!!state.isConnected && state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
};
