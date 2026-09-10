import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import Parser from "rss-parser";
import cron from "node-cron";
import cors from "cors";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// --- Types ---
const NewsCategory = {
  TOP_STORY: "Top Story",
  WORLD: "World",
  TECHNOLOGY: "Technology",
  AI: "Artificial Intelligence",
  EDITORIAL: "Editorial",
  BUSINESS: "Business",
  SCIENCE: "Science"
} as const;

type NewsCategory = typeof NewsCategory[keyof typeof NewsCategory];

interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  excerpt: string;
  content: string;
  category: NewsCategory;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  isTopStory?: boolean;
}

// --- Config ---
const app = express();
const PORT = 3000;
const parser = new Parser();

// Lazy-loaded Gemini AI client
let genAI: GoogleGenAI | null = null;

function getAIClient() {
  if (!genAI) {
    // Priority: GEMINI_API_KEY, then GOOGLE_API_KEY as fallback
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey || apiKey === "YOUR_API_KEY" || apiKey.length < 10) {
      console.warn("⚠️ Warning: GEMINI_API_KEY is missing or invalid in environment.");
      throw new Error("A valid GEMINI_API_KEY is required for news automation.");
    }
    
    genAI = new GoogleGenAI({ apiKey });
    console.log("[AI] Gemini client initialized successfully.");
  }
  return genAI;
}

// In-memory store (In production, replace with Firestore)
let articles: NewsArticle[] = [];

// --- Logic: News Automation ---

async function transformNews(rssItem: any): Promise<NewsArticle | null> {
  try {
    const aiClient = getAIClient();
    const prompt = `
      As the Editor of 'Dainik Jahan', your task is to synthesize global intelligence. 
      Input Source: ${rssItem.title} - ${rssItem.contentSnippet || rssItem.content}
      
      CRITICAL INSTRUCTIONS:
      1. LANGUAGE: If the input is in Bengali, translate it to flawless, high-level English.
      2. STYLE: Adopt an authoritative, analytical, and sophisticated tone (think The Economist, The Guardian, or NYT).
      3. FOCUS: Don't just report facts; provide structural analysis and foresight.
      
      Return a JSON object with:
      - title: A powerful headline.
      - summary: A 1-sentence 'Intelligence Brief' summarizing the core insight.
      - excerpt: 2-sentence summary for the mobile feed.
      - content: 300-500 words of deep analysis using markdown.
      - category: One of World, Technology, AI, Business, Science.
      - author: A realistic international journalist name.
      - imageKeywords: Specific keywords for a relevant high-quality image.
    `;

    const result = await aiClient.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            excerpt: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING, enum: Object.values(NewsCategory) },
            author: { type: Type.STRING },
            imageKeywords: { type: Type.STRING }
          },
          required: ["title", "summary", "excerpt", "content", "category", "author", "imageKeywords"]
        }
      }
    });

    const data = JSON.parse(result.text || "{}");
    if (!data.title) return null;

    const keyword = encodeURIComponent(data.imageKeywords || "global news");
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      summary: data.summary,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category as NewsCategory,
      author: data.author,
      publishedAt: rssItem.isoDate || new Date().toISOString(),
      imageUrl: `https://loremflickr.com/1200/800/${keyword}?lock=${Math.floor(Math.random() * 1000)}`,
      isTopStory: Math.random() > 0.85
    };
  } catch (error) {
    console.error("Transformation Error:", error);
    
    // Extract title safely (Daily Star RSS sometimes nests an <a> tag inside <title>)
    let safeTitle = "News Update";
    if (typeof rssItem.title === "string") {
      safeTitle = rssItem.title;
    } else if (rssItem.title && typeof rssItem.title === "object") {
      if (rssItem.title.a && rssItem.title.a[0] && rssItem.title.a[0]._) {
        safeTitle = rssItem.title.a[0]._;
      } else if (rssItem.title._) {
        safeTitle = rssItem.title._;
      } else {
        safeTitle = JSON.stringify(rssItem.title);
      }
    }

    // Fallback to raw RSS data if AI generation fails
    return {
      id: Math.random().toString(36).substr(2, 9),
      title: safeTitle,
      summary: rssItem.contentSnippet || "Full details are currently unavailable.",
      excerpt: (rssItem.contentSnippet || "Full details are currently unavailable.").substring(0, 100) + "...",
      content: rssItem.content || rssItem.contentSnippet || "Full content unavailable.",
      category: NewsCategory.WORLD,
      author: rssItem.creator || "News Desk",
      publishedAt: rssItem.isoDate || new Date().toISOString(),
      imageUrl: `https://loremflickr.com/1200/800/news?lock=${Math.floor(Math.random() * 1000)}`,
      isTopStory: Math.random() > 0.85
    };
  }
}

async function fetchAndAutomateNews() {
  console.log("[Automation] Starting hourly news harvest...");
  const feeds = [
    "https://www.thedailystar.net/frontpage/rss.xml"
  ];

  const newArticles: NewsArticle[] = [];

  for (const url of feeds) {
    try {
      const feed = await parser.parseURL(url);
      const items = feed.items.slice(0, 10);
      
      for (const item of items) {
        const transformed = await transformNews(item);
        if (transformed) {
          newArticles.push(transformed);
        }
      }
    } catch (e) {
      console.error(`Feed Error [${url}]:`, e);
    }
  }

  if (newArticles.length > 0) {
    articles = newArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    console.log(`[Automation] Workflow complete. Pool refreshed at ${new Date().toLocaleTimeString()}.`);
  }
}

// --- Server Setup ---

async function startServer() {
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "running", 
      uptime: process.uptime(),
      articlesCount: articles.length,
      aiClientReady: !!genAI
    });
  });

  // API Routes
  app.get("/api/news", (req, res) => {
    // If no articles yet, trigger an initial fetch
    if (articles.length === 0) {
      fetchAndAutomateNews();
      return res.json({ status: "initializing", articles: [] });
    }
    res.json(articles);
  });

  // Scheduled Task: Every hour
  cron.schedule("0 * * * *", () => {
    fetchAndAutomateNews();
  });

  // Run initial fetch on startup
  fetchAndAutomateNews();

  // Vite Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dainik Jahan Engine running on http://localhost:${PORT}`);
  });
}

startServer();
