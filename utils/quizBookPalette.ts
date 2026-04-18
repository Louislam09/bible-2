/**
 * Hex mixing for quiz history book cards (WebView HTML + theme-aware surfaces).
 */

import type { QuizStatusBadgeKind } from "@/utils/quizBookMeta";

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6 || h.length === 8) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

/** @param ratio 0 = all `bg`, 1 = all `fg` */
export function mixHex(fg: string, bg: string, ratio: number): string {
  const a = parseHex(fg);
  const b = parseHex(bg);
  if (!a || !b) {
    return fg;
  }
  const t = Math.max(0, Math.min(1, ratio));
  const r = Math.round(a.r * t + b.r * (1 - t));
  const g = Math.round(a.g * t + b.g * (1 - t));
  const bl = Math.round(a.b * t + b.b * (1 - t));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

export function bookCardPaletteColors(
  bookColor: string,
  cardHex: string,
  isDark: boolean,
): { avatarBg: string; segProgColor: string; borderAccent: string } {
  const avatarT = isDark ? 0.34 : 0.22;
  const progT = isDark ? 0.58 : 0.48;
  const borderT = isDark ? 0.5 : 0.42;
  return {
    avatarBg: mixHex(bookColor, cardHex, avatarT),
    segProgColor: mixHex(bookColor, cardHex, progT),
    borderAccent: mixHex(bookColor, cardHex, borderT),
  };
}

/** Background/text for V7 status pill (theme + book tint). */
export function statusBadgeColors(
  kind: QuizStatusBadgeKind,
  bookColor: string,
  cardHex: string,
  softTextHex: string,
): { bg: string; fg: string } {
  if (kind === "none") {
    return {
      bg: mixHex(softTextHex, cardHex, 0.14),
      fg: softTextHex,
    };
  }
  const bgMix = kind === "good" ? 0.2 : 0.32;
  return {
    bg: mixHex(bookColor, cardHex, bgMix),
    fg: bookColor,
  };
}
