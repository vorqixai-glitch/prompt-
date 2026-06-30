export interface DirectionStep {
  stepNumber: number;
  instruction: string;
  landmark?: string;
  distanceMeters?: number;
  compassDirection?: string;
  timestamp?: string;
  confidence: number; // 0 to 100
  coordinates?: { x: number; y: number }; // Offset for our visual path map
}

export interface SaaSConfig {
  projectName: string;
  frontendStack: 'nextjs' | 'react' | 'vue' | 'flutter';
  backendStack: 'node' | 'python' | 'go' | 'rails';
  database: 'postgres' | 'sqlite' | 'firestore' | 'mongodb';
  sttEngine: 'whisper' | 'google-speech' | 'assemblyai';
  mapProvider: 'google-maps' | 'leaflet' | 'mapbox' | 'vector-canvas';
  authProvider: 'nextauth' | 'clerk' | 'supabase' | 'custom-jwt';
  pricingTiers: {
    free: { price: number; credits: number };
    pro: { price: number; credits: number };
    enterprise: { price: number; credits: number };
  };
  extraFeatures: string[];
}

export interface ParseResult {
  steps: DirectionStep[];
  rawTranscript: string;
  estimatedDuration: string;
  totalDistanceMeters: number;
  mapBounds?: { minX: number; maxX: number; minY: number; maxY: number };
}
