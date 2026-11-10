import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sparkles,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react';
import api from '../api/api';
import { exportProjectZip } from '../utils/exportProject';
import { detectDependencies } from '../utils/sandpackUtils';
import toast, { Toaster } from 'react-hot-toast';

const PreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState('desktop');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        setLoading(true);
        // Try public endpoint first; if forbidden or 404, fallback to standard project endpoint
        try {
          const res = await api.get(`/api/projects/public/${id}`);
          setProject(res.data);
          return;
        } catch (e) {
          // Fallback to authenticated project endpoint
          const authRes = await api.get(`/api/projects/${id}`);
          setProject(authRes.data);
        }
      } catch (err) {
        toast.error('This website is private or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchWebsite();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Share link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = async () => {
    if (!project) return;
    toast.loading('Preparing React ZIP package...', { duration: 1500 });
    await exportProjectZip(project);
    toast.success('Downloaded ZIP!');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-white font-sans">
        <div className="w-10 h-10 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-stone-400">Loading website preview...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-white font-sans p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Website Not Found</h2>
        <p className="text-sm text-stone-400 mb-6 max-w-md">
          This project may be private, unpublished, or the URL may be incorrect.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-xs transition"
        >
          Return to Ignited Minds
        </button>
      </div>
    );
  }

  const sandpackFiles = {
    '/public/index.html': {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name || 'Website Preview'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>body { font-family: 'Urbanist', sans-serif; }</style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
      hidden: true
    },
    ...project.files
  };

  const detectedDeps = detectDependencies(project.files);

  return (
    <div className="h-screen w-screen flex flex-col bg-stone-950 text-stone-100 font-sans overflow-hidden">
      <Toaster position="top-right" />

      {/* Floating Top Floating Bar */}
      <header className="h-14 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/80 px-4 flex items-center justify-between shrink-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/builder/${id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition border border-stone-800"
          >
            <ArrowLeft size={14} /> Back to Studio
          </button>
          <span className="font-bold text-xs text-stone-200 hidden sm:inline">{project.name}</span>
        </div>

        {/* Viewport Width Controls */}
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Desktop"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Tablet (768px)"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition border border-stone-800"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span className="hidden sm:inline">Share Link</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition border border-stone-800"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export ZIP</span>
          </button>

          <Link
            to="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition shadow-sm"
          >
            <Sparkles size={13} />
            <span>Built with Ignited Minds</span>
          </Link>
        </div>
      </header>

      {/* Live Sandpack Preview */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-stone-950 overflow-hidden">
        <SandpackProvider
          template="react"
          theme="dark"
          files={sandpackFiles}
          customSetup={{
            dependencies: {
              "lucide-react": "^0.475.0",
              ...detectedDeps,
            }
          }}
          options={{
            externalResources: [
              "https://cdn.tailwindcss.com"
            ]
          }}
        >
          <div
            className={`h-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-white ${
              viewport === 'mobile'
                ? 'w-[375px]'
                : viewport === 'tablet'
                ? 'w-[768px]'
                : 'w-full'
            }`}
          >
            <SandpackPreview
              showOpenInCodeSandbox={false}
              showRefreshButton={true}
              className="h-full w-full"
            />
          </div>
        </SandpackProvider>
      </main>
    </div>
  );
};

export default PreviewPage;
