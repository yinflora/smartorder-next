import { GoogleGenAI, Type } from '@google/genai';
import type { ParsedMenuResult } from '@/types';

/**
 * Parse menu image using Gemini AI
 * This runs on the server side to keep API key secure
 */
export async function parseMenuFromImage(
  base64Data: string,
  mimeType: string,
  shopName: string
): Promise<ParsedMenuResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          {
            text: `你是一位專業的餐廳點餐系統助理。請解析以下菜單圖片，並整理成符合 Schema 的 JSON 格式。包含品牌名稱、分類以及每個菜品的名稱、價格、分類。如果價格中包含非數字字元，請僅提取數字。店鋪名稱為：${shopName}`,
          },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: base64Data,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING, description: '餐廳品牌名稱' },
            categories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '菜品分類清單',
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: '菜名' },
                  price: { type: Type.NUMBER, description: '單價' },
                  category: { type: Type.STRING, description: '所屬分類' },
                },
                required: ['name', 'price', 'category'],
              },
            },
          },
          required: ['brandName', 'categories', 'items'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    return JSON.parse(text) as ParsedMenuResult;
  } catch (error) {
    console.error('Gemini Parse Error:', error);

    // Return mock data to keep POC flow working
    return {
      brandName: shopName || '解析失敗店鋪',
      categories: ['精選主食', '推薦飲品'],
      items: [
        { name: '解析失敗-範例牛肉麵', price: 150, category: '精選主食' },
        { name: '解析失敗-範例冰紅茶', price: 40, category: '推薦飲品' },
      ],
    };
  }
}
