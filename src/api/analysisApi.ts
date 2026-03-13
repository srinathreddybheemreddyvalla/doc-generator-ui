import { api } from "./client";

export const startAnalysis = async (projectId: string) => {
  const res = await api.post(`/analysis/${projectId}`);
  return res.data;
};

export const getAnalysisStatus = async (projectId: string) => {
  const res = await api.get(`/analysis/${projectId}`);
  return res.data;
};