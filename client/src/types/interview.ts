export interface CreateInterviewRequest {
  role: string;
  techStacks?: string;
  difficulty: "easy" | "medium" | "hard";
  // Matches server: interview.validation.ts CreateInterviewSchema
  type: "technical" | "behavioral" | "system_design" | "mixed";
  mode: "voice" | "text";
}

export interface Question {
  _id: string;
  question: string;
  topic: string;
  difficulty: string;
  order: number;
}

export interface Interview {
  _id: string;
  role: string;
  type: string;
  mode: string;
  difficulty: string;
  status: string;
  techStacks?: string;
  questionsAsked?: number;
}

export interface CreateInterviewResponse {
  success: boolean;
  message: string;
  data: {
    interview: Interview;
    question: Question;
  };
}
