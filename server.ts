import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Flow Finance - Minimalist Income & Expense Tracking
 * Principal Architect: AI
 */

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Route: Parse Natural Language Transaction
  app.post("/api/parse-transaction", async (req, res) => {
    const { input } = req.body;
    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse the following financial transaction description into a structured JSON object. 
If the year is missing, assume 2026 (the current year in this context).
Current Date for context: ${new Date().toLocaleDateString()}

Input: "${input}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: "The numerical value of the transaction" },
              type: { type: Type.STRING, enum: ["income", "expense"], description: "Whether it's money in or money out" },
              category: { type: Type.STRING, description: "A one or two-word category (e.g., Food, Travel, Rent, Entertainment, Health)" },
              description: { type: Type.STRING, description: "A brief cleaned-up description of what was bought or earned" },
              date: { type: Type.STRING, description: "ISO 8601 date string" },
              isRecurring: { type: Type.BOOLEAN, description: "True if the input suggests a repeating schedule (e.g. 'every month', 'subscriptions', 'salary')" },
              frequency: { type: Type.STRING, enum: ["daily", "weekly", "monthly", "yearly"], description: "The frequency of the recursion if isRecurring is true" }
            },
            required: ["amount", "type", "category", "description", "date", "isRecurring"]
          }
        }
      });

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      res.status(500).json({ error: "Failed to parse transaction" });
    }
  });

  // API Route: OCR Receipt Scanning
  app.post("/api/scan-receipt", async (req, res) => {
    const { image } = req.body; // base64 image
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-1.5-flash", // Use 1.5-flash for vision tasks
        contents: [
          {
            role: "user",
            parts: [
              { text: "Extract transaction data from this receipt image. Return the total amount, vendor name (as description), date, and suggest a category." },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: image.split(",")[1] || image,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["expense"], default: "expense" },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              date: { type: Type.STRING, description: "ISO 8601 date string" }
            },
            required: ["amount", "type", "category", "description", "date"]
          }
        }
      });

      const parsed = JSON.parse(response.text);
      res.json(parsed);
    } catch (error) {
      console.error("Gemini OCR Error:", error);
      res.status(500).json({ error: "Failed to scan receipt" });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
