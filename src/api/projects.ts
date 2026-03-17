
import { api } from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  functionalDocumentStatus?: string;
  technicalDocumentStatus?: string;
  uploadType?: string;
  uploadSourceName?: string;
  zipName?: string;
  gitUrl?: string;
}

export const mapProjectResponse = (item: any): Project => ({
  id: item.id,
  name: item.name,
  description: item.description,
  createdAt: item.created_at || item.createdAt,
  functionalDocumentStatus: item.functional_document_status || item.functionalDocumentStatus,
  technicalDocumentStatus: item.technical_document_status || item.technicalDocumentStatus,
  uploadType: item.upload_type || item.uploadType,
  uploadSourceName: item.upload_source_name || item.uploadSourceName,
  zipName: item.zipName || item.zip_name,
  gitUrl: item.gitUrl || item.git_url,
});

export const getProject = async (projectId: string): Promise<Project> => {
  const res = await api.get(`/projects/${projectId}`);
  return mapProjectResponse(res.data.data ? res.data.data : res.data);
};

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get('/projects');
  return (res.data.data || []).map(mapProjectResponse); 
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt' | 'functionalDocumentStatus' | 'technicalDocumentStatus'>) => {
  const res = await api.post('/projects', {
    ...project,
    upload_type: project.uploadType,
  });
  return mapProjectResponse(res.data.data ? res.data.data : res.data);
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  const res = await api.patch(`/projects/${id}`, project);
  return res.data.data;
};

export const deleteProject = async (id: string) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data.data;
};