import * as Device from "expo-device";
const bytesToGB = (bytes: number) => bytes / 1e9;

const getMemorySizeInGB = () => bytesToGB(Device.totalMemory || 0).toFixed(2);

export default getMemorySizeInGB