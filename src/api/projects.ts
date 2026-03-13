
import { api } from './client';

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  uploadType?: string;
  zipName?: string;
  gitUrl?: string;
}
export const getProject = async (projectId: string) => {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
};

export const getProjects = async (): Promise<Project[]> => {
  const res = await api.get('/projects');
  return res.data.data; 
};

export const createProject = async (project: Omit<Project, 'id' | 'createdAt'>) => {
  const res = await api.post('/projects', project);
  return res.data.data;
};

export const updateProject = async (id: string, project: Partial<Project>) => {
  const res = await api.patch(`/projects/${id}`, project);
  return res.data.data;
};

export const deleteProject = async (id: string) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data.data;
};