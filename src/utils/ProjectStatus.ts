import { Project } from '../api/projects';

export const isProjectCompleted = (project: Project): boolean => {
  return (
    project.functionalDocumentStatus === 'completed' &&
    project.technicalDocumentStatus === 'completed'
  );
};

// Kept for backward compatibility if any modules still import it, but it does nothing
export const clearProjectStatus = (projectId: string) => {
  localStorage.removeItem(`project_status_${projectId}`);
};
