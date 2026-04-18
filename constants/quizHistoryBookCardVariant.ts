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
