import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, FileCode, Home, ChevronRight, ArrowLeft, ExternalLink, Download } from "lucide-react";
import {
  getDocumentStatus,
  getDocumentBlob,
} from "../api/documentsApi";

export const SelectionPage = () => {
  const { projectId } = useParams();

  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /* Load document status once */
  useEffect(() => {
    if (!projectId) return;

    const fetchStatus = async () => {
      try {
        const res = await getDocumentStatus(projectId);
        setStatus(res.data);
      } catch (err) {
        console.error("Failed to fetch document status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [projectId]);

  /* Preview PDF */
  const preview = async (type: string) => {
    try {
      const blob = await getDocumentBlob(projectId!, type);
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error("Preview failed", err);
      alert("Failed to preview document");
    }
  };

  /* Download PDF */
  const download = async (type: string) => {
    try {
      const blob = await getDocumentBlob(projectId!, type);
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}_specification.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download document");
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Breadcrumbs */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500">
        <Link to="/" className="hover:text-[#007B65]">
          <Home size={16} />
        </Link>
        <ChevronRight size={14} />
        <Link to={`/project/${projectId}`} className="hover:text-[#007B65]">
          Project Details
        </Link>
        <ChevronRight size={14} />
        <span className="font-medium text-gray-900">Generated Documents</span>
      </nav>

      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Generated Documents
        </h1>
        <Link 
          to={`/project/${projectId}`}
          className="flex items-center gap-2 text-sm font-bold text-[#007B65] hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Project Details
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Technical Document */}
        <div className="bg-white border border-[#E5E7EB] p-6">

          <div className="flex items-start justify-between mb-4">

            <div className="flex items-center justify-center w-12 h-12 bg-[#E6F4F1]">
              <FileCode className="text-[#008966]" size={22} />
            </div>

            {status?.documents?.technical && (
              <span className="text-xs border border-gray-300 px-3 py-1 text-gray-600">
                ✓ Ready
              </span>
            )}

          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Technical Specification
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Architecture, modules, API structure and technical specifications extracted from the legacy system.
          </p>

          {status?.documents?.technical ? (
            <div className="flex gap-3">

              <button
                onClick={() => preview("technical")}
                className="flex flex-1 items-center justify-center gap-2 cursor-pointer border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink size={16} />
                Preview
              </button>

              <button
                onClick={() => download("technical")}
                className="flex flex-1 items-center justify-center gap-2 cursor-pointer bg-[#008966] text-white px-4 py-2 text-sm hover:bg-[#007a5c]"
              >
                <Download size={16} />
                Download
              </button>

            </div>
          ) : (
            <p className="text-gray-500 text-sm">Generating...</p>
          )}

        </div>

        {/* Functional Document */}
        <div className="bg-white border border-[#E5E7EB] p-6">

          <div className="flex items-start justify-between mb-4">

            <div className="flex items-center justify-center w-12 h-12 bg-[#E6F4F1]">
              <BookOpen className="text-[#008966]" size={22} />
            </div>

            {status?.documents?.functional && (
              <span className="text-xs border border-gray-300 px-3 py-1 text-gray-600">
                ✓ Ready
              </span>
            )}

          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Functional Specification
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Business logic, workflows and functional rules extracted from the legacy source code.
          </p>

          {status?.documents?.functional ? (
            <div className="flex gap-3">

              <button
                onClick={() => preview("functional")}
                className="flex flex-1 items-center justify-center gap-2 cursor-pointer border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink size={16} />
                Preview
              </button>

              <button
                onClick={() => download("functional")}
                className="flex flex-1 items-center justify-center gap-2 cursor-pointer bg-[#008966] text-white px-4 py-2 text-sm hover:bg-[#007a5c]"
              >
                <Download size={16} />
                Download
              </button>

            </div>
          ) : (
            <p className="text-gray-500 text-sm">Generating...</p>
          )}

        </div>

      </div>
    </div>
  );
};