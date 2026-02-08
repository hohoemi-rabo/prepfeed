/**
 * 分析ビジネスロジック
 * 簡易分析・詳細分析のプロンプト生成と実行
 */

import { geminiClient } from '@/lib/gemini';
import { createClient } from '@/lib/supabase/server';
import type { SimpleAnalysisResult, DetailedAnalysisResult } from '@/types/analysis';
import type { CollectedData } from '@/types/collected-data';
import type { MonitorSetting } from '@/types/monitor';

// ─── プロンプト生成 ───

function buildSimpleAnalysisPrompt(
  setting: MonitorSetting,
  data: CollectedData[]
): string {
  const dataForPrompt = data.map((d) => ({
    title: d.title,
    url: d.url,
    views: d.views,
    likes: d.likes,
    comments: d.comments,
    stocks: d.stocks,
    tags: d.tags,
    published_at: d.published_at,
    growth_rate: d.growth_rate,
  }));

  return `あなたはコンテンツ分析の専門家です。
以下のデータを分析し、JSON形式で結果を返してください。

【データ】
プラットフォーム: ${setting.platform}
監視タイプ: ${setting.type}
検索値: ${setting.value}
収集日: ${new Date().toISOString().split('T')[0]}
データ件数: ${data.length}件

【収集データ】
${JSON.stringify(dataForPrompt, null, 2)}

【出力形式】
以下のJSON形式で正確に出力してください。他のテキストは含めないでください。
{
  "trend_score": 0から100の整数（トレンドの強さを表す）,
  "summary": "100文字以内の要約テキスト",
  "top_contents": [
    { "id": "コンテンツID", "title": "タイトル", "reason": "注目理由" }
  ],
  "keywords": ["関連キーワード1", "関連キーワード2", "関連キーワード3", "関連キーワード4", "関連キーワード5"]
}

【注意事項】
- top_contentsは上位3件まで
- keywordsは5つ程度
- 具体的なデータに基づいた分析をしてください
- 日本語で出力してください`;
}

function buildDetailedAnalysisPrompt(
  settings: MonitorSetting[],
  collectedData: CollectedData[]
): string {
  const settingsInfo = settings.map((s) => ({
    platform: s.platform,
    type: s.type,
    value: s.value,
    display_name: s.display_name,
  }));

  // プラットフォーム別にデータを分類
  const youtubeData = collectedData
    .filter((d) => d.platform === 'youtube')
    .map((d) => ({
      title: d.title,
      url: d.url,
      views: d.views,
      likes: d.likes,
      comments: d.comments,
      published_at: d.published_at,
      growth_rate: d.growth_rate,
      tags: d.tags,
    }));

  const qiitaData = collectedData
    .filter((d) => d.platform === 'qiita')
    .map((d) => ({
      title: d.title,
      url: d.url,
      likes: d.likes,
      stocks: d.stocks,
      published_at: d.published_at,
      growth_rate: d.growth_rate,
      tags: d.tags,
    }));

  const zennData = collectedData
    .filter((d) => d.platform === 'zenn')
    .map((d) => ({
      title: d.title,
      url: d.url,
      likes: d.likes,
      published_at: d.published_at,
      growth_rate: d.growth_rate,
    }));

  const noteData = collectedData
    .filter((d) => d.platform === 'note')
    .map((d) => ({
      title: d.title,
      url: d.url,
      likes: d.likes,
      comments: d.comments,
      published_at: d.published_at,
      growth_rate: d.growth_rate,
    }));

  return `あなたはコンテンツマーケティングの専門家です。
以下の複数プラットフォームのデータを横断分析し、
クリエイター向けの実用的なレポートを作成してください。

【ユーザーの監視設定】
${JSON.stringify(settingsInfo, null, 2)}

【YouTube データ】（${youtubeData.length}件）
${youtubeData.length > 0 ? JSON.stringify(youtubeData, null, 2) : 'データなし'}

【Qiita データ】（${qiitaData.length}件）
${qiitaData.length > 0 ? JSON.stringify(qiitaData, null, 2) : 'データなし'}

【Zenn データ】（${zennData.length}件）
${zennData.length > 0 ? JSON.stringify(zennData, null, 2) : 'データなし'}

【note データ】（${noteData.length}件）
${noteData.length > 0 ? JSON.stringify(noteData, null, 2) : 'データなし'}

【出力形式】
以下のJSON形式で正確に出力してください。他のテキストは含めないでください。
{
  "trend_analysis": {
    "summary": "今週のトレンド総括テキスト",
    "rising_topics": [
      { "topic": "トピック名", "growth": "+XX%", "platforms": ["youtube", "qiita"] }
    ],
    "declining_topics": [
      { "topic": "トピック名", "decline": "-XX%" }
    ]
  },
  "content_ideas": [
    {
      "title": "コンテンツタイトル案",
      "reason": "提案理由",
      "platform_recommendation": "youtube",
      "estimated_potential": "高/中/低"
    }
  ],
  "competitor_analysis": {
    "top_performers": [
      { "name": "名前", "platform": "youtube", "stats": "統計情報" }
    ],
    "posting_patterns": "投稿パターンの分析テキスト",
    "common_tags": ["タグ1", "タグ2"]
  },
  "recommendations": ["具体的なアドバイス1", "具体的なアドバイス2"]
}

【注意事項】
- content_ideasは3〜5件
- recommendationsは3〜5件
- platformsの値は "youtube", "qiita", "zenn", "note" のいずれか
- platform_recommendationの値は "youtube", "qiita", "zenn", "note" のいずれか
- 具体的な数値やデータに基づいた分析をしてください
- 実行可能なアクションを提案してください
- 日本語で出力してください`;
}

