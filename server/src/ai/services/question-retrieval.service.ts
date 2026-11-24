import { questionBankRepository, CandidateSearchParams } from "../../modules/question-bank/question-bank.repository";

export async function retrieveQuestions(params: {
  type: string;
  difficulty: string;
  role?: string;
  techStacks?: string[];
  coveredTopics?: string[];
  limit?: number;
}): Promise<string[]> {
  try {
    const candidates = await questionBankRepository.findCandidates({
      type: params.type,
      difficulty: params.difficulty,
      role: params.role,
      techStacks: params.techStacks,
      coveredTopics: params.coveredTopics,
      limit: params.limit || 5,
    });

    if (candidates && candidates.length > 0) {
      // Asynchronously track usage
      const ids = candidates.map((c) => c._id.toString());
      questionBankRepository.incrementUsage(ids).catch(() => {});

      return candidates.map((c) => c.question);
    }
  } catch (error) {
    // Non-blocking fallback: if question bank query fails, LLM still generates freely
    console.warn("Question bank retrieval fallback:", error);
  }

  return [];
}
