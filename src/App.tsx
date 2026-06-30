import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SaaSConfig } from './types';
import { PRESET_SAAS_CONFIGS } from './data';
import SaaSConfigurator from './components/SaaSConfigurator';
import SaaSBlueprintView from './components/SaaSBlueprintView';
import PrototypeSandbox from './components/PrototypeSandbox';
import { 
  Sparkles, 
  Terminal, 
  Map, 
  Layers, 
  HelpCircle,
  Clock,
  Compass,
  ArrowRight,
  ShieldAlert,
  Heart,
  BookOpen
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'sandbox' | 'configurator' | 'blueprint'>('sandbox');
  const [config, setConfig] = useState<SaaSConfig>(PRESET_SAAS_CONFIGS.general);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans antialiased selection:bg-indigo-900 selection:text-indigo-100 relative">
      
      {/* Decorative subtle ambient pattern header */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-950/20 via-purple-950/5 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative">
        
        {/* Header Branding Panel */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 accent-gradient text-white rounded-xl shadow-lg flex items-center justify-center">
                <Compass className="w-5.5 h-5.5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  VoiceDirections <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-semibold uppercase text-sm tracking-widest ml-1">SaaS Builder</span>
                </h1>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Interactive workspace for compiling build prompts, technical blueprints, and parsing prototype route vectors.
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation Toolbar */}
          <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800/80 shadow-lg flex gap-1">
            <button
              id="view-tab-sandbox"
              onClick={() => setActiveView('sandbox')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'sandbox'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Live Sandbox
            </button>
            <button
              id="view-tab-configurator"
              onClick={() => setActiveView('configurator')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'configurator'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> 1. Build Prompt Compiler
            </button>
            <button
              id="view-tab-blueprint"
              onClick={() => setActiveView('blueprint')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'blueprint'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> 2. Technical Blueprint
            </button>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main className="mb-10 min-h-[450px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {activeView === 'sandbox' && <PrototypeSandbox />}
              {activeView === 'configurator' && (
                <SaaSConfigurator config={config} onChange={(newConfig) => setConfig(newConfig)} />
              )}
              {activeView === 'blueprint' && <SaaSBlueprintView config={config} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Business Potential Overview Panels - Bento grid styled */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
          {/* Card 1 */}
          <div className="bento-card p-5 space-y-3 text-left hover:border-slate-700 transition-all group">
            <div className="w-9 h-9 bg-indigo-500/10 text-indigo-400 rounded-lg flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Industrial & Logistic Picking</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Parse verbal recordings from supervisors into logical warehouse coordinates. Guides workers through dynamic paths instantly, speeding up dispatch runs by 35%.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bento-card p-5 space-y-3 text-left hover:border-slate-700 transition-all group">
            <div className="w-9 h-9 bg-purple-500/10 text-purple-400 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Historical Tourism Speech</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Extract physical directions from guide voiceovers. Plot route waypoints onto custom map interfaces, creating instant self-guided tours with synchronized voice lines.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bento-card p-5 space-y-3 text-left hover:border-slate-700 transition-all group">
            <div className="w-9 h-9 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Map className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Property Guide VR Mappings</h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Allow realtors to map spacious physical listings by dictating voice memos as they walk. Automatically plots room coordinate grids and anchors annotations.
              </p>
            </div>
          </div>
        </section>

        {/* Simple Footnotes */}
        <footer className="mt-16 text-center text-[11px] text-slate-500 font-sans border-t border-slate-900 pt-6">
          <p>© 2026 VoiceDirections Pro. Engineered as a high-fidelity bento dashboard.</p>
        </footer>

      </div>
    </div>
  );
}
