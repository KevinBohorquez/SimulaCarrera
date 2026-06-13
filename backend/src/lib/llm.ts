import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import { parseAIJson } from "./gemini.js";

export type AIProvider = "groq" | "gemini" | "openai";

function isValidKey(key?: string) {
  if (!key || key.length < 20) return false;
  const placeholders = ["YOUR", "not-configured", "sk-...", "AIza...", "gsk_tu", "pega_aqui"];
  return !placeholders.some((p) => key.includes(p));
}

const MODELS: Record<AIProvider, string> = {
  groq: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
  gemini: process.env.AI_MODEL ?? "gemini-2.0-flash",
  openai: process.env.AI_MODEL ?? "gpt-4o-mini",
};

export function getProviderChain(): AIProvider[] {
  const preferred = process.env.AI_PROVIDER?.toLowerCase() as AIProvider | undefined;
  const available: AIProvider[] = [];
  if (isValidKey(process.env.GROQ_API_KEY)) available.push("groq");
  if (isValidKey(process.env.GEMINI_API_KEY)) available.push("gemini");
  if (isValidKey(process.env.OPENAI_API_KEY)) available.push("openai");

  if (!available.length) return [];

  if (preferred && available.includes(preferred)) {
    return [preferred, ...available.filter((p) => p !== preferred)];
  }
  // Por defecto: Groq primero (gratis sin billing), luego Gemini, luego OpenAI
  const order: AIProvider[] = ["groq", "gemini", "openai"];
  return order.filter((p) => available.includes(p));
}

export function isAIConfigured() {
  return getProviderChain().length > 0;
}

export function getAIStatus() {
  const chain = getProviderChain();
  const primary = chain[0];
  return {
    ai_enabled: chain.length > 0,
    provider: primary ?? "none",
    model: primary ? MODELS[primary] : null,
    providers: chain,
    key_hint: primary === "groq" ? "GROQ_API_KEY" : primary === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY",
    free_option: "Registra GROQ_API_KEY en console.groq.com — gratis, sin tarjeta",
  };
}

function isQuotaError(err: any) {
  const msg = err?.message ?? String(err);
  return msg.includes("429") || msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("rate_limit");
}

async function callGroq(system: string, user: string, maxTokens: number, temperature: number) {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY!,
    baseURL: "https://api.groq.com/openai/v1",
  });
  const resp = await client.chat.completions.create({
    model: MODELS.groq,
    response_format: { type: "json_object" },
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return parseAIJson(resp.choices[0]?.message?.content ?? "{}");
}

async function callGemini(system: string, user: string, maxTokens: number, temperature: number) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const response = await client.models.generateContent({
    model: MODELS.gemini,
    contents: `${system}\n\n---\n\n${user}`,
    config: { temperature, maxOutputTokens: maxTokens, responseMimeType: "application/json" },
  });
  const text = response.text ?? "";
  if (!text) throw new Error("Gemini devolvió respuesta vacía");
  return parseAIJson(text);
}

async function callOpenAI(system: string, user: string, maxTokens: number, temperature: number) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const resp = await client.chat.completions.create({
    model: MODELS.openai,
    response_format: { type: "json_object" },
    temperature,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return parseAIJson(resp.choices[0]?.message?.content ?? "{}");
}

export async function chatJSON(system: string, user: string, maxTokens: number, temperature: number) {
  const chain = getProviderChain();
  if (!chain.length) throw new Error("Ninguna API de IA configurada. Añade GROQ_API_KEY (gratis) en backend/.env");

  const errors: string[] = [];
  for (const provider of chain) {
    try {
      if (provider === "groq") return await callGroq(system, user, maxTokens, temperature);
      if (provider === "gemini") return await callGemini(system, user, maxTokens, temperature);
      return await callOpenAI(system, user, maxTokens, temperature);
    } catch (e: any) {
      const msg = e?.message ?? String(e);
      errors.push(`${provider}: ${msg.slice(0, 120)}`);
      if (isQuotaError(e)) continue;
      throw e;
    }
  }
  throw new Error(`Todos los proveedores fallaron. ${errors.join(" | ")}`);
}

export function formatAIError(err: any): string {
  const msg = err?.message ?? String(err);
  if (msg.includes("429") || msg.includes("quota")) {
    return "Cuota agotada. Usa Groq (gratis, sin billing): console.groq.com → crea GROQ_API_KEY → ponla en backend/.env con AI_PROVIDER=groq";
  }
  return msg;
}

const status = getAIStatus();
if (!status.ai_enabled) {
  console.warn("⚠ Sin IA — añade GROQ_API_KEY (gratis) o GEMINI_API_KEY en backend/.env");
} else {
  console.log(`✓ IA activa: ${status.provider} / ${status.model}${status.providers.length > 1 ? ` (+${status.providers.length - 1} fallback)` : ""}`);
}
