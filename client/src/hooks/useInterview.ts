import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createInterview,
  getInterviewDetails,
  getInterview,
  submitAnswer,
} from "@/api/interview.api";

export const useCreateInterview = () =>
  useMutation({
    mutationFn: createInterview,
  });

export const useInterviewDetails = (id: string) =>
  useQuery({
    queryKey: ["interview-details", id],
    queryFn: () => getInterviewDetails(id),
  });

export const useInterview = (id: string) =>
  useQuery({
    queryKey: ["interview", id],
    queryFn: () => getInterview(id),
    enabled: !!id,
  });

export const useSubmitAnswer = () =>
  useMutation({
    mutationFn: ({
      interviewId,
      data,
    }: {
      interviewId: string;
      data: {
        questionId: string;
        answer: string;
        responseTime: number;
      };
    }) => submitAnswer(interviewId, data),
  });
