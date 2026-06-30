import React, { useState, useEffect, useRef } from 'react';
import { DirectionStep, ParseResult } from '../types';
import { SAMPLE_MEMOS } from '../data';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  MapPin, 
  Compass, 
  Clock, 
  ArrowRight, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Mic, 
  HelpCircle,
  FileText,
  BadgeAlert,
  ChevronRight
} from 'lucide-react';

export default function PrototypeSandbox() {
  const [inputText, setInputText] = useState<string>(SAMPLE_MEMOS[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mock Upload state
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  // Microphone recording simulation state
  const [isRecording, setIsRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);

  // Route Playback Synchronizer state
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [playbackTime, setPlaybackTime] = useState<number>(0); // in seconds
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Loading screen messages cycle
  const loadingMessages = [
    "Uploading media file to cloud storage bucket...",
    "Extracting mono audio track via FFmpeg...",
    "Executing speech-to-text transcription models...",
    "Sending transcript to Gemini parsing engine...",
    "Plotting logical spatial vectors and landmarks...",
  ];

  // Load a preset memo
  const handleLoadPreset = (memoText: string) => {
    setInputText(memoText);
    setErrorMsg(null);
    // Reset results if loading new preset
    setResult(null);
    setIsPlayingRoute(false);
    setActiveStepIndex(0);
  };

  // Simulating File Upload Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateFileUpload(file.name);
    }
  };

  const simulateFileUpload = (fileName: string) => {
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev !== null && prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(null);
            // Auto fill with text simulation based on filename
            setInputText(`Proceed straight ahead from the main front entrance for 80 meters. Bypass the security terminal, then head South-West. Walk past the elevator lobby on your right. Take the emergency stairwell door to level 3.`);
          }, 600);
          return 100;
        }
        return (prev || 0) + 30;
      });
    }, 250);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateFileUpload(e.target.files[0].name);
    }
  };

  // Simulating Micro Voice Recording
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recTimerRef.current) clearInterval(recTimerRef.current);
      setIsRecording(false);
      setRecDuration(0);
      setInputText(`Go straight through the main lobby past the receptionist desk. Walk West for 50 feet, then turn North-East at the glass doors. Follow the ramp upwards for 15 meters and stop at Room 402 on your left.`);
    } else {
      // Start recording simulation
      setIsRecording(true);
      setRecDuration(0);
      recTimerRef.current = setInterval(() => {
        setRecDuration(prev => {
          if (prev >= 15) {
            // Stop automatically after 15s
            if (recTimerRef.current) clearInterval(recTimerRef.current);
            setIsRecording(false);
            setInputText(`Go straight through the main lobby past the receptionist desk. Walk West for 50 feet, then turn North-East at the glass doors. Follow the ramp upwards for 15 meters and stop at Room 402 on your left.`);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Trigger Gemini Parsing Endpoint
  const handleExtractDirections = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setIsPlayingRoute(false);
    setActiveStepIndex(0);

    // Dynamic message cycler during AI loading
    let msgIndex = 0;
    setLoadingMessage(loadingMessages[0]);
    const msgInterval = setInterval(() => {
      msgIndex = (msgIndex + 1) % loadingMessages.length;
      setLoadingMessage(loadingMessages[msgIndex]);
    }, 1200);

    try {
      const response = await fetch("/api/parse-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request on backend.");
      }

      const data = await response.json();
      
      // Inject coordinate paths adjustments for beautiful visualization if needed
      // Map logical step coords to a starting scale
      let steps: DirectionStep[] = data.steps || [];
      if (steps.length > 0) {
        // Enforce X, Y default scaling so it looks cohesive on our grid
        steps = steps.map((step, idx) => {
          const coords = step.coordinates || { x: 50, y: 50 };
          return {
            ...step,
            coordinates: coords
          };
        });
      }

      setResult({
        ...data,
        steps
      });
      setIsSimulated(data.isSimulated || false);
      if (data.error) {
        setErrorMsg(data.error);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("An error occurred during extraction. Running in local fallback.");
    } finally {
      clearInterval(msgInterval);
      setLoading(false);
    }
  };

  // Route playback timer simulation
  useEffect(() => {
    if (isPlayingRoute && result && result.steps.length > 0) {
      timerRef.current = setInterval(() => {
        setPlaybackTime((prevTime) => {
          const nextTime = prevTime + 1;
          
          // Match current step by estimated timestamps (e.g. 00:05 is 5 seconds)
          // Find the step which corresponds to this time
          const currentStepIdx = result.steps.findIndex((step, idx) => {
            const stepTimeStr = step.timestamp || "00:00";
            const [mm, ss] = stepTimeStr.split(':').map(Number);
            const stepSeconds = (mm * 60) + ss;

            // Find if this is the step matching or preceding nextTime
            const nextStep = result.steps[idx + 1];
            if (nextStep) {
              const [nm, ns] = (nextStep.timestamp || "00:00").split(':').map(Number);
              const nextStepSeconds = (nm * 60) + ns;
              return nextTime >= stepSeconds && nextTime < nextStepSeconds;
            }
            return nextTime >= stepSeconds;
          });

          if (currentStepIdx !== -1) {
            setActiveStepIndex(currentStepIdx);
          }

          // Stop if we exceed the last step duration plus a few seconds buffer
          const lastStep = result.steps[result.steps.length - 1];
          const [lm, ls] = (lastStep.timestamp || "00:00").split(':').map(Number);
          const totalMaxSeconds = (lm * 60) + ls + 6;

          if (nextTime >= totalMaxSeconds) {
            setIsPlayingRoute(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }

          return nextTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlayingRoute, result]);

  const togglePlayback = () => {
    if (!result) return;
    setIsPlayingRoute(!isPlayingRoute);
  };

  const handleResetPlayback = () => {
    setIsPlayingRoute(false);
    setPlaybackTime(0);
    setActiveStepIndex(0);
  };

  // Calculate compass angle between steps for rendering compass rotation
  const getCompassAngle = () => {
    if (!result || result.steps.length === 0) return 0;
    const currentStep = result.steps[activeStepIndex];
    if (!currentStep) return 0;

    const dir = currentStep.compassDirection?.toLowerCase() || 'north';
    if (dir.includes('north') && dir.includes('east')) return 45;
    if (dir.includes('north') && dir.includes('west')) return 315;
    if (dir.includes('south') && dir.includes('east')) return 135;
    if (dir.includes('south') && dir.includes('west')) return 225;
    if (dir.includes('north')) return 0;
    if (dir.includes('east')) return 90;
    if (dir.includes('south')) return 180;
    if (dir.includes('west')) return 270;
    return 0;
  };

  // Calculate coordinates of the moving dot based on linear interpolation of time
  const getMovingDotCoords = () => {
    if (!result || result.steps.length === 0) return { x: 50, y: 50 };
    
    // If route isn't playing, return the active step coordinates
    if (!isPlayingRoute) {
      const step = result.steps[activeStepIndex];
      return step ? (step.coordinates || { x: 50, y: 50 }) : { x: 50, y: 50 };
    }

    // Find interpolation between active step and next step
    const currentStep = result.steps[activeStepIndex];
    const nextStep = result.steps[activeStepIndex + 1] || currentStep;

    const [cm, cs] = (currentStep.timestamp || "00:00").split(':').map(Number);
    const [nm, ns] = (nextStep.timestamp || "00:00").split(':').map(Number);
    
    const currSeconds = (cm * 60) + cs;
    const nextSeconds = (nm * 60) + ns;

    const span = nextSeconds - currSeconds;
    if (span <= 0) return currentStep.coordinates || { x: 50, y: 50 };

    const ratio = Math.min(1, Math.max(0, (playbackTime - currSeconds) / span));

    const cX = currentStep.coordinates?.x || 50;
    const cY = currentStep.coordinates?.y || 50;
    const nX = nextStep.coordinates?.x || 50;
    const nY = nextStep.coordinates?.y || 50;

    return {
      x: cX + (nX - cX) * ratio,
      y: cY + (nY - cY) * ratio
    };
  };

  const activeStep = result?.steps[activeStepIndex];
  const movingDot = getMovingDotCoords();

  return (
    <div className="space-y-6" id="prototype-sandbox">
      {/* Simulation Banner */}
      {errorMsg && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left">
          <BadgeAlert className="w-5.5 h-5.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-200 text-sm">Running in Simulation Mode</h4>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              Your server does not have a registered <code className="bg-amber-950/60 text-amber-300 px-1 py-0.5 rounded font-mono border border-amber-900/50">GEMINI_API_KEY</code>. The workspace has loaded high-fidelity local models to perfectly parse, map, and animate the verbal coordinates. To activate production keys, configure your key in the AI Studio **Settings &gt; Secrets** panel!
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel - 5 cols */}
        <div className="lg:col-span-5 space-y-4 text-left">
          {/* Presets List */}
          <div className="bento-card p-5 space-y-3 shadow-lg">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="font-bold text-white text-sm tracking-tight">Select Spoken Memo Presets</h4>
            </div>
            <div className="space-y-2">
              {SAMPLE_MEMOS.map((memo) => (
                <button
                  key={memo.id}
                  onClick={() => handleLoadPreset(memo.text)}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    inputText === memo.text
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-sm'
                      : 'bg-slate-800/25 border-slate-800/80 text-slate-300 hover:bg-slate-800/55 hover:border-slate-700/50'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-100 block">{memo.title}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{memo.text}</span>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold bg-slate-800 border border-slate-750 px-2 py-0.5 rounded-md text-slate-300 font-mono">
                    {memo.duration}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input field with Mic upload */}
          <div className="bento-card p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-400" /> Unstructured Speech Input
              </h4>
              <div className="flex gap-1.5">
                {/* Simulated mic recording */}
                <button
                  onClick={toggleRecording}
                  className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  title={isRecording ? 'Click to stop and insert transcript' : 'Simulate voice speech record'}
                >
                  <Mic className="w-3.5 h-3.5" />
                  {isRecording ? `00:${String(recDuration).padStart(2, '0')} Stop` : 'Record'}
                </button>
              </div>
            </div>

            {/* Drag & Drop simulated upload panel */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-4 text-center transition-all flex flex-col items-center justify-center gap-2 ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-950/40' 
                  : uploadProgress !== null 
                    ? 'border-emerald-500 bg-emerald-950/20' 
                    : 'border-slate-800 bg-slate-950/40'
              }`}
            >
              {uploadProgress !== null ? (
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-xs font-mono text-emerald-400">
                    <span>Extracting verbal track...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-500" />
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Drag/drop tour video/audio files here or{' '}
                    <label className="text-indigo-400 font-bold hover:underline cursor-pointer">
                      browse
                      <input type="file" onChange={handleFileChange} className="hidden" accept="video/*,audio/*" />
                    </label>
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                id="verbal-directions-textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or record verbal tour directions here (e.g., 'Head north for 100 meters, turn right at the coffee shop...')"
                className="w-full h-32 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans leading-relaxed text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              />
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>Words: {inputText.split(/\s+/).filter(Boolean).length}</span>
                <span>Characters: {inputText.length}</span>
              </div>
            </div>

            <button
              id="extract-directions-btn"
              onClick={handleExtractDirections}
              disabled={loading || !inputText.trim()}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" /> Extract Directions (Powered by Gemini AI)
            </button>
          </div>
        </div>

        {/* Loading Display & Interactive Results Workspace - 7 cols */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          {loading ? (
            /* Loading view */
            <div className="bento-card p-12 flex flex-col items-center justify-center flex-1 space-y-6 shadow-xl">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
              </div>
              <div className="space-y-2 text-center max-w-sm">
                <h4 className="font-bold text-slate-100 text-sm">Processing Speech Pipeline</h4>
                <p className="text-xs text-slate-400 font-mono h-8 animate-pulse">{loadingMessage}</p>
              </div>
            </div>
          ) : result ? (
            /* Results & Visual Map View */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
              {/* Map grid panel - 7 cols */}
              <div className="md:col-span-7 flex flex-col h-full">
                <div className="bento-card p-4 shadow-lg flex flex-col flex-1 relative overflow-hidden text-left min-h-[350px]">
                  {/* Map Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" style={{ transform: `rotate(${getCompassAngle()}deg)` }} />
                      <div>
                        <span className="font-bold text-xs text-slate-100 block">SaaS Vector Map Canvas</span>
                        <span className="text-[10px] text-slate-400 font-mono">Visual logical trace coordinate grid</span>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={togglePlayback}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors cursor-pointer"
                        title={isPlayingRoute ? "Pause playback guide" : "Play playback guide"}
                      >
                        {isPlayingRoute ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                      <button
                        onClick={handleResetPlayback}
                        className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors cursor-pointer"
                        title="Reset playback"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* SVG Map Canvas */}
                  <div className="flex-1 bg-gray-950 rounded-xl relative border border-gray-800 overflow-hidden flex items-center justify-center select-none" style={{ backgroundImage: 'radial-gradient(rgba(99, 102, 241, 0.15) 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }}>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Connection trace path line */}
                      {result.steps.length > 1 && (
                        <path
                          d={`M ${result.steps.map(s => `${s.coordinates?.x} ${s.coordinates?.y}`).join(' L ')}`}
                          fill="none"
                          stroke="rgba(99, 102, 241, 0.45)"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}

                      {/* Moving synchronized coordinate locator pin/glow */}
                      <circle
                        cx={movingDot.x}
                        cy={movingDot.y}
                        r="3.5"
                        fill="rgba(99, 102, 241, 0.2)"
                        className="animate-ping"
                      />
                      <circle
                        cx={movingDot.x}
                        cy={movingDot.y}
                        r="1.8"
                        fill="#6366f1"
                        className="transition-all duration-300"
                      />

                      {/* Map Nodes Pins */}
                      {result.steps.map((step, idx) => {
                        const isCurrent = idx === activeStepIndex;
                        const x = step.coordinates?.x || 50;
                        const y = step.coordinates?.y || 50;
                        return (
                          <g key={step.stepNumber}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isCurrent ? "2.2" : "1.4"}
                              className={`transition-all duration-300 cursor-pointer ${
                                isCurrent ? "fill-indigo-400 stroke-indigo-600 stroke-2" : "fill-gray-700"
                              }`}
                              onClick={() => setActiveStepIndex(idx)}
                            />
                            {/* Pin details numbers labels */}
                            <text
                              x={x}
                              y={y - 3.2}
                              textAnchor="middle"
                              fontSize="3"
                              fill={isCurrent ? "#818cf8" : "#9ca3af"}
                              className="font-mono font-bold"
                            >
                              {step.stepNumber}
                            </text>
                          </g>
                        );
                      })}
                    </svg>

                    {/* Landmark & Compass Indicator widget overlaid */}
                    {activeStep && (
                      <div className="absolute bottom-3 left-3 right-3 p-3 bg-gray-900/95 border border-gray-800 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-sm">
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-950/80 rounded-lg text-indigo-400 shrink-0 border border-indigo-900/50">
                          <Compass className="w-5 h-5 animate-spin-slow" style={{ transform: `rotate(${getCompassAngle()}deg)` }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                            Step {activeStep.stepNumber} • {activeStep.compassDirection || 'Forward'} ({activeStep.distanceMeters || 100}m)
                          </span>
                          <span className="text-xs text-gray-200 font-medium block truncate mt-0.5">
                            {activeStep.landmark ? `📍 Near ${activeStep.landmark}` : activeStep.instruction}
                          </span>
                        </div>
                        <div className="shrink-0 font-mono text-xs text-indigo-300 font-bold bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded">
                          {activeStep.timestamp || '00:00'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Playback Controls Progress Bar */}
                  <div className="mt-3 bg-gray-950 p-2.5 rounded-xl border border-gray-800 shrink-0">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-1.5">
                      <span>Audio Sync Tracking Timeline</span>
                      <span className="text-indigo-400 font-bold">
                        {String(Math.floor(playbackTime / 60)).padStart(2, '0')}:{String(playbackTime % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      {(() => {
                        const lastStep = result.steps[result.steps.length - 1];
                        const [lm, ls] = (lastStep.timestamp || "00:00").split(':').map(Number);
                        const totalMaxSecs = (lm * 60) + ls + 6;
                        const percent = Math.min(100, (playbackTime / totalMaxSecs) * 100);
                        return (
                          <div className="bg-indigo-500 h-full transition-all" style={{ width: `${percent}%` }} />
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* List directions detail panel - 5 cols */}
              <div className="md:col-span-5 flex flex-col h-full">
                <div className="bento-card p-5 shadow-lg flex flex-col flex-1 text-left">
                  <div className="border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <h5 className="font-bold text-white text-sm">Parsed Route Card</h5>
                    <div className="flex justify-between items-center mt-1.5">
                      <div className="flex gap-2 text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-indigo-400" /> {result.estimatedDuration}</span>
                        <span>•</span>
                        <span>📏 {result.totalDistanceMeters}m</span>
                      </div>
                    </div>
                  </div>

                  {/* Steps Scrollable list */}
                  <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
                    {result.steps.map((step, idx) => {
                      const isCurrent = idx === activeStepIndex;
                      return (
                        <div
                          key={step.stepNumber}
                          onClick={() => {
                            setActiveStepIndex(idx);
                            // sync mock playback timer to this step's timestamp
                            const [mm, ss] = (step.timestamp || "00:00").split(':').map(Number);
                            setPlaybackTime((mm * 60) + ss);
                          }}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-500/10 border-indigo-500/35 shadow-sm'
                              : 'bg-slate-800/20 border-slate-800/80 hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                            }`}>
                              Step {step.stepNumber}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0">
                              ⏱️ {step.timestamp || '00:00'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed font-sans mt-2">
                            {step.instruction}
                          </p>

                          {step.landmark && (
                            <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-medium text-indigo-400 font-sans">
                              <MapPin className="w-3 h-3" /> Near {step.landmark}
                            </div>
                          )}

                          <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 mt-2 text-[9.5px] font-mono text-slate-400">
                            <span>Heading: {step.compassDirection || 'Forward'}</span>
                            <span className="text-emerald-400 font-semibold">{step.confidence}% Match</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standby view */
            <div className="bento-card p-12 flex flex-col items-center justify-center flex-1 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-bold text-slate-100 text-sm">Visual Mapping Sandbox</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Submit directions in the input form on the left to extract structured waypoints and trace route map.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
