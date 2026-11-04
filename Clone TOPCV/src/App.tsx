import React from 'react';
import { CVProvider, useCV } from './context/CVContext';
import { Header } from './components/Header';
import { CVCanvas } from './components/CVCanvas';
import { AIAssistantSidebar } from './components/AIAssistantSidebar';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { CheckCircle2 } from 'lucide-react';

const CVAppContent: React.FC = () => {
  const { toastMessage } = useCV();

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f6] text-slate-800 antialiased selection:bg-sky-500/30 selection:text-slate-900">
      {/* Sleek MyCV-Style Floating Toolbar & Header */}
      <Header />

      {/* Main Workspace: Interactive CV Canvas on the Left, AI ATS Assistant on the Right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <CVCanvas />
        <AIAssistantSidebar />
      </div>

      {/* 12 ATS Templates Selection Modal */}
      <TemplateSelectorModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CVProvider>
      <CVAppContent />
    </CVProvider>
  );
};

export default App;