// ─── 分析実行 ───

/**
 * 簡易分析を実行
 * バッチ処理から同期的に呼ばれる
 */
export async function runSimpleAnalysis(
  settingId: string,
  setting: MonitorSetting,
  data: CollectedData[]
): Promise<SimpleAnalysisResult> {
  if (data.length === 0) {
    return {
      trend_score: 0,
      summary: '分析対象のデータがありません。',
      top_contents: [],
      keywords: [],
      generated_at: new Date().toISOString(),
    };
  }

  const prompt = buildSimpleAnalysisPrompt(setting, data);
  const result = await geminiClient.generateJSON<Omit<SimpleAnalysisResult, 'generated_at'>>(prompt);

  return {
    ...result,
    generated_at: new Date().toISOString(),
  };
}

/**
 * 詳細分析を実行
 * バックグラウンドジョブとして非同期実行
 * waitUntil から呼ばれる
 */
export async function runDetailedAnalysis(
  userId: string,
  analysisId: string,
  jobId: string
): Promise<void> {
  const supabase = await createClient();

  try {
    // ジョブステータスを processing に更新
    await supabase
      .from('analysis_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    await supabase
      .from('analysis_results')
      .update({ status: 'processing' })
      .eq('id', analysisId);

    // ユーザーの監視設定を取得
    const { data: settings, error: settingsError } = await supabase
      .from('monitor_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (settingsError) {
      throw new Error(`監視設定の取得に失敗: ${settingsError.message}`);
    }

    if (!settings || settings.length === 0) {
      throw new Error('アクティブな監視設定がありません。先に監視設定を追加してください。');
    }

    // 収集データを取得（直近のデータ）
    const { data: collectedData, error: dataError } = await supabase
      .from('collected_data')
      .select('*')
      .eq('user_id', userId)
      .order('collected_at', { ascending: false })
      .limit(500);

    if (dataError) {
      throw new Error(`収集データの取得に失敗: ${dataError.message}`);
    }

    if (!collectedData || collectedData.length === 0) {
      throw new Error('分析対象の収集データがありません。データ収集を実行してください。');
    }

    // Gemini API で詳細分析を実行
    const prompt = buildDetailedAnalysisPrompt(
      settings as MonitorSetting[],
      collectedData as CollectedData[]
    );
    const analysisResult = await geminiClient.generateJSON<
      Omit<DetailedAnalysisResult, 'generated_at'>
    >(prompt);

    const result: DetailedAnalysisResult = {
      ...analysisResult,
      generated_at: new Date().toISOString(),
    };

    // 結果を保存
    const now = new Date().toISOString();

    await supabase
      .from('analysis_results')
      .update({
        status: 'completed',
        result,
        completed_at: now,
      })
      .eq('id', analysisId);

    await supabase
      .from('analysis_jobs')
      .update({
        status: 'completed',
        completed_at: now,
      })
      .eq('id', jobId);
  } catch (error) {
    // エラー時: 両テーブルのステータスを failed に更新
    const errorMessage =
      error instanceof Error ? error.message : '不明なエラーが発生しました';

    console.error('[DetailedAnalysis] Error:', errorMessage);

    await supabase
      .from('analysis_results')
      .update({
        status: 'failed',
        error_message: errorMessage,
      })
      .eq('id', analysisId);

    await supabase
      .from('analysis_jobs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}
