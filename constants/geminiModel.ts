/**
 * Modelos ESTABLES disponibles en la API actual (abril 2026):
 *   gemini-2.5-flash-lite  → el más barato y rápido de la familia 2.5  ✅ (este)
 *   gemini-2.5-flash       → más capaz, mismas restricciones de cuota
 *
 * MODELOS RETIRADOS (ya no disponibles en v1beta):
 *   gemini-1.5-flash       → 404 — eliminado
 *   gemini-2.0-flash-lite  → 404/429 — deprecado y desactivado
 *
 * ⚠️  El free tier limita a ~20 req/día por modelo.
 *    Para producción activa el billing en https://aistudio.google.com/plan_information
 *    (Tier 1 cuesta ~$0 con uso normal y sube el límite drásticamente).
 */
export const GEMINI_MODEL = "gemini-2.5-flash-lite";
