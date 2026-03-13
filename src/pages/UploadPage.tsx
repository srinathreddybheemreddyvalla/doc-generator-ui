import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Home, Upload, Github, Lock, FileArchive, X, Loader2, FileText, CheckCircle } from 'lucide-react';
import { uploadZip, uploadGithub } from "../api/uploadApi";
import { startAnalysis, getAnalysisStatus } from "../api/analysisApi";
import { generateDocuments, getDocumentStatus } from "../api/documentsApi";
import { getProject, updateProject } from "../api/projects";
import { getProjectStatus, setProjectStatus, clearProjectStatus } from '../utils/ProjectStatus'; 


const ProgressStepper: React.FC<{ currentStage: number }> = ({ currentStage }) => {
  const stages = [
    { id: 1, name: 'Fetching Files', icon: <FileArchive size={18} /> },
    { id: 2, name: 'Summarizing Files', icon: <FileText size={18} /> },
    { id: 3, name: 'Generating Docs', icon: <FileText size={18} /> },
    { id: 4, name: 'Completed', icon: <CheckCircle size={18} /> },
  ];

  return (
    <div className="flex items-start justify-between mb-6">
      {stages.map((stage, idx) => {
        const isCompleted = currentStage > stage.id;
        const isActive = currentStage === stage.id;
        const isLast = idx === stages.length - 1;

        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 64 }}>
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#007B65] border-[#007B65] text-white'
                    : isActive
                    ? 'border-[#007B65] text-[#007B65] bg-white'
                    : 'border-gray-300 text-gray-400 bg-white'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle size={18} />
                ) : isActive ? (
                  <span className="animate-spin inline-flex"><Loader2 size={18} /></span>
                ) : (
                  stage.icon
                )}
              </div>
              <span
                className={`text-xs text-center leading-tight transition-colors duration-300 ${
                  isCompleted || isActive ? 'text-[#007B65] font-medium' : 'text-gray-400'
                }`}
              >
                {stage.name}
              </span>
            </div>

            {!isLast && (
              <div className="flex-1 mt-5 mx-1.5 h-0.5 bg-gray-200 relative overflow-hidden rounded-full">
                <div
                  className="absolute inset-y-0 left-0 bg-[#007B65] rounded-full transition-all duration-500"
                  style={{ width: currentStage > stage.id ? '100%' : '0%' }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const UploadPage: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadType, setUploadType] = useState<'zip' | 'git'>('zip');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gitUrl, setGitUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [token, setToken] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);

  // Ref to signal the polling loops to abort when the component unmounts
  // or the user navigates away (e.g. deletes the project while pipeline runs).
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false; 

    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    const loadProject = async () => {
      try {
        if (!projectId) return;
        const data = await getProject(projectId);
        setProject(data);
        
        // If project already has files uploaded, go to details page
        if (data.uploadType) {
          navigate(`/project/${projectId}`, { replace: true });
        }
      } catch (err) {
        console.error("Failed to load project", err);
      }
    };
    loadProject();
  }, [projectId, navigate]);

  
  useEffect(() => {
    if (!projectId) return;

    const saved = getProjectStatus(projectId);

    if (saved.status === 'completed') {
      navigate(`/project/${projectId}`, { replace: true });
      return;
    }

    if (saved.status === 'processing' && saved.stage > 0) {
      setCurrentStage(saved.stage);
      setIsAnalyzing(true);
      resumePipelineFrom(saved.stage);
    }
    
  }, [projectId]); 

 
  const persistStage = (stage: number, status: 'processing' | 'completed' | 'failed') => {
    setCurrentStage(stage);
    if (projectId) setProjectStatus(projectId, { stage, status });
  };

  // ─── Resume polling from a given stage (called when returning to page) ───
  const resumePipelineFrom = async (fromStage: number) => {
    try {
      if (fromStage <= 2) {
        // Still in analysis phase — keep polling analysis status
        persistStage(2, 'processing');
        let analysisDone = false;
        while (!analysisDone) {
          if (cancelledRef.current) return; // user navigated away
          const res = await getAnalysisStatus(projectId!);
          if (res.data.status === 'completed') {
            analysisDone = true;
          } else if (res.data.status === 'failed') {
            throw new Error('Analysis failed');
          } else {
            await new Promise(r => setTimeout(r, 3000));
          }
        }
        persistStage(3, 'processing');
        await generateDocuments(projectId!);
      }

      if (fromStage <= 3) {
    
        persistStage(3, 'processing');
        let docsDone = false;
        while (!docsDone) {
          if (cancelledRef.current) return; 
          const res = await getDocumentStatus(projectId!);
          if (res.data.status === 'completed') {
            docsDone = true;
          } else if (res.data.status === 'failed') {
            throw new Error('Document generation failed');
          } else {
            await new Promise(r => setTimeout(r, 4000));
          }
        }
      }

      if (cancelledRef.current) return;

      persistStage(4, 'completed');
      await new Promise(r => setTimeout(r, 500));
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      if (!cancelledRef.current) {
        if (projectId) setProjectStatus(projectId, { stage: 0, status: 'failed' });
        alert('Pipeline failed. Please try again.');
        setIsAnalyzing(false);
        setCurrentStage(0);
      }
    }
  };

  
  const handleAnalyze = async () => {
    if (uploadType === 'zip' && !selectedFile) {
      alert('Please select a ZIP file first.');
      return;
    }
    if (uploadType === 'git' && !gitUrl.trim()) {
      alert('Please enter a repository URL.');
      return;
    }

    try {
      setIsAnalyzing(true);
      persistStage(1, 'processing');

      if (uploadType === 'zip' && selectedFile) {
        await uploadZip(projectId!, selectedFile);
        // Store the zip file name in the project
        await updateProject(projectId!, { zipName: selectedFile.name });
      } else {
        await uploadGithub(projectId!, gitUrl, isPrivate ? token : undefined);
        // Store the git URL in the project
        await updateProject(projectId!, { gitUrl });
      }

      if (cancelledRef.current) return;
      persistStage(2, 'processing');

      await startAnalysis(projectId!);

      let analysisDone = false;
      while (!analysisDone) {
        if (cancelledRef.current) return;
        const res = await getAnalysisStatus(projectId!);
        if (res.data.status === 'completed') {
          analysisDone = true;
        } else if (res.data.status === 'failed') {
          throw new Error('Analysis failed');
        } else {
          await new Promise(r => setTimeout(r, 3000));
        }
      }

      if (cancelledRef.current) return;
      persistStage(3, 'processing');

      await generateDocuments(projectId!);

      let docsDone = false;
      while (!docsDone) {
        if (cancelledRef.current) return;
        const res = await getDocumentStatus(projectId!);
        if (res.data.status === 'completed') {
          docsDone = true;
        } else if (res.data.status === 'failed') {
          throw new Error('Document generation failed');
        } else {
          await new Promise(r => setTimeout(r, 4000));
        }
      }

      if (cancelledRef.current) return;

      persistStage(4, 'completed');
      await new Promise(r => setTimeout(r, 500));
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      if (!cancelledRef.current) {
        if (projectId) setProjectStatus(projectId, { stage: 0, status: 'failed' });
        alert('Pipeline failed. Please try again.');
      }
    } finally {
      if (!cancelledRef.current) {
        setIsAnalyzing(false);
        setCurrentStage(0);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please upload a .zip file.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else if (file) {
      alert('Please upload a .zip file.');
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#007B65]">
          <Home size={16} />
        </Link>
        <ChevronRight size={14} />
        <Link to={`/project/${projectId}`} className="hover:text-[#007B65]">
          {project?.name || 'Project'}
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-900">Source Input</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{project?.name}</h2>
            <p className="text-gray-500">{project?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400">Created {project?.createdAt}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <div className="border border-gray-200 bg-white p-8">
            <h3 className="mb-6 text-xl font-bold text-gray-900">Source Input</h3>

            <div className="mb-8 flex gap-4 border-b border-gray-100 pb-4">
              <button
                onClick={() => setUploadType('zip')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  uploadType === 'zip' ? 'text-[#007B65] border-b-2 border-[#007B65]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Upload size={18} />
                ZIP File
              </button>
              <button
                onClick={() => setUploadType('git')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                  uploadType === 'git' ? 'text-[#007B65] border-b-2 border-[#007B65]' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Github size={18} />
                Git Repository
              </button>
            </div>

            {/* ProgressStepper — shown only while analyzing */}
            {isAnalyzing && <ProgressStepper currentStage={currentStage} />}

            {uploadType === 'zip' ? (
              <div
                onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                onDragOver={(e) => !isAnalyzing && handleDragOver(e)}
                onDragLeave={() => !isAnalyzing && handleDragLeave()}
                onDrop={(e) => !isAnalyzing && handleDrop(e)}
                className={`flex flex-col items-center justify-center border-2 border-dashed py-12 transition-all ${
                  isAnalyzing ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
                } ${
                  isDragging ? 'border-[#007B65] bg-[#E6F4F1]/30' : 'border-gray-200 hover:border-[#007B65]/50 hover:bg-gray-50'
                }`}
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <FileArchive className="text-[#007B65]" size={48} />
                      {!isAnalyzing && (
                        <button
                          onClick={removeFile}
                          className="absolute -right-2 -top-2 bg-red-500 p-1 text-white shadow-sm hover:bg-red-600 transition-colors"
                          title="Remove file"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 text-gray-300" size={48} />
                    <p className="mb-2 text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400">Only .zip files are supported</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".zip"
                  disabled={isAnalyzing}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Repository URL</label>
                  <input
                    type="text"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="https://github.com/username/repo.git"
                    className="w-full border border-gray-200 px-4 py-2 text-sm focus:border-[#007B65] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#007B65] focus:ring-[#007B65]"
                  />
                  <label htmlFor="isPrivate" className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Lock size={14} />
                    Private Repository
                  </label>
                </div>
                {isPrivate && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Access Token</label>
                    <input
                      type="password"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter your personal access token"
                      className="w-full border border-gray-200 px-4 py-2 text-sm focus:border-[#007B65] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || (uploadType === 'zip' ? !selectedFile : !gitUrl.trim())}
                className={`flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white transition-all ${
                  isAnalyzing
                    ? 'bg-[#007B65]/70 cursor-wait'
                    : (uploadType === 'zip' ? selectedFile : gitUrl.trim())
                      ? 'bg-[#007B65] hover:bg-[#006654]'
                      : 'cursor-not-allowed bg-gray-300'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};