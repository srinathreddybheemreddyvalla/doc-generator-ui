import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectCard } from '../components/ProjectCard';
import { clearProjectStatus } from '../utils/ProjectStatus';
import { getProjects, createProject, updateProject, deleteProject, Project } from '../api/projects';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const projectsPerPage = 3;

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const currentProjects = filteredProjects.slice(currentPage * projectsPerPage, (currentPage + 1) * projectsPerPage);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    // Reset to first page when searching
    setCurrentPage(0);
  }, [searchQuery]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    try {
      const created = await createProject(newProject);
      setProjects([created, ...projects]);
      setNewProject({ name: '', description: '' });
      setIsModalOpen(false);
      navigate(`/upload/${created.id}`);
    } catch (error) {
      console.error('Failed to create project', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.name.trim()) return;

    try {
      const updated = await updateProject(editingProject.id, editingProject);
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to update project', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        const updatedProjects = projects.filter(p => p.id !== id);
        setProjects(updatedProjects);
        
        // Adjust current page if it's now empty
        const newTotalPages = Math.ceil(updatedProjects.length / projectsPerPage);
        if (currentPage >= newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages - 1);
        }
        
        clearProjectStatus(id);
      } catch (error) {
        console.error('Failed to delete project', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="mx-auto max-w-7xl px-6 py-10 pb-24">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <p className="text-gray-500">Select a project to view or manage</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full sm:w-64 border border-gray-200 bg-white pl-10 pr-4 text-sm focus:border-[#007B65] focus:outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex h-10 cursor-pointer items-center gap-2 bg-[#007B65] px-4 text-sm font-medium text-white hover:bg-[#006654] transition-colors shadow-sm"
            >
              <Plus size={18} />
              New Project
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {currentProjects.map((project) => (
                <div key={project.id} className="h-full">
                  <ProjectCard 
                    {...project} 
                    onEdit={() => {
                      setEditingProject({ ...project });
                      setIsEditModalOpen(true);
                    }}
                    onDelete={() => handleDeleteProject(project.id)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredProjects.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-500">No projects found matching your search.</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all ${
                currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#007B65] hover:text-[#007B65]'
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                    currentPage === idx
                      ? 'bg-[#007B65] text-white shadow-md'
                      : 'bg-white border border-gray-200 text-gray-500 hover:border-[#007B65] hover:text-[#007B65]'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all ${
                currentPage === totalPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:border-[#007B65] hover:text-[#007B65]'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md  bg-white p-8 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Create New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <p className="mb-8 text-sm text-[#007B65]/70">
              Start a new documentation project by defining your project details below.
            </p>
            
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="mb-2 block text-base font-bold text-gray-900">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. System Audit 2026"
                  className="w-full  border-2 border-[#007B65]/30 px-4 py-3 text-sm focus:border-[#007B65] focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-bold text-gray-900">Description</label>
                <textarea
                  rows={4}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Describe the scope and goals..."
                  className="w-full  border border-gray-200 px-4 py-3 text-sm focus:border-[#007B65] focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="mt-10 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className=" border border-gray-200 px-8 py-2.5 text-base font-bold text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#007B65] px-8 py-2.5 text-base font-bold text-white hover:bg-[#006654]"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {isEditModalOpen && editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md  bg-white p-8 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Edit Project</h3>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingProject(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <p className="mb-8 text-sm text-[#007B65]/70">
              Update your project details below.
            </p>
            
            <form onSubmit={handleUpdateProject} className="space-y-6">
              <div>
                <label className="mb-2 block text-base font-bold text-gray-900">Project Name</label>
                <input
                  type="text"
                  required
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="e.g. System Audit 2026"
                  className="w-full  border-2 border-[#007B65]/30 px-4 py-3 text-sm focus:border-[#007B65] focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <div>
                <label className="mb-2 block text-base font-bold text-gray-900">Description</label>
                <textarea
                  rows={4}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Describe the scope and goals..."
                  className="w-full  border border-gray-200 px-4 py-3 text-sm focus:border-[#007B65] focus:outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="mt-10 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingProject(null);
                  }}
                  className=" border border-gray-200 px-8 py-2.5 text-base font-bold text-gray-900 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className=" bg-[#007B65] px-8 py-2.5 text-base font-bold text-white hover:bg-[#006654]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
