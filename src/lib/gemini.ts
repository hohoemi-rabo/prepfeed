/**
 * Gemini API クライアント
 * @google/generative-ai SDK を使用した AI 分析クライアント
 */

import {
  GoogleGenerativeAI,
  GenerativeModel,
  GoogleGenerativeAIFetchError,
} from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

class GeminiClient {
  private model: GenerativeModel | null = null;

  private getModel(): GenerativeModel {
    if (this.model) return this.model;

    if (!GEMINI_API_KEY) {
      throw new Error(
        'GEMINI_API_KEY が設定されていません。環境変数を確認してください。'
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    return this.model;
  }

  /**
   * プロンプトを送信し、JSONレスポンスをパースして返す
   * リトライロジック付き（指数バックオフ）
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const model = this.getModel();
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        try {
          return JSON.parse(responseText) as T;
        } catch {
          lastError = new Error(
            `Gemini APIのレスポンスが不正なJSONです: ${responseText.substring(0, 200)}`
          );
          // JSONパース失敗はリトライ対象
          if (attempt < MAX_RETRIES - 1) {
            await this.delay(attempt);
            continue;
          }
          throw lastError;
        }
      } catch (error) {
        if (error instanceof GoogleGenerativeAIFetchError) {
          const status = error.status;

          // レートリミット(429) or サーバーエラー(503) → リトライ
          if (
            (status === 429 || status === 503) &&
            attempt < MAX_RETRIES - 1
          ) {
            lastError = new Error(
              `Gemini API レートリミット (${status}): ${error.message}`
            );
            await this.delay(attempt);
            continue;
          }

          throw new Error(
            `Gemini API エラー (${status}): ${error.statusText || error.message}`
          );
        }

        // JSONパースエラーは上で処理済み、それ以外は再スロー
        if (error instanceof Error && error.message.includes('不正なJSON')) {
          if (attempt >= MAX_RETRIES - 1) throw error;
          lastError = error;
          await this.delay(attempt);
          continue;
        }

        throw error;
      }
    }

    throw lastError || new Error('Gemini API: 最大リトライ回数に達しました');
  }

  /**
   * 指数バックオフでの待機
   */
  private delay(attempt: number): Promise<void> {
    const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export const geminiClient = new GeminiClient();
