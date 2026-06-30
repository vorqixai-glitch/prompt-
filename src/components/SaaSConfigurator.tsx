import { useState, useEffect } from 'react';
import { SaaSConfig } from '../types';
import { PRESET_SAAS_CONFIGS, buildPromptTemplate } from '../data';
import { 
  Sliders, 
  Sparkles, 
  Terminal, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw,
  FileText,
  Code,
  Server,
  Database,
  Map,
  Key
} from 'lucide-react';

interface SaaSConfiguratorProps {
  config: SaaSConfig;
  onChange: (newConfig: SaaSConfig) => void;
}

export default function SaaSConfigurator({ config, onChange }: SaaSConfiguratorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('general');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [newFeature, setNewFeature] = useState('');

  // Update prompt whenever config changes
  useEffect(() => {
    setGeneratedPrompt(buildPromptTemplate(config));
  }, [config]);

  const handlePresetChange = (presetKey: string) => {
    setSelectedPreset(presetKey);
    onChange(PRESET_SAAS_CONFIGS[presetKey]);
  };

  const updateConfigField = (field: keyof SaaSConfig, value: any) => {
    onChange({
      ...config,
      [field]: value
    });
  };

  const updatePricingField = (tier: 'free' | 'pro' | 'enterprise', field: 'price' | 'credits', value: number) => {
    onChange({
      ...config,
      pricingTiers: {
        ...config.pricingTiers,
        [tier]: {
          ...config.pricingTiers[tier],
          [field]: value
        }
      }
    });
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !config.extraFeatures.includes(newFeature.trim())) {
      updateConfigField('extraFeatures', [...config.extraFeatures, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    updateConfigField('extraFeatures', config.extraFeatures.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="saas-configurator">
      {/* Controls Form - 5 cols */}
      <div className="lg:col-span-5 space-y-6">
        {/* Preset Selector */}
        <div className="bento-card p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
            <Sliders className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="font-semibold text-white text-md">Quick Presets</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              id="preset-btn-general"
              onClick={() => handlePresetChange('general')}
              className={`p-3 rounded-xl text-center text-xs font-medium border transition-all ${
                selectedPreset === 'general'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm'
                  : 'bg-slate-800/20 border-slate-800/85 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              💼 General
            </button>
            <button
              id="preset-btn-realestate"
              onClick={() => handlePresetChange('realestate')}
              className={`p-3 rounded-xl text-center text-xs font-medium border transition-all ${
                selectedPreset === 'realestate'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm'
                  : 'bg-slate-800/20 border-slate-800/85 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              🏠 Real Estate
            </button>
            <button
              id="preset-btn-industrial"
              onClick={() => handlePresetChange('industrial')}
              className={`p-3 rounded-xl text-center text-xs font-medium border transition-all ${
                selectedPreset === 'industrial'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm'
                  : 'bg-slate-800/20 border-slate-800/85 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              🏭 Logistics
            </button>
          </div>
        </div>

        {/* Technical Stack configuration */}
        <div className="bento-card p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 mb-2 border-b border-slate-800 pb-2">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
            <h3 className="font-semibold text-white text-md">SaaS Spec Sheet</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Project Name</label>
              <input
                id="config-project-name"
                type="text"
                value={config.projectName}
                onChange={(e) => updateConfigField('projectName', e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Frontend</label>
                <select
                  id="config-frontend"
                  value={config.frontendStack}
                  onChange={(e) => updateConfigField('frontendStack', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="nextjs" className="bg-slate-900 text-white">Next.js 14</option>
                  <option value="react" className="bg-slate-900 text-white">React / Vite</option>
                  <option value="vue" className="bg-slate-900 text-white">Vue 3 / Nuxt</option>
                  <option value="flutter" className="bg-slate-900 text-white">Flutter App</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Backend</label>
                <select
                  id="config-backend"
                  value={config.backendStack}
                  onChange={(e) => updateConfigField('backendStack', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="node" className="bg-slate-900 text-white">Express TS</option>
                  <option value="python" className="bg-slate-900 text-white">FastAPI</option>
                  <option value="go" className="bg-slate-900 text-white">Golang Router</option>
                  <option value="rails" className="bg-slate-900 text-white">Ruby on Rails</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Database</label>
                <select
                  id="config-database"
                  value={config.database}
                  onChange={(e) => updateConfigField('database', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="postgres" className="bg-slate-900 text-white">PostgreSQL</option>
                  <option value="sqlite" className="bg-slate-900 text-white">SQLite</option>
                  <option value="firestore" className="bg-slate-900 text-white">Firestore</option>
                  <option value="mongodb" className="bg-slate-900 text-white">MongoDB</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">STT AI Engine</label>
                <select
                  id="config-stt"
                  value={config.sttEngine}
                  onChange={(e) => updateConfigField('sttEngine', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="whisper" className="bg-slate-900 text-white">OpenAI Whisper</option>
                  <option value="google-speech" className="bg-slate-900 text-white">Google Cloud Speech</option>
                  <option value="assemblyai" className="bg-slate-900 text-white">AssemblyAI</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Map Provider</label>
                <select
                  id="config-map"
                  value={config.mapProvider}
                  onChange={(e) => updateConfigField('mapProvider', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="google-maps" className="bg-slate-900 text-white">Google Maps</option>
                  <option value="leaflet" className="bg-slate-900 text-white">Leaflet.js</option>
                  <option value="mapbox" className="bg-slate-900 text-white">Mapbox GL</option>
                  <option value="vector-canvas" className="bg-slate-900 text-white">Custom SVG Canvas</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Auth Scheme</label>
                <select
                  id="config-auth"
                  value={config.authProvider}
                  onChange={(e) => updateConfigField('authProvider', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 text-slate-200 text-sm border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
                >
                  <option value="nextauth" className="bg-slate-900 text-white">NextAuth.js</option>
                  <option value="clerk" className="bg-slate-900 text-white">Clerk Auth</option>
                  <option value="supabase" className="bg-slate-900 text-white">Supabase Auth</option>
                  <option value="custom-jwt" className="bg-slate-900 text-white">Custom JWT</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing tiers credits */}
        <div className="bento-card p-6 space-y-4 shadow-lg">
          <h4 className="font-semibold text-white text-sm tracking-tight border-b border-slate-800 pb-2">SaaS Quotas & Billing Tiers</h4>
          <div className="space-y-3">
            {/* Free */}
            <div className="flex items-center gap-2 justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <span className="text-xs font-bold text-slate-400">Free</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-1">$</span>
                  <span className="text-xs font-medium text-slate-200">0</span>
                </div>
                <span className="text-slate-700">|</span>
                <input
                  id="free-credits-input"
                  type="number"
                  value={config.pricingTiers.free.credits}
                  onChange={(e) => updatePricingField('free', 'credits', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-indigo-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">ops/mo</span>
              </div>
            </div>

            {/* Pro */}
            <div className="flex items-center gap-2 justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <span className="text-xs font-bold text-indigo-400">Pro</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-1">$</span>
                  <input
                    id="pro-price-input"
                    type="number"
                    value={config.pricingTiers.pro.price}
                    onChange={(e) => updatePricingField('pro', 'price', parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 text-center bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-slate-200 focus:outline-none"
                  />
                </div>
                <span className="text-slate-700">|</span>
                <input
                  id="pro-credits-input"
                  type="number"
                  value={config.pricingTiers.pro.credits}
                  onChange={(e) => updatePricingField('pro', 'credits', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-indigo-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">ops/mo</span>
              </div>
            </div>

            {/* Enterprise */}
            <div className="flex items-center gap-2 justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <span className="text-xs font-bold text-amber-500">Enterprise</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <span className="text-xs text-slate-500 mr-1">$</span>
                  <input
                    id="enterprise-price-input"
                    type="number"
                    value={config.pricingTiers.enterprise.price}
                    onChange={(e) => updatePricingField('enterprise', 'price', parseInt(e.target.value) || 0)}
                    className="w-14 px-2 py-1 text-center bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-slate-200 focus:outline-none"
                  />
                </div>
                <span className="text-slate-700">|</span>
                <input
                  id="enterprise-credits-input"
                  type="number"
                  value={config.pricingTiers.enterprise.credits}
                  onChange={(e) => updatePricingField('enterprise', 'credits', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center bg-slate-900 border border-slate-800 rounded-md text-xs font-semibold text-indigo-400 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 font-semibold">ops/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature toggles */}
        <div className="bento-card p-6 space-y-4 shadow-lg">
          <h4 className="font-semibold text-white text-sm tracking-tight border-b border-slate-800 pb-2">Additional Bundled Features</h4>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                id="new-feature-input"
                type="text"
                placeholder="e.g. Offline Sync"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                className="flex-1 px-3 py-1.5 bg-slate-950 text-slate-200 text-xs border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
              />
              <button
                id="add-feature-btn"
                onClick={handleAddFeature}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            
            <div className="flex flex-wrap gap-1.5 pt-2">
              {config.extraFeatures.map((feat, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 text-indigo-400 text-[11px] font-medium rounded-lg border border-indigo-500/30"
                >
                  {feat}
                  <button
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compiled Prompt Output - 7 cols */}
      <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
        <div className="bento-card shadow-xl flex flex-col flex-1 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span className="font-mono text-xs text-indigo-300 font-bold uppercase tracking-wider">AI Build Prompt Compiler</span>
            </div>
            <button
              id="copy-prompt-btn"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Build Prompt'}
            </button>
          </div>

          {/* Prompt Body */}
          <div className="p-6 flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 max-h-[600px] leading-relaxed select-text bg-slate-950/40">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
              <p className="text-[11px] leading-relaxed">
                💡 <strong className="text-indigo-400">AI Prompt Engineer Instructions:</strong> Use this compiled build prompt to initialize your code agent in AI Studio or any workspace. It is automatically synchronized to reflect the architectural spec sheet configured on the left.
              </p>
            </div>
            <pre className="whitespace-pre-wrap select-text selection:bg-indigo-800 bg-transparent pr-2">{generatedPrompt}</pre>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Lines: {generatedPrompt.split('\n').length}</span>
            <span>Character Count: {generatedPrompt.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
