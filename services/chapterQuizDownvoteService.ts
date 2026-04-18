/**
 * PocketBase: create collection `chapter_quiz_downvotes` with
 * `chapter_key` (text) and `user` (relation → users).
 * Rules: allow create/list/delete for authenticated users as needed so
 * this client can create votes, count them, and delete all rows for a key
 * when the threshold is reached. The app also deletes the matching row in
 * `chapter_quiz_cache` — grant delete there or handle removal via a PB hook.
 */
import { pb } from "@/globalConfig";
import { chapterQuizLocalDbService } from "@/services/chapterQuizLocalDbService";

const DOWNVOTES_COLLECTION = "chapter_quiz_downvotes";
const CACHE_COLLECTION = "chapter_quiz_cache";

const escapeFilterValue = (value: string) => value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

export type DownvoteResult =
  | { ok: true; reachedThreshold: boolean }
  | { ok: false; reason: "not_authenticated" | "already_voted" | "network"; message: string };

/**
 * Records a downvote for the shared quiz (chapter_key). If 5 distinct users
 * have voted, deletes the PocketBase cache row, all downvotes for that key,
 * and local SQLite cache for that chapter.
 */
export async function submitChapterQuizDownvote(chapterKey: string): Promise<DownvoteResult> {
  if (!pb.authStore.isValid) {
    return {
      ok: false,
      reason: "not_authenticated",
      message: "Inicia sesión para indicar que un quiz no es bueno.",
    };
  }

  const userId = pb.authStore.record?.id;
  if (!userId || typeof userId !== "string") {
    return {
      ok: false,
      reason: "not_authenticated",
      message: "Sesión inválida.",
    };
  }

  const keyFilter = `chapter_key = "${escapeFilterValue(chapterKey)}"`;

  try {
    await pb
      .collection(DOWNVOTES_COLLECTION)
      .getFirstListItem(`${keyFilter} && user = "${escapeFilterValue(userId)}"`);
    return {
      ok: false,
      reason: "already_voted",
      message: "Ya registraste tu opinión sobre este quiz.",
    };
  } catch {
    // no existing vote
  }

  try {
    await pb.collection(DOWNVOTES_COLLECTION).create({
      chapter_key: chapterKey,
      user: userId,
    });
  } catch (e) {
    console.error("[chapterQuizDownvote] create", e);
    return {
      ok: false,
      reason: "network",
      message: "No se pudo registrar el voto. Revisa tu conexión.",
    };
  }

  try {
    const list = await pb.collection(DOWNVOTES_COLLECTION).getList(1, 250, {
      filter: keyFilter,
    });
    const count = list.totalItems;

    if (count >= 5) {
      try {
        const cacheRow = (await pb
          .collection(CACHE_COLLECTION)
          .getFirstListItem(`key = "${escapeFilterValue(chapterKey)}"`)) as { id: string };
        await pb.collection(CACHE_COLLECTION).delete(cacheRow.id);
      } catch {
        // cache row may already be gone
      }

      const allVotes = await pb.collection(DOWNVOTES_COLLECTION).getFullList({
        filter: keyFilter,
      });
      await Promise.all(allVotes.map((v) => pb.collection(DOWNVOTES_COLLECTION).delete(v.id)));

      await chapterQuizLocalDbService.deleteCachedQuestions(chapterKey);
      return { ok: true, reachedThreshold: true };
    }
  } catch (e) {
    console.error("[chapterQuizDownvote] threshold check", e);
  }

  return { ok: true, reachedThreshold: false };
}
