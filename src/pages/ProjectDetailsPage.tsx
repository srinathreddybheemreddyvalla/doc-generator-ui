import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Home, FileArchive, Github, FileText, ArrowRight, ExternalLink, Folder } from 'lucide-react';
import { getProject } from '../api/projects';
import { getAnalysisStatus } from '../api/analysisApi';
import { getDocumentStatus } from '../api/documentsApi';

export const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>('not_started');
  const [docStatus, setDocStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        if (!projectId) return;
        
        const [projectData, analysisRes, docRes] = await Promise.all([
          getProject(projectId),
          getAnalysisStatus(projectId).catch(() => ({ data: { status: 'not_started' } })),
          getDocumentStatus(projectId).catch(() => ({ data: { status: 'not_started', documents: {} } }))
        ]);

        console.log("Project Data loaded:", projectData);
        setProject(projectData);
        setAnalysisStatus(analysisRes.data?.status || 'not_started');
        setDocStatus(docRes.data || { status: 'not_started', documents: {} });
      } catch (err) {
        console.error("Failed to load project data", err);
      } finally {
        setLoading(false);
      }
    };
    loadProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#007B65] border-t-transparent"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
        <Link to="/" className="mt-4 inline-block text-[#007B65] hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-6 py-6 flex-1 overflow-y-auto">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#007B65]">
          <Home size={16} />
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-900">{project.name}</span>
      </nav>

      <div className="mb-3">
        <div className="border-b border-gray-100 pb-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{project.name}</h2>
          <p className="mt-0.5 text-xs text-gray-500 max-w-2xl">{project.description}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {/* Source Inputs Section */}
        <section className="bg-white border border-gray-200 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Folder className="text-[#007B65]" size={18} />
              Source Inputs
            </h3>
            <span className="rounded-full bg-[#E6F4F1] px-3 py-1 text-xs font-bold text-[#007B65] uppercase">
              {project.uploadType === 'zip' ? 'ZIP Archive' : project.uploadType === 'git' ? 'GitHub Repo' : 'No Input'}
            </span>
          </div>

          {project.uploadType === 'zip' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-sm border border-gray-100 bg-gray-50 p-3">
                <div className="flex h-10 w-10 items-center justify-center bg-white border border-gray-200 shadow-sm">
                  <FileArchive className="text-[#007B65]" size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">{project.zipName || 'source_files.zip'}</p>
                  <p className="text-xs text-gray-500">Original upload source</p>
                </div>
              </div>
            </div>
          ) : project.uploadType === 'git' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-sm border border-gray-100 bg-gray-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center bg-white border border-gray-200 shadow-sm">
                  <Github className="text-gray-900" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-900">Repository Link</p>
                  <a 
                    href={project.gitUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-0.5 flex items-center gap-1.5 text-xs text-[#007B65] hover:underline"
                  >
                    {project.gitUrl}
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center border-2 border-dashed border-gray-100 bg-gray-50/30">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Folder className="text-gray-400" size={24} />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No files uploaded yet</h4>
              <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                Please go to the Upload Page to add your project source files or connect a repository.
              </p>
              <button 
                onClick={() => navigate(`/upload/${projectId}`)}
                className="mt-3 inline-flex items-center gap-2 bg-[#007B65] px-6 py-2 text-xs font-bold text-white transition-all hover:bg-[#006654]"
              >
                Go to Upload Page
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Actions Card */}
          <div className="bg-white border border-gray-200 p-4 shadow-sm">
            <h3 className="mb-3 text-base font-bold flex items-center gap-2">
              <FileText size={18} className="text-[#007B65]" />
              Documentation
            </h3>
            <p className="mb-4 text-xs text-gray-500 leading-relaxed">
              Access the generated Functional and Technical specifications based on the source inputs provided.
            </p>
            
            <button
              onClick={() => navigate(`/selection/${projectId}`)}
              className="group flex w-full items-center justify-between border-2 border-[#007B65] bg-white px-4 py-3 text-xs font-bold text-[#007B65] transition-all hover:bg-[#007B65] hover:text-white"
            >
              <span>Generated Documents</span>
              <ArrowRight className="transition-transform group-hover:translate-x-1" size={16} />
            </button>

            <div className="mt-3 flex flex-col gap-2">
               <div className={`flex items-center gap-2 text-xs ${docStatus?.documents?.functional ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${docStatus?.documents?.functional ? 'bg-[#007B65]' : 'bg-gray-300'}`}></div>
                  <span>Functional {docStatus?.documents?.functional ? '✓' : '✗'}</span>
               </div>
               <div className={`flex items-center gap-2 text-xs ${docStatus?.documents?.technical ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${docStatus?.documents?.technical ? 'bg-[#007B65]' : 'bg-gray-300'}`}></div>
                  <span>Technical {docStatus?.documents?.technical ? '✓' : '✗'}</span>
               </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-gray-200 p-4 shadow-sm">
            <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Project Stats</h4>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-xs text-gray-500">Analysis Status</span>
                <span className={`text-xs font-bold capitalize ${analysisStatus === 'completed' ? 'text-[#007B65]' : 'text-orange-500'}`}>
                  {analysisStatus.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-500">Docs Generated</span>
                <span className="text-xs font-bold text-gray-900">
                  {Object.values(docStatus?.documents || {}).filter(Boolean).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
