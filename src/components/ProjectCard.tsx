import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProjectStatus } from '../utils/ProjectStatus';

interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  createdAt?: string;
  created_at?: string; // Fallback for raw backend data
  uploadType?: string | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  name,
  description,
  createdAt,
  created_at,
  uploadType,
  onEdit,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCardClick = () => {
    const status = getProjectStatus(id);
    // If it's a new project (no uploadType) or it's currently processing, go to upload
    if (!uploadType || (status.status === 'processing' && status.stage > 0)) {
      navigate(`/upload/${id}`);
    } else {
      navigate(`/project/${id}`);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const projectStatus = getProjectStatus(id);
  const isReady = projectStatus.status === 'completed';
  const isProcessing = projectStatus.status === 'processing' && projectStatus.stage > 0;

  const displayDate = createdAt || created_at;

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex h-[280px] cursor-pointer flex-col rounded-sm border border-gray-200 bg-white p-6 transition-all hover:border-[#007B65] hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="truncate text-xl font-bold text-gray-900" title={name}>{name}</h3>
            {isReady && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wider border border-emerald-100">
                Ready
              </span>
            )}
            {isProcessing && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 uppercase tracking-wider border border-amber-100 animate-pulse">
                Processing
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Created on {formatDate(displayDate)}</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={handleMenuClick}
            className="text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-sm border border-gray-100 bg-white py-1 shadow-lg">
              <button 
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onEdit?.();
                }}
              >
                <Pencil size={16} className="text-gray-500" />
                <span>Edit Project</span>
              </button>
              <button 
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-gray-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onDelete?.();
                }}
              >
                <Trash2 size={16} className="text-red-500" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 flex-grow overflow-hidden">
        <p className="line-clamp-3 text-sm text-gray-600">{description}</p>
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4 flex justify-end">
        <ArrowRight className="text-gray-300 transition-colors group-hover:text-[#007B65]" size={20} />
      </div>
    </div>
  );
};
