import React from 'react';
import { FileArchive, FileText, CheckCircle, Loader } from 'lucide-react';

interface ProgressStepperProps {
  currentStage: number; 
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStage }) => {
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
            {/* Step */}
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
                  <span className="animate-spin"><Loader size={18} /></span>
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
