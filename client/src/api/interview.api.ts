import { api } from "./axios";
import type {
  CreateInterviewRequest,
  CreateInterviewResponse,
} from "@/types/interview";

export const createInterview = async (data: CreateInterviewRequest) => {
  const res = await api.post<CreateInterviewResponse>("/interviews", data);

  return res.data;
};

export const getInterview = async (id: string) => {
  const res = await api.get(`/interviews/${id}`);
  return res.data;
};

export const submitAnswer = async (
  interviewId: string,
  data: {
    questionId: string;
    answer: string;
    responseTime: number;
  },
) => {
  const res = await api.post(`/interviews/${interviewId}/answer`, data);

  return res.data;
};

export const getInterviewReport = async (id: string) => {
  const res = await api.get(`/interviews/${id}/report`);
  return res.data;
};

export const getInterviewDetails = async (id: string) => {
  const res = await api.get(`/interviews/${id}/details`);
  return res.data;
};
