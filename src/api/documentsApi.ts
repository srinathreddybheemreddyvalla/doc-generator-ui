import { api } from "./client";

/* Start document generation */
export const generateDocuments = async (projectId: string) => {
  const res = await api.post(`/documents/${projectId}`);
  return res.data;
};

/* Get generation status */
export const getDocumentStatus = async (projectId: string) => {
  const res = await api.get(`/documents/${projectId}`);
  return res.data;
};

/* Get PDF as Blob */
export const getDocumentBlob = async (projectId: string, type: string) => {
  const res = await api.get(
    `/documents/${projectId}/download/${type}`,
    {
      responseType: "blob",
    }
  );

  return res.data;
};