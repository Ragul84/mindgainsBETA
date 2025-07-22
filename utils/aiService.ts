// Legacy service - now redirects to EdgeFunctionService
// This maintains backward compatibility while using the new edge functions

import { EdgeFunctionService } from './edgeFunctionService';

export const AIService = EdgeFunctionService;

export type {
  LearningContent,
  QuizQuestion,
  Flashcard,
  TestQuestion,
  MascotResponse
} from './edgeFunctionService';