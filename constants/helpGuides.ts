import { IconProps } from "@/components/Icon";

export interface IHelpStep {
  text: string;
  icon: IconProps["name"];
  description?: string;
}

export interface IHelpGuide {
  id: string;
  title: string;
  description: string;
  icon: IconProps["name"];
  color: string;
  steps: IHelpStep[];
  link?: string; // Optional link to the feature
}

export const HELP_GUIDES: IHelpGuide[] = [
  {
    id: "dashboard",
    title: "Inicio y Menú",
    description: "Conoce tu pantalla principal y sus herramientas",
    icon: "LayoutDashboard",
    color: "#78b0a4",
    steps: [
      {
        text: "Tu Panel Principal",
        icon: "LayoutDashboard",
        description: "Aquí encontrarás acceso rápido a todas las funciones: Biblia, Himnos, Notas y más."
      },
      {
        text: "Versículo Diario",
        icon: "Calendar",
        description: "Cada día recibirás un nuevo versículo para inspirarte. Toca para leer el capítulo completo."
      },
      {
        text: "Herramientas de Estudio",
        icon: "BookA",
        description: "Desliza hacia abajo para encontrar Diccionarios, Comentarios y la Guía IA."
      },
      {
        text: "Recursos Adicionales",
        icon: "MoreHorizontal",
        description: "Al final encontrarás opciones para descargar módulos, ajustes y compartir la app."
      }
    ],
    link: "/(dashboard)"
  },
  {
    id: "reading",
    title: "Lectura Bíblica",
    description: "Aprende a navegar y personalizar tu lectura",
    icon: "BookOpen",
    color: "#4CAF50",
    steps: [
      {
        text: "Navegación Rápida",
        icon: "Library",
        description: "Toca el nombre del libro arriba para cambiar de Libro, Capítulo o Versículo rápidamente."
      },
      {
        text: "Versiones de Biblia",
        icon: "FileStack",
        description: "Toca el ícono de versiones en la barra superior para cambiar o comparar traducciones."
      },
      {
        text: "Opciones de Versículo",
        icon: "Touchpad",
        description: "Toca cualquier versículo para: Resaltar, Copiar, Compartir, ver Comentarios o Comparar."
      },
      {
        text: "Personalización",
        icon: "Settings2",
        description: "Usa los ajustes para cambiar el tamaño de letra, fuente y tema (Claro/Oscuro)."
      }
    ],
    link: "/home"
  },
  {
    id: "search",
    title: "Búsqueda",
    description: "Encuentra versículos y temas específicos",
    icon: "Search",
    color: "#2196F3",
    steps: [
      {
        text: "Buscador Potente",
        icon: "Search",
        description: "Escribe una palabra clave (ej: 'Fe', 'Amor') en la barra de búsqueda."
      },
      {
        text: "Filtros Inteligentes",
        icon: "Filter",
        description: "Filtra los resultados por Libro (ej: solo en Salmos) para refinar tu búsqueda."
      },
      {
        text: "Historial",
        icon: "History",
        description: "Accede rápidamente a tus búsquedas y versículos visitados anteriormente."
      }
    ],
    link: "/(search)"
  },
  {
    id: "study",
    title: "Herramientas de Estudio",
    description: "Diccionarios, Comentarios y Concordancia",
    icon: "GraduationCap",
    color: "#9389ec",
    steps: [
      {
        text: "Diccionarios",
        icon: "BookA",
        description: "Consulta definiciones de términos bíblicos directamente mientras lees."
      },
      {
        text: "Concordancia",
        icon: "SwatchBook",
        description: "Encuentra dónde se usa una palabra específica en toda la Biblia."
      },
      {
        text: "Guía IA",
        icon: "Bot",
        description: "Pregunta a nuestra Inteligencia Artificial para obtener explicaciones y contextos."
      }
    ],
    link: "/dictionary"
  },
  {
    id: "activities",
    title: "Juegos y Actividades",
    description: "Aprende divirtiéndote",
    icon: "Gamepad2",
    color: "#FF9800",
    steps: [
      {
        text: "Quiz Bíblico",
        icon: "Trophy",
        description: "Pon a prueba tus conocimientos con preguntas de trivia bíblica."
      },
      {
        text: "Memorización",
        icon: "Brain",
        description: "Herramientas especiales para ayudarte a memorizar versículos clave."
      },
      {
        text: "Personajes",
        icon: "User",
        description: "Explora biografías y datos interesantes sobre personajes bíblicos."
      }
    ],
    link: "/(game)"
  },
  {
    id: "hymns",
    title: "Himnos y Música",
    description: "Alaba con himnos clásicos",
    icon: "Music2",
    color: "#ec899e",
    steps: [
      {
        text: "Himnario Digital",
        icon: "Music",
        description: "Accede a una vasta colección de himnos con letra y música."
      },
      {
        text: "Reproductor",
        icon: "PlayCircle",
        description: "Escucha la melodía mientras lees la letra para cantar."
      }
    ],
    link: "/hymn"
  }
];
