export interface ProjectStatus {
  stage: number;
  status: 'processing' | 'completed' | 'failed';
}

export const getProjectStatus = (projectId: string): ProjectStatus => {
  const saved = localStorage.getItem(`project_status_${projectId}`);
  return saved ? JSON.parse(saved) : { stage: 0, status: 'processing' };
};

export const setProjectStatus = (projectId: string, status: ProjectStatus) => {
  localStorage.setItem(`project_status_${projectId}`, JSON.stringify(status));
};

export const clearProjectStatus = (projectId: string) => {
  localStorage.removeItem(`project_status_${projectId}`);
};
