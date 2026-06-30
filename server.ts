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
  const { text, sourceLanguage = 'auto', outputLanguage = 'same' } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "No text directions provided or invalid type." });
  }

  // Fallback simulation generator if Gemini is not set up
  const generateFallback = (input: string) => {
    const lowercase = input.toLowerCase();
    
    // Basic language detection
    let detectedLang = 'en';
    const esWords = ['norte', 'sur', 'este', 'oeste', 'derecha', 'izquierda', 'puente', 'sendero', 'camine', 'recto', 'metros', 'gire', 'comience', 'letrero', 'bosque'];
    const frWords = ['nord', 'sud', 'est', 'ouest', 'droite', 'gauche', 'pont', 'sentier', 'marchez', 'tout droit', 'mètres', 'tournez', 'commencez', 'panneau'];
    const deWords = ['norden', 'süden', 'osten', 'westen', 'rechts', 'links', 'brücke', 'pfad', 'gehen', 'geradeaus', 'meter', 'drehen', 'starten', 'schild'];
    const itWords = ['nord', 'sud', 'est', 'ovest', 'destra', 'sinistra', 'ponte', 'sentiero', 'cammina', 'dritto', 'metri', 'gira', 'inizia', 'cartello'];

    const esScore = esWords.filter(w => lowercase.includes(w)).length;
    const frScore = frWords.filter(w => lowercase.includes(w)).length;
    const deScore = deWords.filter(w => lowercase.includes(w)).length;
    const itScore = itWords.filter(w => lowercase.includes(w)).length;

    if (esScore > 1 && esScore >= Math.max(frScore, deScore, itScore)) {
      detectedLang = 'es';
    } else if (frScore > 1 && frScore >= Math.max(esScore, deScore, itScore)) {
      detectedLang = 'fr';
    } else if (deScore > 1 && deScore >= Math.max(esScore, frScore, itScore)) {
      detectedLang = 'de';
    } else if (itScore > 1 && itScore >= Math.max(esScore, frScore, deScore)) {
      detectedLang = 'it';
    }

    const targetLang = (outputLanguage === 'same' || !outputLanguage) ? detectedLang : outputLanguage;

    // Direct translation dictionary for fallback simulation
    const dirTranslations: Record<string, Record<string, string>> = {
      en: { North: 'North', South: 'South', East: 'East', West: 'West', Straight: 'Straight', Left: 'Left', Right: 'Right' },
      es: { North: 'Norte', South: 'Sur', East: 'Este', West: 'Oeste', Straight: 'Recto', Left: 'Izquierda', Right: 'Derecha' },
      fr: { North: 'Nord', South: 'Sud', East: 'Est', West: 'Ouest', Straight: 'Tout droit', Left: 'Gauche', Right: 'Droite' },
      de: { North: 'Norden', South: 'Süden', East: 'Osten', West: 'Westen', Straight: 'Geradeaus', Left: 'Links', Right: 'Rechts' },
      it: { North: 'Nord', South: 'Sud', East: 'Est', West: 'Ovest', Straight: 'Dritto', Left: 'Sinistra', Right: 'Destra' }
    };

    const templates: Record<string, (dir: string, dist: number, landmark?: string) => string> = {
      en: (dir, dist, landmark) => `Go ${dir} for ${dist} meters${landmark ? ` near the ${landmark}` : ''}.`,
      es: (dir, dist, landmark) => `Camine hacia el ${dir} durante ${dist} metros${landmark ? ` cerca de ${landmark}` : ''}.`,
      fr: (dir, dist, landmark) => `Marchez vers le ${dir} sur ${dist} mètres${landmark ? ` près de ${landmark}` : ''}.`,
      de: (dir, dist, landmark) => `Gehen Sie ${dist} Meter nach ${dir}${landmark ? ` in der Nähe von ${landmark}` : ''}.`,
      it: (dir, dist, landmark) => `Procedi verso ${dir} per ${dist} metri${landmark ? ` vicino a ${landmark}` : ''}.`
    };

    const durationLabels: Record<string, string> = {
      en: 'minutes',
      es: 'minutos',
      fr: 'minutes',
      de: 'Minuten',
      it: 'minuti'
    };

    // Create logical steps based on typical directions text
    const steps = [];
    let currentX = 50;
    let currentY = 50;
    let totalDistance = 0;

    // Split input by sentences or key phrases
    const phrases = input.split(/[.,;]and|then|[.,;]y|entonces|puis|et|[.,;]/i)
      .map(p => p.trim())
      .filter(p => p.length > 5);

    if (phrases.length === 0) {
      phrases.push(input);
    }

    const directionMatches = [
      { words: ['north', 'straight', 'up', 'norte', 'recto', 'nord', 'tout droit', 'norden', 'geradeaus'], dx: 0, dy: -15, dir: 'North' },
      { words: ['south', 'down', 'sur', 'abajo', 'sud', 'bas', 'süden', 'unten'], dx: 0, dy: 15, dir: 'South' },
      { words: ['east', 'right', 'este', 'derecha', 'est', 'droite', 'osten', 'rechts'], dx: 15, dy: 0, dir: 'East' },
      { words: ['west', 'left', 'oeste', 'izquierda', 'ouest', 'gauche', 'westen', 'links'], dx: -15, dy: 0, dir: 'West' }
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
      const distanceMatch = phrase.match(/(\d+)\s*(meters|mètres|metri|meter|m|feet|pies|pieds|yards|blocks|cuadras|rues|km|miles|step)/i);
      const dist = distanceMatch ? parseInt(distanceMatch[1]) : 100 + (i * 50);
      totalDistance += dist;

      // Extract a landmark if mentioned
      let landmark = undefined;
      const allLandmarkKeywords = [...(landmarkKeywords[detectedLang] || landmarkKeywords['en'])];
      for (const keyword of allLandmarkKeywords) {
        const index = phrase.toLowerCase().indexOf(keyword);
        if (index !== -1) {
          const wordsAfter = phrase.substring(index + keyword.length).trim().split(/\s+/).slice(0, 3).join(' ');
          if (wordsAfter) {
            landmark = `${wordsAfter.charAt(0).toUpperCase() + wordsAfter.slice(1)}`;
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

      // Determine translation or original phrase
      let instructionText = phrase;
      if (detectedLang !== targetLang) {
        // Reconstruct instruction in the target language
        const targetDirName = dirTranslations[targetLang]?.[selectedDir.dir] || selectedDir.dir;
        const templateFn = templates[targetLang] || templates['en'];
        instructionText = templateFn(targetDirName, dist, landmark);
      } else {
        // Just capitalize first letter
        instructionText = instructionText.charAt(0).toUpperCase() + instructionText.slice(1);
      }

      const stepDirName = dirTranslations[targetLang]?.[selectedDir.dir] || selectedDir.dir;

      steps.push({
        stepNumber: i + 1,
        instruction: instructionText,
        landmark,
        distanceMeters: dist,
        compassDirection: stepDirName,
        timestamp: `${mm}:${ss}`,
        confidence: 92 - (i * 3),
        coordinates: { x: Math.round(currentX), y: Math.round(currentY) }
      });
    }

    const finalDurLabel = durationLabels[targetLang] || 'minutes';
    const finalDurVal = Math.ceil(totalDistance / 80);

    return {
      steps,
      rawTranscript: input,
      estimatedDuration: `${finalDurVal} ${finalDurLabel}`,
      totalDistanceMeters: totalDistance,
      detectedLanguage: detectedLang,
      outputLanguage: targetLang,
      isSimulated: true
    };
  };

  const landmarkKeywords: Record<string, string[]> = {
    en: ['by the', 'at the', 'near', 'past the', 'pass', 'opposite', 'building', 'store', 'cafe', 'sign', 'shop', 'door'],
    es: ['cerca de', 'en el', 'en la', 'junto a', 'pasando el', 'pasando la', 'frente a', 'edificio', 'tienda', 'café', 'letrero', 'puerta'],
    fr: ['près de', 'à côté de', 'devant le', 'devant la', 'passé le', 'passé la', 'en face de', 'bâtiment', 'magasin', 'café', 'panneau', 'porte'],
    de: ['beim', 'am', 'neben dem', 'neben der', 'vorbei am', 'vorbei an', 'gegenüber dem', 'gebäude', 'laden', 'café', 'schild', 'tür'],
    it: ['vicino a', 'al', 'alla', 'accanto a', 'oltre il', 'oltre la', 'di fronte a', 'negozio', 'caffè', 'cartello', 'porta']
  };

  if (!ai) {
    // Return mock fallback
    return res.json(generateFallback(text));
  }

  try {
    const sourceLangName = sourceLanguage === 'auto' ? 'automatically detected language' : (sourceLanguage === 'es' ? 'Spanish' : sourceLanguage === 'fr' ? 'French' : sourceLanguage === 'de' ? 'German' : sourceLanguage === 'it' ? 'Italian' : 'English');
    const targetLangName = outputLanguage === 'same' || !outputLanguage ? 'the detected language of the input' : (outputLanguage === 'es' ? 'Spanish' : outputLanguage === 'fr' ? 'French' : outputLanguage === 'de' ? 'German' : outputLanguage === 'it' ? 'Italian' : 'English');

    const systemPrompt = `You are a high-precision multilingual spatial analysis and translation engine.
Your task is to parse unstructured verbal directions, transcribed speeches, or voice memos, and turn them into a structured spatial JSON map format.

Linguistic and Translation Requirements:
- The source instructions are in ${sourceLangName}.
- You MUST translate all step instructions, landmarks, and descriptions to the target language: ${targetLangName}.
- The returned steps must be in the target language. For example, if target language is Spanish, instructions should be like "Camine hacia el norte...", and landmarks like "Puente de madera". If French, like "Marchez vers le nord..." and "Pont en bois".
- The 'rawTranscript' property should contain the original verbal directions text.
- The 'estimatedDuration' should be in the target language (e.g. "8 minutes" in English, "8 minutos" in Spanish, "8 minutes" in French).

Convert the provided text directions into a highly structured JSON array of sequential steps with spatial coordinate tracking.
The coordinates of each step are plotted relative to a 2D plane:
- The coordinate system is relative: start at step 0 which is exactly at coordinates { x: 50, y: 50 }.
- Based on the verbal instructions (e.g. "head North", "turn right", "walk 100 meters East", or their Spanish/French/German/Italian equivalents), calculate the absolute offset coordinate for each subsequent step.
- Direction mapping:
  - North / Norte / Nord / Norden: Decreased Y (move up, towards 10)
  - South / Sur / Sud / Süden: Increased Y (move down, towards 90)
  - East / Este / Est / Osten: Increased X (move right, towards 90)
  - West / Oeste / Ouest / Westen: Decreased X (move left, towards 10)
- Scale the moves appropriately based on the distance described. A movement of 50-100m should translate to roughly 10-20 units on the scale of 0 to 100.
- Ensure all coordinates strictly lie within the boundaries [10, 90] to avoid falling off the edge.
- Try to detect landmarks (e.g., "coffee shop" / "cafetería" / "café", "traffic light" / "semáforo" / "feu de signalisation", etc.).
- Estimate or calculate distance in meters. (If feet/pies/pieds is mentioned, convert 3 feet = 1 meter. If miles/millas/milles, 1 mile = 1600 meters. If blocks/cuadras/rues, 1 block = 100 meters).
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
            estimatedDuration: { type: Type.STRING, description: "Total estimated travel duration in the output language (e.g. '8 minutos' or '8 minutes')" },
            totalDistanceMeters: { type: Type.INTEGER, description: "Sum of all step distances in meters" },
            detectedLanguage: { type: Type.STRING, description: "ISO code of detected source language, e.g. 'en', 'es', 'fr', 'de', 'it'" },
            outputLanguage: { type: Type.STRING, description: "ISO code of target output language, e.g. 'en', 'es', 'fr', 'de', 'it'" },
            steps: {
              type: Type.ARRAY,
              description: "The sequential list of directional steps translated to the output language",
              items: {
                type: Type.OBJECT,
                required: ["stepNumber", "instruction", "confidence", "coordinates"],
                properties: {
                  stepNumber: { type: Type.INTEGER, description: "1-based order index of the step" },
                  instruction: { type: Type.STRING, description: "The precise action/direction instruction text translated to the output language" },
                  landmark: { type: Type.STRING, description: "Any landmark mentioned in this step translated to the output language" },
                  distanceMeters: { type: Type.INTEGER, description: "Estimated distance of this segment in meters" },
                  compassDirection: { type: Type.STRING, description: "Compass direction of movement (e.g. 'North'/'Norte'/'Nord' depending on target language)" },
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
