import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Send, 
  Download, 
  ExternalLink, 
  Globe, 
  Share2, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code2, 
  Eye, 
  Columns, 
  Zap, 
  Check, 
  Copy, 
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackCodeEditor,
  SandpackFileExplorer
} from '@codesandbox/sandpack-react';
import { UseAppContext } from '../context/AppContext';
import api from '../api/api';
import { exportProjectZip } from '../utils/exportProject';
import { detectDependencies } from '../utils/sandpackUtils';
import PricingModal from '../components/PricingModal';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment';

const BuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setUser, setIsUpgradeModalOpen } = UseAppContext();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'preview' | 'code'
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState('/App.js');

  const chatEndRef = useRef(null);

  // Load project
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        toast.error('Failed to load project details.');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProject();
  }, [id, navigate]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [project?.messages, isSending]);

  // Handle AI Chat instruction
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isSending) return;

    if (user?.credits !== undefined && user.credits <= 0) {
      toast.error('You are out of AI credits. Please upgrade your plan!');
      setIsUpgradeModalOpen(true);
      return;
    }

    const promptText = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    // Optimistic user message in UI
    const tempMessages = [
      ...(project.messages || []),
      { role: 'user', content: promptText, timestamp: new Date().toISOString() }
    ];
    setProject(prev => ({ ...prev, messages: tempMessages }));

    const toastId = toast.loading('Applying AI changes to website components...');

    try {
      const res = await api.post(`/api/projects/${id}/chat`, { prompt: promptText });
      setProject(res.data);
      if (user?.credits > 0) {
        setUser(prev => ({ ...prev, credits: prev.credits - 1 }));
      }
      toast.success('Website updated successfully!', { id: toastId });
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to update website.';
      toast.error(errorMsg, { id: toastId });
      if (err.response?.data?.needsUpgrade) {
        setIsUpgradeModalOpen(true);
      }
    } finally {
      setIsSending(false);
    }
  };

  // Toggle publish
  const handleTogglePublish = async () => {
    try {
      const res = await api.post(`/api/projects/${id}/publish`);
      setProject(prev => ({ ...prev, published: res.data.published }));
      toast.success(res.data.published ? 'Website published to web!' : 'Website changed to private draft.');
    } catch (err) {
      toast.error('Failed to update publish state.');
    }
  };

  // Copy share URL
  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/preview/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Public URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Export ZIP
  const handleExportZip = async () => {
    if (!project) return;
    toast.loading('Preparing React ZIP export...', { duration: 1500 });
    await exportProjectZip(project);
    toast.success('ZIP package downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-950 text-white font-sans">
        <div className="w-10 h-10 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-stone-400">Loading Ignited Minds Studio...</p>
      </div>
    );
  }

  if (!project) return null;

  // Prepare Sandpack files map
  const sandpackFiles = {
    '/public/index.html': {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name || 'Preview'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Urbanist', sans-serif; }
    </style>
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

  const quickPrompts = [
    "Make the color theme deep navy blue",
    "Add a customer contact form with email input",
    "Add a pricing discount badge",
    "Make the hero headline punchier"
  ];

  return (
    <div className="h-screen flex flex-col bg-stone-900 text-stone-100 font-sans overflow-hidden">
      <Toaster position="top-right" />
      <PricingModal />

      {/* Top Studio Navbar */}
      <header className="h-14 bg-stone-950 border-b border-stone-800 px-4 flex items-center justify-between shrink-0 z-30">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm tracking-tight text-white max-w-[200px] truncate">
              {project.name}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-400 font-semibold">
              v{project.version || 1}
            </span>
          </div>
        </div>

        {/* Center: Viewport & View Mode Switches */}
        <div className="hidden md:flex items-center gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          {/* View Mode Buttons */}
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'split' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Columns size={13} /> Split
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'preview' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye size={13} /> Preview
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
              viewMode === 'code' ? 'bg-stone-800 text-white shadow-xs' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Code2 size={13} /> Code
          </button>

          <div className="w-[1px] h-4 bg-stone-800 mx-1" />

          {/* Viewport Width Buttons */}
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Desktop View"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Tablet View (768px)"
          >
            <Tablet size={14} />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1.5 rounded-lg transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-stone-800 text-rose-400' : 'text-stone-400 hover:text-white'
            }`}
            title="Mobile View (375px)"
          >
            <Smartphone size={14} />
          </button>
        </div>

        {/* Right: Credits, Export, Publish */}
        <div className="flex items-center gap-2">
          {/* Credits Counter */}
          <button
            onClick={() => setIsUpgradeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
            title="Upgrade plan to add credits"
          >
            <Zap size={13} className="text-amber-400 fill-amber-400" />
            <span>{user?.credits ?? 20}</span>
          </button>

          {/* Export Code ZIP */}
          <button
            onClick={handleExportZip}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer border border-stone-700"
            title="Download full React project ZIP"
          >
            <Download size={13} /> Export ZIP
          </button>

          {/* Publish / Share Button */}
          <div className="flex items-center bg-stone-800 rounded-xl p-0.5 border border-stone-700 text-xs">
            <button
              onClick={handleTogglePublish}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                project.published
                  ? 'bg-emerald-600 text-white'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Globe size={13} />
              <span>{project.published ? 'Published' : 'Publish'}</span>
            </button>
            {project.published && (
              <button
                onClick={handleCopyShareLink}
                className="p-1 text-stone-400 hover:text-white rounded transition cursor-pointer"
                title="Copy Live URL"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            )}
          </div>

          {/* Open Fullscreen Live */}
          <button
            onClick={() => window.open(`/preview/${id}`, '_blank')}
            className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
            title="Open Fullscreen Preview"
          >
            <ExternalLink size={14} />
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: AI Copilot Chat */}
        {viewMode !== 'preview' && (
          <aside className={`flex flex-col bg-stone-950 border-r border-stone-800 transition-all duration-200 shrink-0 ${
            viewMode === 'code' ? 'w-80' : 'w-full md:w-[420px]'
          }`}>
            {/* Panel Header */}
            <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center font-bold text-xs">
                  <Sparkles size={13} />
                </div>
                <span className="text-xs font-bold text-stone-200 tracking-wide uppercase">AI Website Copilot</span>
              </div>
              <span className="text-[11px] text-stone-500 font-mono">Ignited Engine</span>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {(project.messages || []).map((msg, i) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={i}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-stone-400 font-medium">
                      <span>{isUser ? user?.name || 'You' : 'Ignited Minds AI'}</span>
                      <span>•</span>
                      <span>{moment(msg.timestamp).format('HH:mm')}</span>
                    </div>

                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-rose-600 text-white rounded-tr-none shadow-md'
                          : 'bg-stone-900 border border-stone-800 text-stone-200 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {isSending && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2 px-1 mb-1 text-[10px] text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>AI is updating your codebase...</span>
                  </div>
                  <div className="bg-stone-900 border border-stone-800 text-stone-300 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></span>
                    <span className="text-xs">Synthesizing React component updates...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="px-3 py-2 border-t border-stone-800/80 bg-stone-950/50 overflow-x-auto hide-scrollbar flex gap-2">
              {quickPrompts.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setChatInput(q)}
                  className="px-2.5 py-1 rounded-full text-[11px] bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 whitespace-nowrap transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-800 bg-stone-950">
              <div className="relative bg-stone-900 border border-stone-800 rounded-2xl p-2.5 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask AI to change layout, add components, change colors..."
                  rows={2}
                  className="w-full bg-transparent text-xs text-white placeholder:text-stone-500 outline-none resize-none leading-relaxed"
                  disabled={isSending}
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-500 flex items-center gap-1">
                    <Zap size={11} className="text-amber-500" /> 1 Credit
                  </span>
                  <button
                    type="submit"
                    disabled={isSending || !chatInput.trim()}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Send instruction"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </form>
          </aside>
        )}

        {/* Right Panel: Sandpack Live Runtime & Code Editor */}
        <main className="flex-1 flex flex-col bg-stone-900 relative overflow-hidden">
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
              ],
              activeFile: activeFile,
              visibleFiles: Object.keys(project.files || {}),
              recompileMode: "immediate",
              recompileDelay: 300,
            }}
          >
            <div className="h-full w-full flex items-center justify-center p-2 sm:p-4 bg-stone-950/60 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 bg-black flex flex-col ${
                  viewport === 'mobile'
                    ? 'w-[375px]'
                    : viewport === 'tablet'
                    ? 'w-[768px]'
                    : 'w-full'
                }`}
              >
                {viewMode === 'code' ? (
                  <div className="h-full w-full flex overflow-hidden">
                    <div className="w-52 border-r border-stone-800 bg-stone-950 overflow-y-auto">
                      <SandpackFileExplorer />
                    </div>
                    <div className="flex-1 h-full overflow-hidden">
                      <SandpackCodeEditor
                        showLineNumbers
                        showInlineErrors
                        wrapContent
                        closableTabs
                      />
                    </div>
                  </div>
                ) : (
                  <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton={true}
                    className="h-full w-full"
                  />
                )}
              </div>
            </div>
          </SandpackProvider>
        </main>
      </div>
    </div>
  );
};

export default BuilderPage;
