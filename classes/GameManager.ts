import gameQuestion from '@/constants/gameQuestion';
import { Question, GameProgress, AnswerResult } from '@/types';
import { generateLevels } from '@/utils/generateLevels';

export class GameManager {
  private levels: number[][];
  private questions: Question[];
  private currentQuestionIndex: number;
  private currentLevel: number;
  private score: number;
  private _gameOver: boolean;

  constructor(questionsPerLevel: number = 5) {
    this.questions = gameQuestion;
    this.levels = generateLevels(this.questions.length, questionsPerLevel);
    this.currentLevel = 0;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this._gameOver = false;
  }

  // Add getter for gameOver
  get gameOver(): boolean {
    return this._gameOver;
  }

  getCurrentQuestion(): Question {
    const levelQuestions = this.levels[this.currentLevel];
    // return this.questions[levelQuestions[this.currentQuestionIndex]];
    return this.questions[0];
  }

  checkAnswer(selectedOption: string): AnswerResult {
    const currentQuestion = this.getCurrentQuestion();
    const isCorrect = selectedOption === currentQuestion.correct;
    if (isCorrect) this.score++;

    return {
      isCorrect,
      correctAnswer: currentQuestion.correct,
      explanation: currentQuestion.explanation,
      reference: currentQuestion.reference,
    };
  }

  nextLevel(): void {
    if (this.currentLevel < this.levels.length - 1) {
      this.currentLevel++;
      this.currentQuestionIndex = 0;
      this._gameOver = false;
      this.score = 0;
    }
  }

  nextQuestion(): boolean {
    const levelQuestions = this.levels[this.currentLevel];
    if (this.currentQuestionIndex < levelQuestions.length - 1) {
      this.currentQuestionIndex++;
      return true;
    } else {
      this._gameOver = true;
      return false;
    }
  }

  getProgress(): GameProgress {
    return {
      current: this.currentQuestionIndex + 1,
      total: this.levels[this.currentLevel].length,
      score: this.score,
      level: this.currentLevel + 1,
      totalLevels: this.levels.length,
    };
  }

  resetGame(): void {
    this.currentLevel = 0;
    this.currentQuestionIndex = 0;
    this.score = 0;
    this._gameOver = false;
  }
}
