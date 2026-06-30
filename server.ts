import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini client successfully initialized.");
  } catch (error) {
    console.error("Error initializing Gemini client:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is not configured or contains placeholder value. Running in simulation fallback mode.");
}

// REST API: Parse verbal directions using Gemini API or simulation fallback
app.post("/api/parse-directions", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "No text directions provided or invalid type." });
  }

  // Fallback simulation generator if Gemini is not set up
  const generateFallback = (input: string) => {
    const lowercase = input.toLowerCase();
    
    // Create logical steps based on typical directions text
    const steps = [];
    let currentX = 50;
    let currentY = 50;
    let totalDistance = 0;

    // Split input by sentences or key phrases
    const phrases = input.split(/[.,;]and|then|[.,;]/i)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (phrases.length === 0) {
      phrases.push(input);
    }

    const directionMatches = [
      { words: ['north', 'straight', 'up'], dx: 0, dy: -15, dir: 'North' },
      { words: ['south', 'down'], dx: 0, dy: 15, dir: 'South' },
      { words: ['east', 'right'], dx: 15, dy: 0, dir: 'East' },
      { words: ['west', 'left'], dx: -15, dy: 0, dir: 'West' }
    ];

    for (let i = 0; i < Math.min(phrases.length, 6); i++) {
      const phrase = phrases[i];
      let selectedDir = directionMatches[i % 4]; // cycle or match
      
      for (const match of directionMatches) {
        if (match.words.some(w => phrase.toLowerCase().includes(w))) {
          selectedDir = match;
          break;
        }
      }

      // Try to parse some distance
      const distanceMatch = phrase.match(/(\d+)\s*(meters|feet|yards|blocks|km|miles|step)/i);
      const dist = distanceMatch ? parseInt(distanceMatch[1]) : 100 + (i * 50);
      totalDistance += dist;

      // Extract a landmark if mentioned
      let landmark = undefined;
      const landmarkKeywords = ['by the', 'at the', 'near', 'past the', 'pass', 'opposite', 'building', 'store', 'cafe', 'station', 'park', 'light', 'sign', 'shop', 'door'];
      for (const keyword of landmarkKeywords) {
        const index = phrase.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          const wordsAfter = phrase.substring(index + keyword.length).trim().split(/\s+/).slice(0, 3).join(' ');
          if (wordsAfter) {
            landmark = `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} ${wordsAfter}`;
            break;
          }
        }
      }

      currentX += selectedDir.dx;
      currentY += selectedDir.dy;

      // Clamp coordinate to ensure they stay on canvas
      currentX = Math.max(15, Math.min(85, currentX));
      currentY = Math.max(15, Math.min(85, currentY));

      const minutes = Math.floor(totalDistance / 80); // roughly 80 meters per minute walking
      const mm = String(minutes).padStart(2, '0');
      const ss = String(Math.floor((totalDistance % 80) * 0.75)).padStart(2, '0');

      steps.push({
        stepNumber: i + 1,
        instruction: phrase,
        landmark,
        distanceMeters: dist,
        compassDirection: selectedDir.dir,
        timestamp: `${mm}:${ss}`,
        confidence: 85 - (i * 3),
        coordinates: { x: Math.round(currentX), y: Math.round(currentY) }
      });
    }

    return {
      steps,
      rawTranscript: input,
      estimatedDuration: `${Math.ceil(totalDistance / 80)} minutes`,
      totalDistanceMeters: totalDistance,
      isSimulated: true
    };
  };

  if (!ai) {
    // Return mock fallback
    return res.json(generateFallback(text));
  }

  try {
    const systemPrompt = `You are a high-precision spatial analysis intelligence engine.
Your task is to parse unstructured verbal directions, transcribed speeches, or voice memos, and turn them into a structured spatial JSON map format.

Convert the provided text directions into a highly structured JSON array of sequential steps with spatial coordinate tracking.
The coordinates of each step are plotted relative to a 2D plane:
- The coordinate system is relative: start at step 0 which is exactly at coordinates { x: 50, y: 50 }.
- Based on the verbal instructions (e.g. "head North", "turn right", "walk 100 meters East"), calculate the absolute offset coordinate for each subsequent step.
- North increases Y coordinate (towards 0 top-down screen coordinate, so actually decrease Y in screen coords or increase Y logically, let's keep it standard: North goes DECREASED Y / up on canvas, South goes INCREASED Y / down, East goes INCREASED X / right, West goes DECREASED X / left).
- Scale the moves appropriately based on the distance described. A movement of 50-100m should translate to roughly 10-20 units on the scale of 0 to 100.
- Ensure all coordinates strictly lie within the boundaries [10, 90] to avoid falling off the edge.
- Try to detect landmarks (e.g., "coffee shop", "traffic light", "red brick building", "lobby").
- Estimate or calculate distance in meters. (If feet is mentioned, convert 3 feet = 1 meter. If miles, 1 mile = 1600 meters. If blocks, 1 block = 100 meters).
- Estimate a timestamp (MM:SS) starting at "00:00", incrementing based on walking speed (approx 1.2 meters per second).

You must respond with ONLY a valid raw JSON object matching the requested schema. No markdown wrapping (like \`\`\`json), no trailing text. Just the JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: text,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["steps", "rawTranscript", "estimatedDuration", "totalDistanceMeters"],
          properties: {
            rawTranscript: { type: Type.STRING, description: "The original full verbal direction text" },
            estimatedDuration: { type: Type.STRING, description: "Total estimated travel duration (e.g. '8 minutes')" },
            totalDistanceMeters: { type: Type.INTEGER, description: "Sum of all step distances in meters" },
            steps: {
              type: Type.ARRAY,
              description: "The sequential list of directional steps",
              items: {
                type: Type.OBJECT,
                required: ["stepNumber", "instruction", "confidence", "coordinates"],
                properties: {
                  stepNumber: { type: Type.INTEGER, description: "1-based order index of the step" },
                  instruction: { type: Type.STRING, description: "The precise action/direction instruction text" },
                  landmark: { type: Type.STRING, description: "Any landmark mentioned in this step" },
                  distanceMeters: { type: Type.INTEGER, description: "Estimated distance of this segment in meters" },
                  compassDirection: { type: Type.STRING, description: "Compass direction of movement (e.g. 'North', 'East', 'South-West')" },
                  timestamp: { type: Type.STRING, description: "Running timestamp (MM:SS)" },
                  confidence: { type: Type.INTEGER, description: "Confidence percentage of NLP parsing accuracy (0-100)" },
                  coordinates: {
                    type: Type.OBJECT,
                    required: ["x", "y"],
                    properties: {
                      x: { type: Type.INTEGER, description: "The calculated absolute X offset on canvas (10-90)" },
                      y: { type: Type.INTEGER, description: "The calculated absolute Y offset on canvas (10-90)" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    return res.json({ ...parsedData, isSimulated: false });
  } catch (error) {
    console.error("Gemini processing error:", error);
    // Return gracefully using simulation fallback
    return res.json({
      ...generateFallback(text),
      error: "Gemini query failed. Displaying local high-fidelity simulated results."
    });
  }
});

// Setup Vite Development Server or Serve Compiled Static Assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
