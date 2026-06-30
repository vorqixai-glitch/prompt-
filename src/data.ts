import { SaaSConfig, ParseResult } from './types';

export const SAMPLE_MEMOS = [
  {
    id: "hiking_trail",
    title: "Mountain Trail Voice Memo",
    duration: "1m 15s",
    text: "Start at the pine log trailhead sign. Go straight North for about 200 meters. You will see a wooden footbridge on your left, cross that bridge over the creek. Then, turn East and hike uphill along the rocky path for 450 meters. Once you pass the tall boulder shaped like a triangle, turn South and descend for 100 meters until you reach the grassy clearing by the old campsite."
  },
  {
    id: "delivery_warehouse",
    title: "Warehouse Picking verbal directions",
    duration: "0m 45s",
    text: "Enter through Bay 3 main entrance. Head East for 30 meters down Aisle A. Stop at the high-reach shelving unit with the yellow danger sign. Turn North, go 15 meters to the pallet storage. Turn West and walk 40 meters to the heavy-loading crane platform. Grab the parcel and walk 20 meters South directly to the dispatch desk."
  },
  {
    id: "city_guide",
    title: "Downtown Historical Tour Speech",
    duration: "2m 10s",
    text: "We begin our tour outside the historic stone clock tower on Broadway. Walk North for 300 meters past the Victorian fountain. When you reach the red brick library on the corner, turn West and walk 150 meters. Keep an eye out for the small copper plaque on the facade of the post office on your right. From there, head South for 400 meters down the cobbled pedestrian street until you reach the entrance of Central Gardens."
  }
];

export const PRESET_SAAS_CONFIGS: Record<string, SaaSConfig> = {
  general: {
    projectName: "VoiceDirections Pro",
    frontendStack: "nextjs",
    backendStack: "node",
    database: "postgres",
    sttEngine: "whisper",
    mapProvider: "google-maps",
    authProvider: "nextauth",
    pricingTiers: {
      free: { price: 0, credits: 5 },
      pro: { price: 29, credits: 50 },
      enterprise: { price: 149, credits: 300 }
    },
    extraFeatures: ["Offline Sync", "Multi-Language Processing", "Interactive PDF Export"]
  },
  realestate: {
    projectName: "PropTour AI",
    frontendStack: "react",
    backendStack: "python",
    database: "sqlite",
    sttEngine: "google-speech",
    mapProvider: "mapbox",
    authProvider: "clerk",
    pricingTiers: {
      free: { price: 0, credits: 3 },
      pro: { price: 49, credits: 100 },
      enterprise: { price: 199, credits: 500 }
    },
    extraFeatures: ["Virtual Reality Tour Integration", "OCR for Room Signs", "Automated Listing Description Drafts"]
  },
  industrial: {
    projectName: "FloorGuide Master",
    frontendStack: "flutter",
    backendStack: "go",
    database: "postgres",
    sttEngine: "assemblyai",
    mapProvider: "vector-canvas",
    authProvider: "supabase",
    pricingTiers: {
      free: { price: 0, credits: 10 },
      pro: { price: 99, credits: 250 },
      enterprise: { price: 499, credits: 2000 }
    },
    extraFeatures: ["High-precision indoor positioning", "Custom floor plan mapping", "SAP/ERP system integration"]
  }
};

