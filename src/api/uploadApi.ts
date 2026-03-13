import { api } from "./client";

export const uploadZip = async (projectId: string, file: File) => {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post(`/upload/${projectId}/zip`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const uploadGithub = async (
  projectId: string,
  github_url: string,
  pat_token?: string
) => {
  const res = await api.post(`/upload/${projectId}/github`, {
    github_url,
    pat_token,
  });

  return res.data;
};