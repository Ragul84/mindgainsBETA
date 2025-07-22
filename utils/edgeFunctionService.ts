interface LearningContent {
  overview: string;
  keyPoints: string[];
  timeline: Array<{ event: string; description: string; year?: string }>;
  concepts: Array<{ term: string; definition: string }>;
  sampleAnswers: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

interface TestQuestion {
  id: string;
  type: 'mcq' | 'short' | 'long';
  question: string;
  options?: string[];
  correctAnswer?: number;
  points: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface MascotResponse {
  message: string;
  mood: 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'concerned';
  animation: 'bounce' | 'cheer' | 'think' | 'celebrate' | 'comfort';
}

interface UserStats {
  user_id: string;
  total_xp: number;
  current_level: number;
  missions_completed: number;
  streak_days: number;
  last_activity_date: string;
}

export class EdgeFunctionService {
  private static getSupabaseUrl(): string {
    return process.env.EXPO_PUBLIC_SUPABASE_URL || '';
  }

  private static getSupabaseAnonKey(): string {
    return process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
  }

  private static async callEdgeFunction(
    functionName: string,
    payload: any,
    method: 'GET' | 'POST' = 'POST'
  ): Promise<any> {
    const supabaseUrl = this.getSupabaseUrl();
    const supabaseKey = this.getSupabaseAnonKey();
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }

    const url = `${supabaseUrl}/functions/v1/${functionName}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (method === 'POST' && payload) {
      config.body = JSON.stringify(payload);
    } else if (method === 'GET' && payload) {
      const params = new URLSearchParams(payload);
      const urlWithParams = `${url}?${params}`;
      const response = await fetch(urlWithParams, { ...config, body: undefined });
      
      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }
      
      return response.json();
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.status}`);
    }

    return response.json();
  }

  static async analyzeContent(
    content: string,
    method: string,
    subject?: string
  ): Promise<{ content: LearningContent; missionId: string }> {
    const response = await this.callEdgeFunction('analyze-content', {
      content,
      method,
      subject,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to analyze content');
    }

    return {
      content: response.content,
      missionId: response.missionId,
    };
  }

  static async generateQuiz(
    missionId: string,
    content: LearningContent,
    difficulty: string = 'intermediate',
    questionCount: number = 5
  ): Promise<{ questions: QuizQuestion[]; totalPoints: number; timeLimit: number }> {
    const response = await this.callEdgeFunction('generate-quiz', {
      missionId,
      content,
      difficulty,
      questionCount,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate quiz');
    }

    return response.quiz;
  }

  static async generateFlashcards(
    missionId: string,
    content: LearningContent,
    cardCount: number = 10
  ): Promise<{ flashcards: Flashcard[]; totalCards: number; categories: string[] }> {
    const response = await this.callEdgeFunction('generate-flashcards', {
      missionId,
      content,
      cardCount,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate flashcards');
    }

    return response.flashcards;
  }

  static async generateTest(
    missionId: string,
    content: LearningContent,
    testType: string = 'comprehensive',
    questionCount: number = 15,
    timeLimit: number = 900
  ): Promise<{ 
    test: { 
      title: string; 
      instructions: string; 
      timeLimit: number; 
      totalPoints: number; 
      questions: TestQuestion[] 
    }; 
    passingScore: number 
  }> {
    const response = await this.callEdgeFunction('generate-test', {
      missionId,
      content,
      testType,
      questionCount,
      timeLimit,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate test');
    }

    return response.test;
  }

  static async getMascotResponse(
    context: string,
    userAction: string,
    performance?: any
  ): Promise<MascotResponse> {
    try {
      const response = await this.callEdgeFunction('mascot-response', {
        context,
        userAction,
        performance,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to get mascot response');
      }

      return response.response;
    } catch (error) {
      // Fallback response if edge function fails
      return {
        message: "Keep going! You're doing amazing! 🌟",
        mood: 'encouraging',
        animation: 'bounce'
      };
    }
  }

  static async trackProgress(
    userId: string,
    missionId: string,
    roomType: 'clarity' | 'quiz' | 'memory' | 'test',
    performance: {
      correctAnswers: number;
      totalQuestions: number;
      timeSpent: number;
      difficulty: string;
      xpGained: number;
    }
  ): Promise<{
    success: boolean;
    xpGained: number;
    totalXP: number;
    achievements: any[];
    progress: any;
  }> {
    const response = await this.callEdgeFunction('track-progress', {
      userId,
      missionId,
      roomType,
      performance,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to track progress');
    }

    return response;
  }

  static async getUserStats(userId: string): Promise<UserStats> {
    const response = await this.callEdgeFunction(
      'track-progress',
      { userId },
      'GET'
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to get user stats');
    }

    return response.stats;
  }

  static async sendWebhook(
    webhookType: 'youtube-metadata' | 'payment-success' | 'user-milestone',
    data: any
  ): Promise<{ success: boolean }> {
    const response = await this.callEdgeFunction(`webhooks/${webhookType}`, data);

    if (!response.success) {
      throw new Error(response.error || 'Failed to send webhook');
    }

    return response;
  }

  static async calculateXP(
    performance: {
      correctAnswers: number;
      totalQuestions: number;
      timeSpent: number;
      difficulty: string;
      roomType: 'clarity' | 'quiz' | 'memory' | 'test';
    }
  ): Promise<{ xpGained: number; bonusXP: number; reason: string }> {
    const baseXP = {
      clarity: 5,
      quiz: 10,
      memory: 8,
      test: 20
    };

    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2
    };

    const accuracyBonus = performance.correctAnswers / performance.totalQuestions;
    const speedBonus = performance.timeSpent < 300 ? 1.2 : 1; // Bonus for completing under 5 minutes

    const xpGained = Math.round(
      baseXP[performance.roomType] * 
      performance.correctAnswers * 
      difficultyMultiplier[performance.difficulty as keyof typeof difficultyMultiplier] * 
      speedBonus
    );

    const bonusXP = Math.round(xpGained * accuracyBonus * 0.5);

    return {
      xpGained: xpGained + bonusXP,
      bonusXP,
      reason: `Great job! ${Math.round(accuracyBonus * 100)}% accuracy${speedBonus > 1 ? ' with speed bonus!' : '!'}`
    };
  }
}

export type {
  LearningContent,
  QuizQuestion,
  Flashcard,
  TestQuestion,
  MascotResponse,
  UserStats
};