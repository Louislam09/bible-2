/**
 * Modelos (abril 2026):
 *   gemini-3-flash-preview → Gemini 3 Flash (preview)  ✅ (este)
 *   gemini-2.5-flash-lite  → más barato; cuota free más holgada en req/día que 3 Flash
 *   gemini-2.5-flash       → familia 2.5
 *
 * MODELOS RETIRADOS (ya no disponibles en v1beta):
 *   gemini-1.5-flash       → 404 — eliminado
 *   gemini-2.0-flash-lite  → 404/429 — deprecado y desactivado
 *
 * ⚠️  Free tier: revisa RPM/RPD en AI Studio; con billing Tier 1 suelen subir mucho los límites.
 *    https://aistudio.google.com/plan_information
 */
// export const GEMINI_MODEL = "gemini-3-flash-preview";
// export const GEMINI_MODEL = "gemma-3-1b-it";
export const GEMINI_MODEL = "gemma-4-26b-a4b-it";
