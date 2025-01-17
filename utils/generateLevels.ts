export function generateLevels(
  totalQuestions: number,
  questionsPerLevel: number
): number[][] {
  const levels: number[][] = [];
  const usedNumbers = new Set<number>();

  while (usedNumbers.size < totalQuestions) {
    const levelQuestions = new Set<number>();

    while (
      levelQuestions.size < questionsPerLevel &&
      usedNumbers.size < totalQuestions
    ) {
      const randomQuestion = Math.floor(Math.random() * totalQuestions);
      if (!usedNumbers.has(randomQuestion)) {
        levelQuestions.add(randomQuestion);
        usedNumbers.add(randomQuestion);
      }
    }

    levels.push(Array.from(levelQuestions));
  }

  return levels;
}
