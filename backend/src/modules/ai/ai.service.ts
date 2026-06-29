// src/modules/ai/ai.service.ts
import { geminiConfig } from '@/config/gemini.js';
import { ApiError } from '@/common/utils/ApiError.js';
import { logger } from '@/common/utils/logger.js';

export class AIService {
  private async callGemini(prompt: string, temperature: number = 0.2): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1/models/${geminiConfig.model}:generateContent?key=${geminiConfig.apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature, maxOutputTokens: geminiConfig.maxTokens } }),
        signal: controller.signal,
      });
      if (!response.ok) { const errorBody = await response.text(); throw new Error(`Gemini API error (${response.status}): ${errorBody}`); }
      const data = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') logger.error('Gemini API timeout');
      else logger.error('Gemini API call failed', error);
      throw error;
    } finally { clearTimeout(timeoutId); }
  }

  async classifyMessage(content: string): Promise<{ classification: string; confidence: number }> {
    try {
      const prompt = `صنف رسالة العميل التالية إلى واحدة من: INQUIRY, COMPLAINT, REQUEST, OTHER. أعد JSON فقط بهذا الشكل بدون أي نص آخر: { "classification": "..." }.\nالرسالة: "${content}"`;
      const raw = await this.callGemini(prompt, 0.1);
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { classification: string };
      const classification = json.classification?.toUpperCase() || 'OTHER';
      const confidence = classification === 'OTHER' ? 0.5 : 0.9;
      return { classification, confidence };
    } catch (error) { logger.error('Classify message failed', error); throw ApiError.internal('AI classification failed'); }
  }

  async checkAgentSentiment(content: string): Promise<{ sentiment: string; score: number; warning?: boolean }> {
    try {
      const prompt = `حلل مشاعر هذا الرد الذي سيرسله وكيل دعم لعميل. أعد JSON فقط: { "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE", "score": 0.0-1.0 }.\nالرد: "${content}"`;
      const raw = await this.callGemini(prompt, 0.0);
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { sentiment: string; score: number };
      const sentiment = json.sentiment?.toUpperCase() || 'NEUTRAL';
      const score = json.score ?? 0.5;
      const warning = score < 0.3;
      return { sentiment, score, warning };
    } catch (error) { logger.error('Sentiment check failed', error); throw ApiError.internal('AI sentiment check failed'); }
  }

  async suggestReplies(agentContent: string, knowledgeBase?: string): Promise<{ short: string; professional: string; warm: string }> {
    try {
      let prompt = `اقترح 3 صيغ بديلة للرد التالي: صيغة مختصرة، صيغة أكثر احترافية، صيغة أكثر دفئًا. أعد JSON فقط: { "short": "...", "professional": "...", "warm": "..." }.\nالرد: "${agentContent}"`;
      if (knowledgeBase) prompt += `\nاستند إلى قاعدة المعرفة التالية عند الاقتراح: ${knowledgeBase}`;
      const raw = await this.callGemini(prompt, 0.7);
      const json = JSON.parse(raw.replace(/```json|```/g, '').trim()) as { short: string; professional: string; warm: string };
      return json;
    } catch (error) { logger.error('Suggest replies failed', error); throw ApiError.internal('AI suggestion failed'); }
  }
}

export const aiService = new AIService();