export const SCHEMA_TABLES = [
  {
    name: "users",
    description: "Stores user account information and SaaS pricing tier subscriptions.",
    columns: [
      { name: "id", type: "uuid (PK)", desc: "Unique identifier for each user" },
      { name: "email", type: "varchar", desc: "User email address used for login" },
      { name: "password_hash", type: "varchar", desc: "Secure bcrypt hashed password" },
      { name: "tier", type: "varchar", desc: "Subscription status: 'free', 'pro', or 'enterprise'" },
      { name: "credits_remaining", type: "integer", desc: "Remaining monthly voice extraction operations" },
      { name: "created_at", type: "timestamp", desc: "Account registration datetime" }
    ]
  },
  {
    name: "videos",
    description: "Maintains record of uploaded video/audio guides with job processing statuses.",
    columns: [
      { name: "id", type: "uuid (PK)", desc: "Unique ID of the uploaded asset" },
      { name: "user_id", type: "uuid (FK)", desc: "References users.id" },
      { name: "filename", type: "varchar", desc: "Name of the original uploaded file" },
      { name: "storage_path", type: "varchar", desc: "Cloud Storage file pointer (e.g. S3 URI)" },
      { name: "duration_seconds", type: "integer", desc: "Determined video length in seconds" },
      { name: "status", type: "varchar", desc: "Processing state: 'uploaded', 'extracting_audio', 'stt_transcribing', 'nlp_parsing', 'completed', 'failed'" },
      { name: "uploaded_at", type: "timestamp", desc: "Datetime when upload finished" }
    ]
  },
  {
    name: "transcripts",
    description: "Contains extracted full audio text transcripts with word timestamps.",
    columns: [
      { name: "id", type: "uuid (PK)", desc: "Unique transcript identifier" },
      { name: "video_id", type: "uuid (FK - Unique)", desc: "References videos.id (one-to-one)" },
      { name: "full_text", type: "text", desc: "Complete word text extracted via Whisper" },
      { name: "confidence_score", type: "decimal", desc: "Average speech-to-text accuracy confidence" },
      { name: "language_code", type: "varchar", desc: "Detected audio language (e.g., 'en-US')" }
    ]
  },
  {
    name: "waypoints",
    description: "Structured directional paths parsed by the AI NLP logic.",
    columns: [
      { name: "id", type: "uuid (PK)", desc: "Unique waypoint step ID" },
      { name: "video_id", type: "uuid (FK)", desc: "References videos.id" },
      { name: "step_number", type: "integer", desc: "Ordinal order of direction (1, 2, 3...)" },
      { name: "raw_sentence", type: "varchar", desc: "The parsed sentence from the transcript" },
      { name: "instruction", type: "text", desc: "Cleaned directional instruction" },
      { name: "landmark", type: "varchar", desc: "Extracted location/reference landmark (optional)" },
      { name: "distance_meters", type: "integer", desc: "Parsed linear distance in meters" },
      { name: "compass_direction", type: "varchar", desc: "Compass heading (North, East, etc.)" },
      { name: "coord_x", type: "integer", desc: "Relative X position on normalized scale (0-100)" },
      { name: "coord_y", type: "integer", desc: "Relative Y position on normalized scale (0-100)" }
    ]
  }
];

export const SYSTEM_ARCH_STEPS = [
  {
    id: 1,
    title: "Video Upload & Ingestion",
    actor: "Client App ➔ Storage API",
    description: "Video memo is uploaded via React frontend using presigned S3 URLs directly to AWS S3. Large files chunking ensures reliable uploads."
  },
  {
    id: 2,
    title: "Background Job Dispatch",
    actor: "Backend API ➔ Redis Queue",
    description: "Upload webhook triggers API to enqueue an async extraction job. Redis Bull/Celery handles retry policies and concurrent execution limits."
  },
  {
    id: 3,
    title: "Audio Track Extraction",
    actor: "FFmpeg Worker",
    description: "Containerized FFmpeg splits high-quality audio mono track (16kHz 16-bit WAV PCM) from video, deleting raw video locally to optimize disk space."
  },
  {
    id: 4,
    title: "Speech-to-Text Transcription",
    actor: "Speech Engine ➔ Whisper AI",
    description: "Audio is analyzed by OpenAI Whisper, transcribing the voice track into text, storing sentence-level timestamps and confidence scores."
  },
  {
    id: 5,
    title: "NLP Directions Extraction",
    actor: "Gemini / NLP Intelligence",
    description: "The AI system parses transcripts, mapping sentences to structured spatial path tokens (waypoints, turns, landmarks, relative vector distance)."
  },
  {
    id: 6,
    title: "Structured Route Map Plotting",
    actor: "Map Canvas Render Engine",
    description: "Normalized spatial vectors are processed by the frontend, plotting a dynamic interactive visual path map or binding to Google Maps APIs."
  }
];

export const API_SPEC = [
  {
    method: "POST",
    path: "/api/v1/jobs/upload",
    summary: "Initiate Upload",
    desc: "Requests a secure presigned URL to upload a video direct to Cloud Storage.",
    reqBody: `{
  "filename": "warehouse_tour.mp4",
  "mimeType": "video/mp4",
  "fileSizeBytes": 4580210
}`,
    resBody: `{
  "jobId": "job_921a8c8e_e9fb_4b2e",
  "uploadUrl": "https://s3.amazonaws.com/voice-to-dir-uploads/...",
  "status": "pending_upload"
}`
  },
  {
    method: "GET",
    path: "/api/v1/jobs/:jobId",
    summary: "Check Job Status",
    desc: "Polls the status of voice extraction, speech-to-text, and direction parsing phases.",
    reqBody: "None",
    resBody: `{
  "jobId": "job_921a8c8e_e9fb_4b2e",
  "status": "processing",
  "phase": "nlp_parsing",
  "progressPercent": 80,
  "startedAt": "2026-06-30T05:00:00Z"
}`
  },
  {
    method: "GET",
    path: "/api/v1/routes/:id",
    summary: "Fetch Parsed Route",
    desc: "Returns the completed transcript, full step-by-step directions list, and calculated canvas offset path.",
    reqBody: "None",
    resBody: `{
  "routeId": "route_fa12b881",
  "jobId": "job_921a8c8e_e9fb_4b2e",
  "totalDistanceMeters": 780,
  "estimatedDuration": "10 minutes",
  "steps": [
    {
      "stepNumber": 1,
      "instruction": "Go straight North for about 200 meters",
      "landmark": "Pine log trailhead sign",
      "distanceMeters": 200,
      "compassDirection": "North",
      "timestamp": "00:00",
      "coordinates": { "x": 50, "y": 30 }
    }
  ]
}`
  }
];

