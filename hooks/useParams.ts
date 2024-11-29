import { useLocalSearchParams } from "expo-router";

// Utility to parse and cast parameters
const parseParams = <T extends Record<string, any>>(
  params: Record<string, string>
): T => {
  const parsed: any = {};
  for (const key in params) {
    const value = params[key];
    if (!isNaN(Number(value))) parsed[key] = Number(value); // Convert to number
    else if (value === "true" || value === "false")
      parsed[key] = value === "true"; // Convert to boolean
    else parsed[key] = value; // Keep as string
  }
  return parsed as T;
};

// Custom hook
const useParams = <T extends Record<string, any>>() => {
  const params = useLocalSearchParams();
  return parseParams<T>(params as Record<string, string>); // Parse and cast params
};

export default useParams;
