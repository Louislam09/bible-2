import { IconProps } from "@/components/Icon";
import { AnimationObject } from "lottie-react-native";
import { icons } from "lucide-react-native";

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon?: keyof typeof icons;
  lottie?: string | AnimationObject | { uri: string };
  color: string;
}

export const ONBOARDING_DATA: OnboardingSlide[] = [
  {
    id: "1",
    title: "Bienvenido a Tu Biblia",
    description: "Tu compañero espiritual diario. Descubre, lee y conecta con las Escrituras de una manera hermosa y moderna.",
    icon: "BookOpen",
    color: "#4CAF50",
    // lottie: require("@/assets/lottie/onboarding.json"),
  },
  {
    id: "2",
    title: "Lectura y Estudio",
    description: "Sumérgete en la lectura con herramientas avanzadas. Diccionarios, comentarios y múltiples versiones a tu alcance.",
    icon: "Library",
    color: "#2196F3",
    // lottie: require("@/assets/lottie/loading-book.json"),
  },
  {
    id: "3",
    title: "Búsqueda Inteligente",
    description: "Encuentra versículos, temas y personajes al instante. Filtra por libros y accede a tu historial.",
    icon: "Search",
    color: "#9C27B0",
    // lottie: require("@/assets/lottie/searching.json"),
  },
  {
    id: "4",
    title: "Alabanza y Adoración",
    description: "Disfruta de nuestro himnario digital. Escucha, canta y comparte tus himnos favoritos.",
    icon: "Music2",
    color: "#E91E63",
    // lottie: require("@/assets/lottie/guitar.json"),
  },
  {
    id: "5",
    title: "Aprende Jugando",
    description: "Diviértete mientras aprendes con quizzes bíblicos y herramientas de memorización.",
    icon: "Gamepad2",
    color: "#FF9800",
    // lottie: require("@/assets/lottie/batteryBrain.json"),
  },
];
