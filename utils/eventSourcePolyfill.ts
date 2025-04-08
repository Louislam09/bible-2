import EventSource from "react-native-sse";

// Add EventSource to the global scope
(global as any).EventSource = EventSource;
