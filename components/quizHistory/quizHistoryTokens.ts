import type { TTheme } from "@/types";

export const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const RADIUS = {
  cell: 12,
  card: 14,
  button: 12,
  pill: 999,
} as const;

export const FAIL_COLOR = "#d97706";
export const PASS_COLOR_FALLBACK = "#22c55e";

export type QuizSurfaces = ReturnType<typeof getSurfaces>;

export function getSurfaces(theme: TTheme) {
  const text = theme.colors.text;
  const accent = theme.colors.notification;
  const pass = PASS_COLOR_FALLBACK;
  return {
    base: theme.colors.background,
    card: theme.colors.card,
    text,
    muted: text + "99",
    softText: text + "66",
    border: text + "14",
    borderStrong: text + "24",
    accent,
    accentSoft: accent + "14",
    accentSofter: accent + "08",
    fail: FAIL_COLOR,
    failSoft: FAIL_COLOR + "14",
    /** Distinct “passed challenge” (retos completados) — not the same as brand accent. */
    pass,
    passSoft: pass + "22",
  };
}