export function buildPromptTemplate(config: SaaSConfig): string {
  const isWebStack = config.backendStack === 'node';
  const stackName = isWebStack ? 'Node.js Express / TypeScript' : 'Python FastAPI';
  
  return `# BUILD PROMPT: COMPREHENSIVE VOICE-TO-DIRECTIONS SAAS TOOL

You are building a specialized high-performance SaaS platform named "${config.projectName}" that extracts voice instructions from videos, transcribes them, and parses verbal directions into interactive structured mapping systems.

## SYSTEM ARCHITECTURE
- **Frontend Stack**: ${config.frontendStack.toUpperCase()} (React 19, TypeScript, TailwindCSS for absolute styling precision, and Lucide icons).
- **Backend Service**: ${config.backendStack.toUpperCase()} (${stackName}).
- **Durable Database**: ${config.database.toUpperCase()} (configured with schemas for users, uploads, transcripts, and parsed waypoints).
- **Speech-to-Text Engine**: ${config.sttEngine.toUpperCase()} (handling chunked file transfers, retry mechanisms, and timestamp syncing).
- **Map & Routing Visualizer**: ${config.mapProvider.toUpperCase()} (converting custom normalized coordinates into real geographical offsets or custom SVG coordinate grids).
- **User Authentication**: ${config.authProvider.toUpperCase()} (including JSON Web Token claims or session cookie management).

## CORE REQUISITES TO IMPLEMENT

### 1. Robust Video Upload & Worker Engine
- Accept media formats (MP4, MOV, WebM) with size validation and clean chunking uploads.
- Secure, async processing backend:
  - FFmpeg background extraction worker to isolate audio from video tracks seamlessly.
  - Integration with the ${config.sttEngine.toUpperCase()} system, handling low-confidence words.
  - Return detailed timestamp lists mapping speech chunks to structural steps.

### 2. Intelligent NLP Direction Extraction
- Feed full text transcripts to the processing pipeline.
- Parse verbal path commands (e.g., "head east", "turn left", "walk 50 steps") using advanced NLP parsing rules.
- Identify:
  - Movement instructions and compass orientations (North, East, South, West).
  - Explicit distances (conversions for blocks, miles, meters, or paces).
  - Landmark tags ("at the clocktower", "past the coffee shop") to anchor waypoints.
- Generate unified geographical or normalized relative coordinates for plotting.

### 3. Interactive Route Rendering Panel
- Create a canvas visualizer using ${config.mapProvider.toUpperCase()}:
  - Render an elegant, high-contrast visual coordinate grid.
  - Stagger the rendering of waypoints along a continuous trace line.
  - Highlight landmarks as interactive map pins with tooltip metadata.
- Sync audio playback with the text instructions list, lighting up current steps as audio timeline advances.

### 4. User Workspace Dashboard
- Fully featured dashboard containing:
  - Video upload dropzone with progress percentages and success alerts.
  - Route listing library displaying duration, length, date, and status tags.
  - Clean export actions: PDF route cards, JSON schema templates, and shareable map links.

### 5. SaaS Infrastructure & Scaling Constraints
- Subscription Tier limit restrictions:
  - Free Tier: max ${config.pricingTiers.free.credits} operations/month, standard speed.
  - Pro Tier ($${config.pricingTiers.pro.price}/mo): ${config.pricingTiers.pro.credits} operations, high-priority queue.
  - Enterprise Tier ($${config.pricingTiers.enterprise.price}/mo): custom limits, API keys.
- Features to bundle: ${config.extraFeatures.join(', ')}.

Ensure that code patterns adhere to pristine TypeScript structures, custom Tailwind styling, clean modular files, and robust error safeguards.`;
}
