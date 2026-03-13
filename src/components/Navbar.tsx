import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-3">
      <Link to="/" className="flex items-center gap-4 cursor-pointer">
        
        <div className="flex h-10 w-10 items-center justify-center bg-[#E6F4F1] text-[#007B65]">
          <LayoutGrid size={24} />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-gray-900">
             Document Generator
          </h1>
          <p className="text-sm text-gray-500">
            GenAI-based Document Generator
          </p>
        </div>

      </Link>
    </nav>
  );
};