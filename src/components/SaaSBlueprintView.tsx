import React, { useState } from 'react';
import { SaaSConfig } from '../types';
import { SCHEMA_TABLES, SYSTEM_ARCH_STEPS, API_SPEC } from '../data';
import { 
  Server, 
  Database, 
  Terminal, 
  Layers, 
  CheckCircle, 
  ArrowRight,
  Send,
  Globe,
  GitBranch,
  Settings,
  Shield,
  CreditCard,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface SaaSBlueprintViewProps {
  config: SaaSConfig;
}

export default function SaaSBlueprintView({ config }: SaaSBlueprintViewProps) {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'api' | 'roadmap'>('architecture');
  const [selectedArchStep, setSelectedArchStep] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [mockResponse, setMockResponse] = useState<Record<string, string>>({});
  const [roadmapStatus, setRoadmapStatus] = useState<Record<string, boolean>>({
    "stt_worker": true,
    "db_setup": true,
    "auth_integration": false,
    "billing_checkout": false,
    "api_deployment": false,
  });

  const toggleRoadmapStatus = (key: string) => {
    setRoadmapStatus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const triggerApiMock = (path: string, fallbackJson: string) => {
    setMockResponse(prev => ({ ...prev, [path]: "Sending request..." }));
    setTimeout(() => {
      setMockResponse(prev => ({
        ...prev,
        [path]: fallbackJson
      }));
    }, 800);
  };

  return (
    <div className="bento-card p-6 shadow-xl" id="saas-blueprint-view">
      {/* Title & Stats bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5.5 h-5.5 text-indigo-400" />
            Interactive Blueprint Spec
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Engineered technical blueprints synchronized with <strong className="text-indigo-400 font-semibold">{config.projectName}</strong> specs.
          </p>
        </div>

        {/* Dynamic configuration status bar */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-semibold border border-indigo-500/20">
            <Globe className="w-3.5 h-3.5" /> Frontend: {config.frontendStack.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/20">
            <Server className="w-3.5 h-3.5" /> Backend: {config.backendStack.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-semibold border border-emerald-500/20">
            <Database className="w-3.5 h-3.5" /> DB: {config.database.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🌐 1. System Architecture
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'database'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🗄️ 2. Database Schema
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'api'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🔌 3. REST API Spec
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🚀 4. Launch Roadmap
        </button>
      </div>

      {/* Architecture Tab */}
      {activeTab === 'architecture' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          {/* Timeline - Left */}
          <div className="md:col-span-7 space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">End-to-End Media Pipeline</h4>
            <div className="space-y-2">
              {SYSTEM_ARCH_STEPS.map((step) => {
                const isSelected = step.id === selectedArchStep;
                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedArchStep(step.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/85 text-slate-300 hover:bg-slate-850'
                    }`}
                  >
                    <div className={`w-6.5 h-6.5 flex items-center justify-center rounded-lg text-xs font-bold font-mono shrink-0 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {step.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {step.title}
                        </span>
                        <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 ${isSelected ? 'transform rotate-90 text-indigo-400' : ''}`} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 block mt-0.5">{step.actor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details - Right */}
          <div className="md:col-span-5 flex flex-col h-full">
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800 space-y-4 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/25">
                Selected Stage Detail
              </span>
              
              {(() => {
                const step = SYSTEM_ARCH_STEPS.find(s => s.id === selectedArchStep);
                if (!step) return null;
                return (
                  <div className="space-y-4 text-left">
                    <h4 className="text-lg font-bold text-white">{step.title}</h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Sender/Receiver:</span>
                        <span className="text-indigo-400 font-medium">{step.actor}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Latency Factor:</span>
                        <span className="text-slate-200 font-medium">
                          {step.id <= 2 ? 'Low (<1s)' : step.id <= 4 ? 'Medium (5-15s)' : 'Varies by file length'}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Scaling Strategy:</span>
                        <span className="text-slate-200 font-medium">
                          {step.id === 3 ? 'K8s FFmpeg pods' : 'Serverless Cloud Runs'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900 p-4 rounded-xl border border-slate-800">
                      {step.description}
                    </p>
                    
                    {/* Visual schematic diagram of details */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 text-xs font-mono text-indigo-300">
                      <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase mb-2">
                        <Terminal className="w-3.5 h-3.5" /> Pipeline Data Event
                      </div>
                      {step.id === 1 && (
                        <span>GET /api/v1/jobs/upload ➔ PresignedS3Url ➔ PUT File to AWS S3 bucket</span>
                      )}
                      {step.id === 2 && (
                        <span>Queue.add('media-job', {'{'} mediaUrl, userId {'}'}, {'{'} attempts: 3 {'}'})</span>
                      )}
                      {step.id === 3 && (
                        <span>ffmpeg -i video.mp4 -vn -acodec pcm_s16le -ar 16000 audio_mono.wav</span>
                      )}
                      {step.id === 4 && (
                        <span>WhisperAPI.transcribe(audioFile) ➔ {'{'} segments: [...] {'}'} JSON metadata</span>
                      )}
                      {step.id === 5 && (
                        <span>GeminiClient.generate(segments, systemInstruction: "extract_directions")</span>
                      )}
                      {step.id === 6 && (
                        <span>ClientSide.render(waypointVectors) ➔ Draw SVG vector trace on Canvas</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
         {/* Database Schema Tab */}
        </div>
      )}

      {/* Database Schema Tab */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
          {/* Tables list */}
          <div className="md:col-span-4 space-y-2 text-left">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Relational Tables ({config.database})</h4>
            {SCHEMA_TABLES.map((table) => {
              const isSelected = table.name === selectedTable;
              return (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm font-semibold'
                      : 'bg-slate-950/40 border-slate-800/85 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-450" />
                    <span className="font-mono text-xs">{table.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              );
            })}
          </div>

          {/* Table Details */}
          <div className="md:col-span-8">
            {(() => {
              const table = SCHEMA_TABLES.find(t => t.name === selectedTable);
              if (!table) return null;
              return (
                <div className="border border-slate-800 rounded-2xl overflow-hidden text-left bg-slate-950/40 shadow-sm space-y-4 p-5">
                  <div>
                    <span className="text-[10px] font-mono uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 px-2 py-0.5 rounded-md font-bold">
                      SCHEMA DEFINITION
                    </span>
                    <h4 className="text-md font-bold text-white font-mono mt-2.5 flex items-center gap-1.5">
                      {table.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{table.description}</p>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-900">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-mono">
                          <th className="p-3 font-semibold">Column Name</th>
                          <th className="p-3 font-semibold">Type</th>
                          <th className="p-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                        {table.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-slate-850/50">
                            <td className="p-3 font-bold text-slate-100">{col.name}</td>
                            <td className="p-3 text-indigo-400 font-medium">
                              {col.type === "uuid (FK)" ? `uuid ➔ users.id` : col.type}
                            </td>
                            <td className="p-3 text-slate-400 font-sans text-xs">{col.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-indigo-300 border border-slate-850">
                    <div className="flex items-center gap-1 bg-slate-900 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-400 w-fit font-bold uppercase mb-3 border border-slate-800">
                      Drizzle ORM Definition schema.ts
                    </div>
                    {table.name === "users" && (
                      <pre className="text-[11px] overflow-x-auto">
{`export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash').notNull(),
  tier: varchar('tier', { length: 50 }).default('free'),
  creditsRemaining: integer('credits_remaining').default(5),
  createdAt: timestamp('created_at').defaultNow()
});`}
                      </pre>
                    )}
                    {table.name === "videos" && (
                      <pre className="text-[11px] overflow-x-auto">
{`export const videos = pgTable('videos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  filename: varchar('filename', { length: 255 }),
  storagePath: varchar('storage_path'),
  durationSeconds: integer('duration_seconds'),
  status: varchar('status').default('uploaded'),
  uploadedAt: timestamp('uploaded_at').defaultNow()
});`}
                      </pre>
                    )}
                    {table.name === "transcripts" && (
                      <pre className="text-[11px] overflow-x-auto">
{`export const transcripts = pgTable('transcripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: uuid('video_id').references(() => videos.id).unique(),
  fullText: text('full_text'),
  confidenceScore: decimal('confidence_score'),
  languageCode: varchar('language_code')
});`}
                      </pre>
                    )}
                    {table.name === "waypoints" && (
                      <pre className="text-[11px] overflow-x-auto">
{`export const waypoints = pgTable('waypoints', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoId: uuid('video_id').references(() => videos.id),
  stepNumber: integer('step_number'),
  instruction: text('instruction'),
  landmark: varchar('landmark'),
  distanceMeters: integer('distance_meters'),
  compassDirection: varchar('compass_direction'),
  coordX: integer('coord_x'),
  coordY: integer('coord_y')
});`}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* REST API Spec Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Base API URL: <strong className="text-indigo-400">https://api.voicedirections.com/v1</strong></span>
            <span>Authentication: Bearer JWT Token</span>
          </div>

          <div className="space-y-4">
            {API_SPEC.map((api) => (
              <div key={api.path} className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-hidden shadow-sm">
                {/* Accordion Header */}
                <div className="p-4 bg-slate-950/40 border-b border-slate-850 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg ${
                      api.method === "POST" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {api.method}
                    </span>
                    <span className="font-mono font-bold text-xs text-white">{api.path}</span>
                    <span className="text-slate-700">|</span>
                    <span className="text-xs text-slate-300 font-medium">{api.summary}</span>
                  </div>

                  <button
                    onClick={() => triggerApiMock(api.path, api.resBody)}
                    className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3 h-3" /> Test Endpoint
                  </button>
                </div>

                {/* API Specs body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Request */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Request Body</span>
                    <div className="p-4 bg-slate-950 text-slate-300 rounded-xl font-mono text-[11px] overflow-x-auto min-h-[110px] border border-slate-850">
                      <pre>{api.reqBody}</pre>
                    </div>
                  </div>

                  {/* Response */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Response Payload (200 OK)</span>
                    <div className="p-4 bg-slate-950 text-indigo-350 rounded-xl font-mono text-[11px] overflow-x-auto min-h-[110px] border border-slate-850">
                      {mockResponse[api.path] ? (
                        <pre className={mockResponse[api.path].startsWith("{") ? "text-emerald-400" : "text-yellow-400 animate-pulse"}>
                          {mockResponse[api.path]}
                        </pre>
                      ) : (
                        <span className="text-slate-500 italic">Click "Test Endpoint" to simulate server response...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div className="space-y-6 animate-fade-in text-left">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                <CheckCircleCircle className="w-4.5 h-4.5 text-indigo-400" /> MVP Launch Checklist
              </h4>
              <p className="text-xs text-slate-400">Track key features remaining to hit the public production server.</p>
            </div>
            
            <div className="w-full md:w-1/3 bg-slate-800 rounded-full h-2 overflow-hidden">
              {(() => {
                const total = Object.keys(roadmapStatus).length;
                const completed = Object.values(roadmapStatus).filter(Boolean).length;
                const percent = Math.round((completed / total) * 100);
                return (
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-500" 
                    style={{ width: `${percent}%` }} 
                  />
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-950/40">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Launch Pre-requisites</h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadmapStatus.stt_worker}
                    onChange={() => toggleRoadmapStatus('stt_worker')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Configure FFmpeg audio workers</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Integrate file listeners to auto-strip audio streams async.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadmapStatus.db_setup}
                    onChange={() => toggleRoadmapStatus('db_setup')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Deploy durable cloud database</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Execute ORM migrations for schemas.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadmapStatus.auth_integration}
                    onChange={() => toggleRoadmapStatus('auth_integration')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Hook up {config.authProvider}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Secure dashboard routes & secure cookie sessions.</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="border border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-950/40">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">Monetization & Scaling</h4>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadmapStatus.billing_checkout}
                    onChange={() => toggleRoadmapStatus('billing_checkout')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Configure Stripe checkout gateways</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Implement Pro (${config.pricingTiers.pro.price}/mo) and Enterprise webhook handlers.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roadmapStatus.api_deployment}
                    onChange={() => toggleRoadmapStatus('api_deployment')}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 mt-0.5 cursor-pointer accent-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Secure HTTPS REST domain & API key portal</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Setup API gateway rules to handle raw JSON exports smoothly.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper icon wrapper for standard Lucide missing icon issues
function CheckCircleCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
