export interface CreateInterviewRequest {
  role: string;
  company?: string;
  techStacks?: string;
  difficulty: "easy" | "medium" | "hard";
  type: "technical" | "behavioral";
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
  company?: string;
  difficulty: string;
  status: string;
}

export interface CreateInterviewResponse {
  success: boolean;
  message: string;
  data: {
    interview: Interview;
    question: Question;
  };
}
