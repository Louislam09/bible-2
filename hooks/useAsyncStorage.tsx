import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SetValue = (value: any) => Promise<void>;
type RemoveValue = () => Promise<void>;
type ReturnValue = {
  lastReadBook: any;
  setLastReadBook: SetValue;
  removeValue: RemoveValue;
  loading: boolean;
};

const useStorage = (
  key: string,
  initialValue: any,
  notFetch: boolean = false
): ReturnValue => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const setValue: SetValue = async (value) => {
    try {
      // Store value
      await AsyncStorage.setItem(key, JSON.stringify(value));
      setStoredValue(value);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (notFetch) return;
    const loadValue = async () => {
      setLoading(true);
      try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          setStoredValue(JSON.parse(value));
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadValue();
    setLoading(false);
  }, [key]);

  const removeValue: RemoveValue = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    lastReadBook: storedValue,
    setLastReadBook: setValue,
    removeValue,
    loading,
  };
};

export default useStorage;
