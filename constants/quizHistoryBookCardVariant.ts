export type QuizHistoryBookCardVariant =
  | "v4"
  | "v7"
  | "v12"
  | "v13"
  | "v16"
  | "v29";

/**
 * Switch quiz history book cards (see design mocks in repo / `book_card_variants*.html`).
 * - **v4** — Segmented bar
 * - **v7** — Status badge + 3-col grid + bar
 * - **v12** — Chapter tile grid
 * - **v13** — Split halves (aprobados / intentos) + band + bar; list = accent % column
 * - **v16** — Tinted surface (book-tinted card)
 * - **v29** — Data table rows + bar + footer; list = progress | ok / prog / aprob
 */
export const QUIZ_HISTORY_BOOK_CARD_VARIANT: QuizHistoryBookCardVariant = "v16";

export type QuizHistoryBookCardOption = {
  value: QuizHistoryBookCardVariant;
  title: string;
  subtitle: string;
};

/** Options for Mis Quiz → apariencia del listado de libros */
export const QUIZ_HISTORY_BOOK_CARD_OPTIONS: readonly QuizHistoryBookCardOption[] =
  [
    {
      value: "v4",
      title: "Barra segmentada",
      subtitle: "Progreso en una sola barra por segmentos",
    },
    {
      value: "v7",
      title: "Estado + cuadrícula",
      subtitle: "Insignia de estado, rejilla 3 columnas y barra",
    },
    {
      value: "v12",
      title: "Cuadrícula de capítulos",
      subtitle: "Mosaico de casillas por capítulo",
    },
    {
      value: "v13",
      title: "Mitades y banda",
      subtitle: "Aprobados / intentos, banda y barra; lista con columna %",
    },
    {
      value: "v16",
      title: "Superficie teñida",
      subtitle: "Tarjeta con tinte del color del libro",
    },
    {
      value: "v29",
      title: "Tabla de datos",
      subtitle: "Filas tipo tabla, barra y pie; lista con columnas de progreso",
    },
  ];

const VALID_VARIANTS = new Set<string>(
  QUIZ_HISTORY_BOOK_CARD_OPTIONS.map((o) => o.value),
);

export function parseQuizHistoryBookCardVariant(
  raw: unknown,
): QuizHistoryBookCardVariant {
  if (typeof raw === "string" && VALID_VARIANTS.has(raw)) {
    return raw as QuizHistoryBookCardVariant;
  }
  return QUIZ_HISTORY_BOOK_CARD_VARIANT;
}
