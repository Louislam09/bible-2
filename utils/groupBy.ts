// Type for the iteratee function
type IterateeFunction<T> = (item: T) => PropertyKey;

// Type for the group by function
export function groupBy<T>(
  collection: T[],
  iteratee: IterateeFunction<T> | keyof T
): Record<PropertyKey, T[]> {
  // Initialize the result object
  const result: Record<PropertyKey, T[]> = {};

  // Convert string property to iteratee function if needed
  const getKey: IterateeFunction<T> =
    typeof iteratee === 'function'
      ? iteratee
      : (item: T) => item[iteratee] as PropertyKey;

  // Iterate through the collection
  for (const item of collection) {
    // Get the key for the current item
    const key = getKey(item);

    // Initialize array for key if it doesn't exist
    if (!result[key]) {
      result[key] = [];
    }

    // Add item to the appropriate group
    result[key].push(item);
  }

  return result;
}

export const splitText = (text: string, parts: number): string[] => {
  if (parts <= 0) throw new Error('Parts must be positive');
  if (!text.trim()) return Array(parts).fill('');

  const words = text.trim().split(/\s+/);
  const wordsPerPart = Math.ceil(words.length / parts);

  return Array.from(
    { length: parts },
    (_, i) =>
      words.slice(i * wordsPerPart, (i + 1) * wordsPerPart).join(' ') || ''
  );
};