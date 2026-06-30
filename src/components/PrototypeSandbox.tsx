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
  ChevronRight,
  Globe,
  Languages
} from 'lucide-react';

export default function PrototypeSandbox() {
  const [inputText, setInputText] = useState<string>(SAMPLE_MEMOS[0].text);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Language selectors state
  const [selectedSourceLang, setSelectedSourceLang] = useState<string>('auto');
  const [selectedOutputLang, setSelectedOutputLang] = useState<string>('same');

  // Interactive transcription flow states
  const [transcriptionStage, setTranscriptionStage] = useState<'idle' | 'transcribing' | 'ready' | 'analyzing'>('idle');
  const [transcribedText, setTranscribedText] = useState<string>('');

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
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Loading screen messages cycle
  const loadingMessages = [
    "Uploading media file to cloud storage bucket...",
    "Extracting mono audio track via FFmpeg...",
    "Executing speech-to-text transcription models...",
    "Sending transcript to Gemini parsing engine...",
    "Plotting logical spatial vectors and landmarks...",
  ];

  // Map and result localization strings
  const uiTranslations: Record<string, Record<string, string>> = {
    en: {
      routeCard: 'Parsed Route Card',
      duration: 'Duration',
      distance: 'Distance',
      step: 'Step',
      heading: 'Heading',
      match: 'Match',
      mapCanvas: 'SaaS Vector Map Canvas',
      traceGrid: 'Visual logical trace coordinate grid',
      timeline: 'Audio Sync Tracking Timeline',
      landmarkNear: 'Near'
    },
    es: {
      routeCard: 'Mapa de Ruta Analizado',
      duration: 'Duración',
      distance: 'Distancia',
      step: 'Paso',
      heading: 'Rumbo',
      match: 'Coincidencia',
      mapCanvas: 'Lienzo de Mapa Vectorial',
      traceGrid: 'Cuadrícula de trazas lógicas de coordenadas',
      timeline: 'Línea de Tiempo Sincronizada de Audio',
      landmarkNear: 'Cerca de'
    },
    fr: {
      routeCard: 'Carte de Route Analysée',
      duration: 'Durée',
      distance: 'Distance',
      step: 'Étape',
      heading: 'Direction',
      match: 'Précision',
      mapCanvas: 'Canevas de Carte Vectorielle',
      traceGrid: 'Grille de coordonnées logiques',
      timeline: 'Timeline de Suivi Audio',
      landmarkNear: 'Près de'
    },
    de: {
      routeCard: 'Analysierte Routenkarte',
      duration: 'Dauer',
      distance: 'Distanz',
      step: 'Schritt',
      heading: 'Richtung',
      match: 'Übereinstimmung',
      mapCanvas: 'SaaS-Vektorkartenvorlage',
      traceGrid: 'Visuelles logisches Koordinatengitter',
      timeline: 'Audio-Synchronisations-Timeline',
      landmarkNear: 'In der Nähe von'
    },
    it: {
      routeCard: 'Mappa del Percorso Analizzata',
      duration: 'Durata',
      distance: 'Distanza',
      step: 'Passo',
      heading: 'Direzione',
      match: 'Corrispondenza',
      mapCanvas: 'Mappa Vettoriale SaaS',
      traceGrid: 'Griglia logica di coordinate',
      timeline: 'Timeline Sincronizzazione Audio',
      landmarkNear: 'Vicino a'
    }
  };

  const getActiveLangCode = () => {
    if (result && result.outputLanguage) {
      return result.outputLanguage;
    }
    return selectedOutputLang === 'same' ? 'en' : selectedOutputLang;
  };

  const activeLangCode = getActiveLangCode();
  const t = uiTranslations[activeLangCode] || uiTranslations['en'];

  // Word-by-word streaming typing simulator
  const startSTTTranscription = (targetText: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setTranscriptionStage('transcribing');
    setTranscribedText('');
    setInputText('');
    setErrorMsg(null);
    setResult(null);
    setIsPlayingRoute(false);
    setActiveStepIndex(0);

    const words = targetText.split(/\s+/).filter(Boolean);
    let currentWordIndex = 0;
    let accumulatedText = '';

    typingTimerRef.current = setInterval(() => {
      if (currentWordIndex < words.length) {
        accumulatedText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
        setTranscribedText(accumulatedText);
        setInputText(accumulatedText); // editable input text is updated dynamically too
        currentWordIndex++;
      } else {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setTranscriptionStage('ready');
      }
    }, 45); // highly realistic and ultra-responsive word-by-word stream
  };

  // Load a preset memo and auto-trigger speech-to-text typing stream simulation
  const handleLoadPreset = (memoText: string) => {
    startSTTTranscription(memoText);
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
            // Autofill with language-appropriate tour speech simulation based on preset languages
            let textToTranscribe = `Proceed straight ahead from the main front entrance for 80 meters. Bypass the security terminal, then head South-West. Walk past the elevator lobby on your right. Take the emergency stairwell door to level 3.`;
            if (selectedSourceLang === 'es') {
              textToTranscribe = `Comience en la entrada norte del museo. Camine recto hacia el Sur por cien metros pasando la fuente de agua. Gire a la izquierda frente a la estatua de mármol y camine cincuenta metros hacia el Este para ingresar a la sala de exposiciones.`;
            } else if (selectedSourceLang === 'fr') {
              textToTranscribe = `Démarrez à l'accueil du musée historique. Allez tout droit vers le Nord sur 120 mètres. Vous verrez une grande fontaine sur votre gauche. Tournez vers l'Est et marchez 80 mètres le long de l'allée en pierre.`;
            }
            startSTTTranscription(textToTranscribe);
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
      let textToTranscribe = `Go straight through the main lobby past the receptionist desk. Walk West for 50 feet, then turn North-East at the glass doors. Follow the ramp upwards for 15 meters and stop at Room 402 on your left.`;
      if (selectedSourceLang === 'es') {
        textToTranscribe = `Comience en la entrada norte del museo. Camine recto hacia el Sur por cien metros pasando la fuente de agua. Gire a la izquierda frente a la estatua de mármol y camine cincuenta metros hacia el Este para ingresar a la sala de exposiciones.`;
      } else if (selectedSourceLang === 'fr') {
        textToTranscribe = `Démarrez à l'accueil du musée historique. Allez tout droit vers le Nord sur 120 mètres. Vous verrez une grande fontaine sur votre gauche. Tournez vers l'Est et marchez 80 mètres le long de l'allée en pierre.`;
      }
      startSTTTranscription(textToTranscribe);
    } else {
      // Start recording simulation
      setIsRecording(true);
      setRecDuration(0);
      recTimerRef.current = setInterval(() => {
        setRecDuration(prev => {
          if (prev >= 6) {
            // Stop automatically after 6s
            if (recTimerRef.current) clearInterval(recTimerRef.current);
            setIsRecording(false);
            let textToTranscribe = `Go straight through the main lobby past the receptionist desk. Walk West for 50 feet, then turn North-East at the glass doors. Follow the ramp upwards for 15 meters and stop at Room 402 on your left.`;
            if (selectedSourceLang === 'es') {
              textToTranscribe = `Comience en la entrada norte del museo. Camine recto hacia el Sur por cien metros pasando la fuente de agua. Gire a la izquierda frente a la estatua de mármol y camine cincuenta metros hacia el Este para ingresar a la sala de exposiciones.`;
            } else if (selectedSourceLang === 'fr') {
              textToTranscribe = `Démarrez à l'accueil du musée historique. Allez tout droit vers le Nord sur 120 mètres. Vous verrez une grande fontaine sur votre gauche. Tournez vers l'Est et marchez 80 mètres le long de l'allée en pierre.`;
            }
            startSTTTranscription(textToTranscribe);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  // Trigger Gemini Parsing Endpoint with language params
  const handleExtractDirections = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    setTranscriptionStage('analyzing');
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
        body: JSON.stringify({ 
          text: inputText,
          sourceLanguage: selectedSourceLang,
          outputLanguage: selectedOutputLang
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process request on backend.");
      }

      const data = await response.json();
      
      // Inject coordinate paths adjustments for beautiful visualization if needed
      let steps: DirectionStep[] = data.steps || [];
      if (steps.length > 0) {
        steps = steps.map((step) => {
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
          
          const currentStepIdx = result.steps.findIndex((step, idx) => {
            const stepTimeStr = step.timestamp || "00:00";
            const [mm, ss] = stepTimeStr.split(':').map(Number);
            const stepSeconds = (mm * 60) + ss;

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
    if (dir.includes('norte') || dir.includes('nord') || dir.includes('norden')) return 0;
    if (dir.includes('este') || dir.includes('est') || dir.includes('osten')) return 90;
    if (dir.includes('sur') || dir.includes('sud') || dir.includes('süden')) return 180;
    if (dir.includes('oeste') || dir.includes('ouest') || dir.includes('westen') || dir.includes('ovest')) return 270;
    
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
    
    if (!isPlayingRoute) {
      const step = result.steps[activeStepIndex];
      return step ? (step.coordinates || { x: 50, y: 50 }) : { x: 50, y: 50 };
    }

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

  // Clear typed stream and reset back to standby
  const handleResetStage = () => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    setTranscriptionStage('idle');
    setTranscribedText('');
    setInputText('');
    setResult(null);
  };

  return (
    <div className="space-y-6" id="prototype-sandbox">
      {/* Simulation Banner */}
      {errorMsg && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left">
          <BadgeAlert className="w-5.5 h-5.5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-amber-200 text-sm">Running in Simulation Mode</h4>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              Your server does not have a registered <code className="bg-amber-950/60 text-amber-300 px-1 py-0.5 rounded font-mono border border-amber-900/50">GEMINI_API_KEY</code>. The workspace has loaded high-fidelity local models to perfectly parse, map, translate, and animate the verbal coordinates. To activate production keys, configure your key in the AI Studio **Settings &gt; Secrets** panel!
            </p>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Panel - 5 cols */}
        <div className="lg:col-span-5 space-y-4 text-left">
          
          {/* Multilingual Settings Configuration */}
          <div className="bento-card p-5 space-y-4 shadow-lg border border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-15">
              <Languages className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4.5 h-4.5 text-indigo-400" />
              <h4 className="font-bold text-white text-sm tracking-tight">Multilingual Language Pipeline</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-semibold text-slate-400 block">Spoken Input Language</label>
                <select
                  id="source-language-select"
                  value={selectedSourceLang}
                  onChange={(e) => setSelectedSourceLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-sans"
                >
                  <option value="auto">🌎 Auto-Detect Spoken</option>
                  <option value="en">English</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="it">Italiano (Italian)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10.5px] font-semibold text-slate-400 block">Output Result Language</label>
                <select
                  id="output-language-select"
                  value={selectedOutputLang}
                  onChange={(e) => setSelectedOutputLang(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-2.5 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer font-sans"
                >
                  <option value="same">🌐 Same as Spoken</option>
                  <option value="en">English</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                  <option value="it">Italiano (Italian)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Presets List */}
          <div className="bento-card p-5 space-y-3 shadow-lg border border-slate-800/80">
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
                      ? 'bg-indigo-500/10 border-indigo-500/35 text-white shadow-sm'
                      : 'bg-slate-800/25 border-slate-800/80 text-slate-300 hover:bg-slate-800/55 hover:border-slate-700/50'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="font-bold text-slate-100 block truncate">{memo.title}</span>
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
          <div className="bento-card p-5 space-y-4 shadow-lg border border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm tracking-tight flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-400" /> Speech & Ingestion Deck
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
                  {isRecording ? `00:${String(recDuration).padStart(2, '0')} Stop` : 'Record Speech'}
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
                    <span>Extracting audio track...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-500 animate-pulse" />
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Drag & drop physical video/audio guides here or{' '}
                    <label className="text-indigo-400 font-bold hover:underline cursor-pointer">
                      browse local
                      <input type="file" onChange={handleFileChange} className="hidden" accept="video/*,audio/*" />
                    </label>
                  </p>
                </>
              )}
            </div>

            {/* Live Streaming Speech-to-Text Transcription Visualizer */}
            {transcriptionStage === 'transcribing' && (
              <div className="bg-indigo-950/25 border border-indigo-500/25 rounded-xl p-4 space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <Mic className="w-3.5 h-3.5 animate-ping text-indigo-400" /> Live Speech-to-Text Active
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono">STT stream...</span>
                </div>
                
                {/* Live pulsating waveform equalizer */}
                <div className="flex gap-1 h-6 items-center justify-center py-1">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1 bg-indigo-500 rounded-full animate-pulse" 
                      style={{ 
                        height: `${15 + (i % 4 === 0 ? 70 : i % 4 === 1 ? 40 : i % 4 === 2 ? 80 : 25)}%`,
                        animationDelay: `${i * 60}ms`,
                        animationDuration: '0.6s'
                      }} 
                    />
                  ))}
                </div>
                
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-900 min-h-[90px] text-left">
                  <p className="text-xs text-slate-300 font-mono leading-relaxed break-words">
                    {transcribedText}
                    <span className="inline-block w-1.5 h-3 bg-indigo-400 ml-1 animate-ping" />
                  </p>
                </div>
              </div>
            )}

            {/* Editable transcript text area with text correction info */}
            {(transcriptionStage === 'ready' || transcriptionStage === 'idle') && (
              <div className="space-y-3">
                {transcriptionStage === 'ready' && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-2.5 text-left">
                    <Check className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h5 className="font-bold text-emerald-200 text-[11.5px]">STT Processing Successful</h5>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Spoken audio extracted. Correct any landmark names, misspoken distances, or grammatical errors below before launching spatial parsing.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10.5px] font-bold text-slate-400">Transcript Editor Workspace</span>
                    {transcriptionStage === 'ready' && (
                      <button 
                        onClick={handleResetStage}
                        className="text-[10px] font-bold text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Reset Transcript
                      </button>
                    )}
                  </div>
                  <textarea
                    id="verbal-directions-textarea"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type or simulate verbal direction guides here (e.g., 'Head north for 100 meters, turn right at the coffee shop...')"
                    className="w-full h-32 p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans leading-relaxed text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Words: {inputText.split(/\s+/).filter(Boolean).length}</span>
                  <span>Characters: {inputText.length}</span>
                </div>
              </div>
            )}

            <button
              id="extract-directions-btn"
              onClick={handleExtractDirections}
              disabled={loading || !inputText.trim() || transcriptionStage === 'transcribing'}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" /> {loading ? "Analyzing Multilingual Spatial Vectors..." : "Extract & Analyze Directions (Gemini AI)"}
            </button>
          </div>
        </div>

        {/* Loading Display & Interactive Results Workspace - 7 cols */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          {loading ? (
            /* Loading view */
            <div className="bento-card p-12 flex flex-col items-center justify-center flex-1 space-y-6 shadow-xl border border-slate-800/80">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin" />
                <Sparkles className="w-6 h-6 text-indigo-400 absolute animate-pulse" />
              </div>
              <div className="space-y-2 text-center max-w-sm">
                <h4 className="font-bold text-slate-100 text-sm">Processing Multilingual Speech Pipeline</h4>
                <p className="text-xs text-slate-400 font-mono h-8 animate-pulse">{loadingMessage}</p>
              </div>
            </div>
          ) : result ? (
            /* Results & Visual Map View */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1">
              {/* Map grid panel - 7 cols */}
              <div className="md:col-span-7 flex flex-col h-full">
                <div className="bento-card p-4 shadow-lg flex flex-col flex-1 relative overflow-hidden text-left min-h-[350px] border border-slate-800/80">
                  {/* Map Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <Compass className="w-5 h-5 text-indigo-400 animate-spin-slow" style={{ transform: `rotate(${getCompassAngle()}deg)` }} />
                      <div>
                        <span className="font-bold text-xs text-slate-100 block">{t.mapCanvas || 'SaaS Vector Map Canvas'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{t.traceGrid || 'Visual logical trace coordinate grid'}</span>
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
                          d={`M ${result.steps.map(s => `${s.coordinates?.x ?? 50} ${s.coordinates?.y ?? 50}`).join(' L ')}`}
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
                        const x = step.coordinates?.x ?? 50;
                        const y = step.coordinates?.y ?? 50;
                        return (
                          <g key={step.stepNumber}>
                            <circle
                              cx={x}
                              cy={y}
                              r={isCurrent ? "2.2" : "1.4"}
                              className={`transition-all duration-300 cursor-pointer ${
                                isCurrent ? "fill-indigo-400 stroke-indigo-600 stroke-2" : "fill-gray-700"
                              }`}
                              onClick={() => {
                                setActiveStepIndex(idx);
                                const [mm, ss] = (step.timestamp || "00:00").split(':').map(Number);
                                setPlaybackTime((mm * 60) + ss);
                              }}
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
                      <div className="absolute bottom-3 left-3 right-3 p-3 bg-gray-900/95 border border-gray-800 rounded-xl flex items-center gap-3 shadow-xl backdrop-blur-sm text-left">
                        <div className="w-10 h-10 flex items-center justify-center bg-indigo-950/80 rounded-lg text-indigo-400 shrink-0 border border-indigo-900/50">
                          <Compass className="w-5 h-5 animate-spin-slow" style={{ transform: `rotate(${getCompassAngle()}deg)` }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                            {t.step || 'Step'} {activeStep.stepNumber} • {activeStep.compassDirection || 'Forward'} ({activeStep.distanceMeters || 100}m)
                          </span>
                          <span className="text-xs text-gray-200 font-medium block truncate mt-0.5">
                            {activeStep.landmark ? `📍 ${t.landmarkNear || 'Near'} ${activeStep.landmark}` : activeStep.instruction}
                          </span>
                        </div>
                        <div className="shrink-0 font-mono text-xs text-indigo-300 font-bold bg-indigo-950 border border-indigo-900 px-2 py-0.5 rounded">
                          {activeStep.timestamp || '00:00'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Playback Controls Progress Bar */}
                  <div className="mt-3 bg-gray-950 p-2.5 rounded-xl border border-gray-800 shrink-0 text-left">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-1.5">
                      <span>{t.timeline || 'Audio Sync Tracking Timeline'}</span>
                      <span className="text-indigo-400 font-bold">
                        {String(Math.floor(playbackTime / 60)).padStart(2, '0')}:{String(playbackTime % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                      {(() => {
                        const lastStep = result.steps[result.steps.length - 1];
                        const [lm, ls] = (lastStep?.timestamp || "00:00").split(':').map(Number);
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
                <div className="bento-card p-5 shadow-lg flex flex-col flex-1 text-left border border-slate-800/80">
                  <div className="border-b border-slate-800 pb-3 mb-3 shrink-0">
                    <h5 className="font-bold text-white text-sm">{t.routeCard || 'Parsed Route Card'}</h5>
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
                              {t.step || 'Step'} {step.stepNumber}
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
                              <MapPin className="w-3 h-3" /> {t.landmarkNear || 'Near'} {step.landmark}
                            </div>
                          )}

                          <div className="flex justify-between items-center border-t border-slate-800/80 pt-2 mt-2 text-[9.5px] font-mono text-slate-400">
                            <span>{t.heading || 'Heading'}: {step.compassDirection || 'Forward'}</span>
                            <span className="text-emerald-400 font-semibold">{step.confidence}% {t.match || 'Match'}</span>
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
            <div className="bento-card p-12 flex flex-col items-center justify-center flex-1 text-center space-y-4 shadow-xl border border-slate-800/80">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-indigo-400">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-bold text-slate-100 text-sm">Visual Mapping Sandbox</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Configure language choices, stream or upload a spoken memo on the left, check the transcript, and analyze it to trace route coordinates!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
