import { RefObject } from "react";
import { icons } from "lucide-react-native";
import { tourState$ } from "@/state/tourState";

export type TutorialStep = {
  id: string;
  text: string;
  target: RefObject<any> | null;
  targetRef?: string; // Name of ref in tourState$ (e.g., "bookSelector")
  action?: () => void | Promise<void>;
};

export type TutorialFeature = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof icons;
  color: string;
  category: "lectura" | "estudio" | "herramientas" | "personalizacion";
  difficulty: "facil" | "intermedio" | "avanzado";
  duration: string; // e.g., "2 min"
  steps: TutorialStep[];
};

export const TUTORIAL_FEATURES: TutorialFeature[] = [
  // LECTURA
  {
    id: "home-screen-tour",
    title: "Pantalla Principal - Lectura",
    description: "Tour completo de la pantalla de lectura de la Biblia",
    icon: "House",
    color: "#3B82F6",
    category: "lectura",
    difficulty: "facil",
    duration: "4 min",
    steps: [
      {
        id: "1",
        text: "¡Bienvenido! Aquí leerás y explorarás la Palabra de Dios.",
        target: null,
      },
      {
        id: "2",
        text: "En la parte superior verás el nombre del libro, capítulo y versión actual de la Biblia. Toca cualquiera para cambiar.",
        target: null,
        targetRef: "footerTitleRef", // Will use ref from tourState$
      },
      {
        id: "3",
        text: "Puedes navegar entre capítulos deslizando hacia la izquierda o derecha, o usando las flechas de navegación.",
        target: null,
        targetRef: "nextButton",
      },
      {
        id: "4",
        text: "Para seleccionar un versículo, simplemente tócalo. Verás opciones para copiar, compartir, agregar a favoritos o crear notas.",
        target: null,
        targetRef: "verseContent",
      },
      {
        id: "5",
        text: "En la barra superior encontrarás herramientas como búsqueda, audio, pantalla dividida y más opciones.",
        target: null,
        targetRef: "toolbar",
      },
      {
        id: "6",
        text: "El botón flotante de notas te permite acceder rápidamente a tus notas personales sobre el pasaje actual.",
        target: null,
        targetRef: "floatingNotesButton",
      },
      {
        id: "7",
        text: "¡Perfecto! Ya conoces los elementos básicos. Explora y disfruta de tu tiempo en la Palabra.",
        target: null,
      },
    ],
  },
  {
    id: "basic-reading",
    title: "Navegación Rápida",
    description: "Aprende a navegar por los libros, capítulos y versículos de la Biblia",
    icon: "BookOpen",
    color: "#4CAF50",
    category: "lectura",
    difficulty: "facil",
    duration: "2 min",
    steps: [
      {
        id: "1",
        text: "Bienvenido a la Biblia. Aquí puedes leer cualquier libro y capítulo. Toca el selector de libros para comenzar.",
        target: null,
      },
      {
        id: "2",
        text: "Selecciona un libro de la lista. Puedes buscar por nombre o desplazarte.",
        target: null,
      },
      {
        id: "3",
        text: "Ahora selecciona el capítulo que deseas leer.",
        target: null,
      },
      {
        id: "4",
        text: "Desliza hacia arriba o abajo para leer el contenido del capítulo.",
        target: null,
      },
    ],
  },
  {
    id: "split-screen",
    title: "Pantalla Dividida",
    description: "Compara dos pasajes bíblicos lado a lado o usa diferentes versiones",
    icon: "SquareSplitVertical",
    color: "#2196F3",
    category: "lectura",
    difficulty: "intermedio",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "La pantalla dividida te permite ver dos pasajes al mismo tiempo. Toca el ícono de pantalla dividida.",
        target: null,
      },
      {
        id: "2",
        text: "Ahora tienes dos paneles. El superior y el inferior funcionan de forma independiente.",
        target: null,
      },
      {
        id: "3",
        text: "Puedes ajustar el tamaño de cada panel arrastrando la línea divisoria.",
        target: null,
      },
      {
        id: "4",
        text: "Cada panel puede mostrar un libro diferente o incluso una versión diferente de la Biblia.",
        target: null,
      },
    ],
  },
  {
    id: "verse-selection",
    title: "Selección de Versículos",
    description: "Aprende a seleccionar, copiar y compartir versículos",
    icon: "MousePointerClick",
    color: "#9C27B0",
    category: "lectura",
    difficulty: "facil",
    duration: "2 min",
    steps: [
      {
        id: "1",
        text: "Toca un versículo para seleccionarlo y ver las opciones disponibles.",
        target: null,
      },
      {
        id: "2",
        text: "Una vez seleccionado, aparecerá un menú con opciones: copiar, compartir, favoritos y notas.",
        target: null,
      },
      {
        id: "3",
        text: "Para seleccionar múltiples versículos, mantén presionado un versículo y luego toca otros.",
        target: null,
      },
      {
        id: "4",
        text: "Toca dos veces un versículo para marcarlo con resaltado especial.",
        target: null,
      },
    ],
  },

  // ESTUDIO
  {
    id: "search-feature",
    title: "Búsqueda Inteligente",
    description: "Encuentra versículos, palabras y temas rápidamente",
    icon: "Search",
    color: "#FF9800",
    category: "estudio",
    difficulty: "intermedio",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "Toca el ícono de búsqueda en la parte superior para buscar en toda la Biblia.",
        target: null,
      },
      {
        id: "2",
        text: "Escribe una palabra o frase. La búsqueda es instantánea y muestra resultados mientras escribes.",
        target: null,
      },
      {
        id: "3",
        text: "Puedes filtrar los resultados por libro usando los filtros disponibles.",
        target: null,
      },
      {
        id: "4",
        text: "Tu historial de búsqueda se guarda automáticamente para acceso rápido.",
        target: null,
      },
    ],
  },
  {
    id: "notes-feature",
    title: "Notas Personales",
    description: "Crea y organiza notas sobre versículos",
    icon: "FileText",
    color: "#E91E63",
    category: "estudio",
    difficulty: "intermedio",
    duration: "4 min",
    steps: [
      {
        id: "1",
        text: "Selecciona un versículo y toca el ícono de notas para crear una nota personal.",
        target: null,
      },
      {
        id: "2",
        text: "Escribe tus reflexiones, estudios o recordatorios sobre el versículo.",
        target: null,
      },
      {
        id: "3",
        text: "Puedes agregar etiquetas para organizar tus notas por tema.",
        target: null,
      },
      {
        id: "4",
        text: "Accede a todas tus notas desde el menú principal en cualquier momento.",
        target: null,
      },
    ],
  },
  {
    id: "favorites",
    title: "Versículos Favoritos",
    description: "Guarda y organiza tus versículos favoritos",
    icon: "Heart",
    color: "#F44336",
    category: "estudio",
    difficulty: "facil",
    duration: "2 min",
    steps: [
      {
        id: "1",
        text: "Selecciona un versículo y toca el ícono de corazón para agregarlo a favoritos.",
        target: null,
      },
      {
        id: "2",
        text: "Puedes crear colecciones temáticas para organizar tus versículos favoritos.",
        target: null,
      },
      {
        id: "3",
        text: "Accede a tus favoritos desde el menú principal para revisarlos en cualquier momento.",
        target: null,
      },
    ],
  },
  {
    id: "strong-numbers",
    title: "Números Strong",
    description: "Estudia el significado original de las palabras en hebreo y griego",
    icon: "Languages",
    color: "#00BCD4",
    category: "estudio",
    difficulty: "avanzado",
    duration: "5 min",
    steps: [
      {
        id: "1",
        text: "Los números Strong te ayudan a entender el significado original de las palabras bíblicas.",
        target: null,
      },
      {
        id: "2",
        text: "Activa la vista interlineal desde el menú de configuración.",
        target: null,
      },
      {
        id: "3",
        text: "Toca una palabra para ver su definición en hebreo o griego.",
        target: null,
      },
      {
        id: "4",
        text: "Explora la etimología, traducción literal y usos en otros versículos.",
        target: null,
      },
    ],
  },

  // HERRAMIENTAS
  {
    id: "audio-reading",
    title: "Audio y Lectura",
    description: "Escucha la Biblia con voz natural",
    icon: "Volume2",
    color: "#8BC34A",
    category: "herramientas",
    difficulty: "facil",
    duration: "2 min",
    steps: [
      {
        id: "1",
        text: "Toca el ícono de audio para activar la lectura en voz alta.",
        target: null,
      },
      {
        id: "2",
        text: "Puedes ajustar la velocidad de lectura según tu preferencia.",
        target: null,
      },
      {
        id: "3",
        text: "La lectura continúa automáticamente al pasar de capítulo.",
        target: null,
      },
      {
        id: "4",
        text: "Puedes pausar, avanzar o retroceder en cualquier momento.",
        target: null,
      },
    ],
  },
  {
    id: "hymnal",
    title: "Himnario Digital",
    description: "Accede a himnos y canciones de adoración",
    icon: "Music",
    color: "#673AB7",
    category: "herramientas",
    difficulty: "facil",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "Accede al himnario desde el menú principal.",
        target: null,
      },
      {
        id: "2",
        text: "Busca himnos por nombre, número o categoría.",
        target: null,
      },
      {
        id: "3",
        text: "Toca un himno para ver la letra completa.",
        target: null,
      },
      {
        id: "4",
        text: "Algunos himnos incluyen audio para escuchar la melodía.",
        target: null,
      },
    ],
  },
  {
    id: "games-quiz",
    title: "Juegos y Quiz",
    description: "Aprende jugando con quizzes bíblicos",
    icon: "Gamepad2",
    color: "#FF5722",
    category: "herramientas",
    difficulty: "facil",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "Accede a la sección de juegos desde el menú principal.",
        target: null,
      },
      {
        id: "2",
        text: "Elige entre diferentes categorías: personajes, eventos, libros, etc.",
        target: null,
      },
      {
        id: "3",
        text: "Responde las preguntas y gana puntos por respuestas correctas.",
        target: null,
      },
      {
        id: "4",
        text: "Revisa tus estadísticas y compite con tus récords anteriores.",
        target: null,
      },
    ],
  },
  {
    id: "memory-verses",
    title: "Memorización de Versículos",
    description: "Herramientas para memorizar pasajes bíblicos",
    icon: "Brain",
    color: "#009688",
    category: "herramientas",
    difficulty: "intermedio",
    duration: "4 min",
    steps: [
      {
        id: "1",
        text: "Selecciona versículos que quieres memorizar.",
        target: null,
      },
      {
        id: "2",
        text: "Usa el modo de práctica que oculta palabras progresivamente.",
        target: null,
      },
      {
        id: "3",
        text: "Repite el versículo diariamente para reforzar la memoria.",
        target: null,
      },
      {
        id: "4",
        text: "Recibe recordatorios para revisar tus versículos memorizados.",
        target: null,
      },
    ],
  },

  // PERSONALIZACIÓN
  {
    id: "themes-fonts",
    title: "Temas y Fuentes",
    description: "Personaliza la apariencia de tu aplicación",
    icon: "Palette",
    color: "#795548",
    category: "personalizacion",
    difficulty: "facil",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "Accede a configuración desde el menú principal.",
        target: null,
      },
      {
        id: "2",
        text: "Elige entre modo claro u oscuro según tu preferencia.",
        target: null,
      },
      {
        id: "3",
        text: "Selecciona diferentes temas de color para personalizar la interfaz.",
        target: null,
      },
      {
        id: "4",
        text: "Ajusta el tamaño de fuente para una lectura más cómoda.",
        target: null,
      },
    ],
  },
  {
    id: "bible-versions",
    title: "Versiones de la Biblia",
    description: "Descarga y cambia entre diferentes versiones",
    icon: "Download",
    color: "#607D8B",
    category: "personalizacion",
    difficulty: "intermedio",
    duration: "4 min",
    steps: [
      {
        id: "1",
        text: "Ve a configuración y selecciona 'Versiones de la Biblia'.",
        target: null,
      },
      {
        id: "2",
        text: "Descarga versiones adicionales: NVI, TLA, RVR1960, etc.",
        target: null,
      },
      {
        id: "3",
        text: "Cambia entre versiones fácilmente desde el selector de versiones.",
        target: null,
      },
      {
        id: "4",
        text: "Puedes comparar versiones usando la pantalla dividida.",
        target: null,
      },
    ],
  },
  {
    id: "cloud-sync",
    title: "Sincronización en la Nube",
    description: "Mantén tus datos sincronizados entre dispositivos",
    icon: "Cloud",
    color: "#03A9F4",
    category: "personalizacion",
    difficulty: "intermedio",
    duration: "3 min",
    steps: [
      {
        id: "1",
        text: "Crea una cuenta o inicia sesión para activar la sincronización.",
        target: null,
      },
      {
        id: "2",
        text: "Tus notas, favoritos e historial se guardarán automáticamente.",
        target: null,
      },
      {
        id: "3",
        text: "Accede a tus datos desde cualquier dispositivo donde inicies sesión.",
        target: null,
      },
      {
        id: "4",
        text: "Puedes exportar tus datos en cualquier momento desde configuración.",
        target: null,
      },
    ],
  },
  {
    id: "notifications",
    title: "Notificaciones y Recordatorios",
    description: "Configura recordatorios para lectura diaria",
    icon: "Bell",
    color: "#FFC107",
    category: "personalizacion",
    difficulty: "facil",
    duration: "2 min",
    steps: [
      {
        id: "1",
        text: "Ve a configuración y selecciona 'Notificaciones'.",
        target: null,
      },
      {
        id: "2",
        text: "Activa el versículo del día para recibir inspiración diaria.",
        target: null,
      },
      {
        id: "3",
        text: "Configura recordatorios de lectura para crear un hábito.",
        target: null,
      },
      {
        id: "4",
        text: "Elige la hora que mejor se adapte a tu rutina diaria.",
        target: null,
      },
    ],
  },
];

export const TUTORIAL_CATEGORIES = {
  lectura: {
    name: "Lectura",
    icon: "BookOpen" as keyof typeof icons,
    color: "#4CAF50",
  },
  estudio: {
    name: "Estudio",
    icon: "GraduationCap" as keyof typeof icons,
    color: "#2196F3",
  },
  herramientas: {
    name: "Herramientas",
    icon: "Wrench" as keyof typeof icons,
    color: "#FF9800",
  },
  personalizacion: {
    name: "Personalización",
    icon: "Settings" as keyof typeof icons,
    color: "#9C27B0",
  },
} as const;

export const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "facil":
      return "Fácil";
    case "intermedio":
      return "Intermedio";
    case "avanzado":
      return "Avanzado";
    default:
      return difficulty;
  }
};

export const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "facil":
      return "#4CAF50";
    case "intermedio":
      return "#FF9800";
    case "avanzado":
      return "#F44336";
    default:
      return "#999";
  }
};

