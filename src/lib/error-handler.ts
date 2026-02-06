/**
 * エラーハンドリングユーティリティ
 * Phase 1（YouTube）+ Phase 2（Qiita/Zenn/Gemini/バッチ）統合
 */

export enum ErrorType {
  // Phase 1: YouTube / 汎用
  CHANNEL_NOT_FOUND = 'CHANNEL_NOT_FOUND',
  API_QUOTA_EXCEEDED = 'API_QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Phase 2: Qiita / Zenn
  QIITA_API_ERROR = 'QIITA_API_ERROR',
  ZENN_API_ERROR = 'ZENN_API_ERROR',

  // Phase 2: Gemini AI
  GEMINI_API_ERROR = 'GEMINI_API_ERROR',
  GEMINI_PARSE_ERROR = 'GEMINI_PARSE_ERROR',
  ANALYSIS_TIMEOUT_ERROR = 'ANALYSIS_TIMEOUT_ERROR',

  // Phase 2: バッチ処理
  BATCH_TIMEOUT_ERROR = 'BATCH_TIMEOUT_ERROR',

  // Phase 2: 認証・権限
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  PREMIUM_REQUIRED = 'PREMIUM_REQUIRED',

  // Phase 2: Google 連携（エクスポート用、将来実装）
  GOOGLE_AUTH_ERROR = 'GOOGLE_AUTH_ERROR',
  GOOGLE_SHEETS_ERROR = 'GOOGLE_SHEETS_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  userMessage: string;
  canRetry: boolean;
  retryAfter?: number; // 秒
  hint?: string; // 対処方法のヒント
}

/**
 * エラータイプを判定
 */
export function classifyError(error: unknown): AppError {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const lowerMessage = errorMessage.toLowerCase();

  // 認証エラー
  if (
    lowerMessage.includes('ログインが必要') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('認証')
  ) {
    return {
      type: ErrorType.AUTH_REQUIRED,
      message: errorMessage,
      userMessage: 'ログインが必要です。',
      canRetry: false,
      hint: 'ログインページからログインしてください。',
    };
  }

  // プレミアム機能
  if (
    lowerMessage.includes('有料プラン') ||
    lowerMessage.includes('premium')
  ) {
    return {
      type: ErrorType.PREMIUM_REQUIRED,
      message: errorMessage,
      userMessage: 'この機能は有料プランのみ利用可能です。',
      canRetry: false,
      hint: 'プランのアップグレードをご検討ください。',
    };
  }

  // Gemini API パースエラー
  if (
    lowerMessage.includes('不正なjson') ||
    lowerMessage.includes('gemini') && lowerMessage.includes('parse')
  ) {
    return {
      type: ErrorType.GEMINI_PARSE_ERROR,
      message: errorMessage,
      userMessage: 'AI分析の結果を処理できませんでした。再度お試しください。',
      canRetry: true,
      retryAfter: 5,
      hint: 'AIの応答形式が不正でした。通常は再実行で解決します。',
    };
  }

  // Gemini API エラー
  if (
    lowerMessage.includes('gemini') ||
    lowerMessage.includes('generativeai')
  ) {
    return {
      type: ErrorType.GEMINI_API_ERROR,
      message: errorMessage,
      userMessage: 'AI分析サービスでエラーが発生しました。しばらく待ってから再度お試しください。',
      canRetry: true,
      retryAfter: 30,
      hint: 'AI APIの一時的な障害の可能性があります。',
    };
  }

  // 分析タイムアウト
  if (
    lowerMessage.includes('analysis') && lowerMessage.includes('timeout') ||
    lowerMessage.includes('分析') && lowerMessage.includes('タイムアウト')
  ) {
    return {
      type: ErrorType.ANALYSIS_TIMEOUT_ERROR,
      message: errorMessage,
      userMessage: '分析処理がタイムアウトしました。データ量を減らして再度お試しください。',
      canRetry: true,
      retryAfter: 60,
      hint: '監視設定の取得件数を減らすと改善する可能性があります。',
    };
  }

  // バッチタイムアウト
  if (
    lowerMessage.includes('バッチ') && lowerMessage.includes('タイムアウト') ||
    lowerMessage.includes('batch') && lowerMessage.includes('timeout') ||
    lowerMessage.includes('時間予算')
  ) {
    return {
      type: ErrorType.BATCH_TIMEOUT_ERROR,
      message: errorMessage,
      userMessage: 'バッチ処理がタイムアウトしました。一部の設定は次回実行時に処理されます。',
      canRetry: true,
      retryAfter: 300,
    };
  }

  // Qiita API エラー
  if (lowerMessage.includes('qiita')) {
    return {
      type: ErrorType.QIITA_API_ERROR,
      message: errorMessage,
      userMessage: 'Qiita APIでエラーが発生しました。しばらく待ってから再度お試しください。',
      canRetry: true,
      retryAfter: 60,
      hint: 'Qiita APIのレート制限に達した可能性があります。',
    };
  }

  // Zenn API エラー
  if (lowerMessage.includes('zenn')) {
    return {
      type: ErrorType.ZENN_API_ERROR,
      message: errorMessage,
      userMessage: 'Zenn APIでエラーが発生しました。しばらく待ってから再度お試しください。',
      canRetry: true,
      retryAfter: 60,
      hint: 'Zenn APIの仕様変更やメンテナンスの可能性があります。',
    };
  }

  // チャンネル未検出
  if (
    lowerMessage.includes('not found') ||
    lowerMessage.includes('channel not found') ||
    lowerMessage.includes('該当する') ||
    lowerMessage.includes('見つかりません')
  ) {
    return {
      type: ErrorType.CHANNEL_NOT_FOUND,
      message: errorMessage,
      userMessage: '該当するチャンネルが見つかりません。チャンネル名を確認して再度お試しください。',
      canRetry: false,
    };
  }

  // API制限到達
  if (
    lowerMessage.includes('quota') ||
    lowerMessage.includes('exceeded') ||
    lowerMessage.includes('quotaexceeded')
  ) {
    return {
      type: ErrorType.API_QUOTA_EXCEEDED,
      message: errorMessage,
      userMessage: '現在アクセスが集中しています。5分後に再度お試しください。',
      canRetry: false,
      retryAfter: 300,
    };
  }

  // レート制限
  if (
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('リクエスト制限') ||
    lowerMessage.includes('429')
  ) {
    return {
      type: ErrorType.RATE_LIMIT_EXCEEDED,
      message: errorMessage,
      userMessage: 'リクエスト制限に達しました。しばらく待ってから再度お試しください。',
      canRetry: true,
      retryAfter: 60,
    };
  }

  // ネットワークエラー
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('econnrefused')
  ) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: errorMessage,
      userMessage: '通信エラーが発生しました。ネットワーク接続を確認して再度お試しください。',
      canRetry: true,
    };
  }

  // 不正なリクエスト
  if (
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('bad request') ||
    lowerMessage.includes('無効') ||
    lowerMessage.includes('バリデーション')
  ) {
    return {
      type: ErrorType.INVALID_REQUEST,
      message: errorMessage,
      userMessage: '入力内容に誤りがあります。内容を確認して再度お試しください。',
      canRetry: false,
    };
  }

  // Google 認証エラー（将来用）
  if (
    lowerMessage.includes('google') && lowerMessage.includes('auth') ||
    lowerMessage.includes('oauth') && lowerMessage.includes('token')
  ) {
    return {
      type: ErrorType.GOOGLE_AUTH_ERROR,
      message: errorMessage,
      userMessage: 'Google認証でエラーが発生しました。再度ログインしてください。',
      canRetry: false,
      hint: 'Google連携を再設定してください。',
    };
  }

  // Google Sheets エラー（将来用）
  if (lowerMessage.includes('sheets') || lowerMessage.includes('spreadsheet')) {
    return {
      type: ErrorType.GOOGLE_SHEETS_ERROR,
      message: errorMessage,
      userMessage: 'Google Sheetsへのエクスポートでエラーが発生しました。',
      canRetry: true,
      retryAfter: 30,
    };
  }

  // その他のエラー
  return {
    type: ErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: '予期しないエラーが発生しました。しばらくしてから再度お試しください。',
    canRetry: true,
  };
}

/**
 * エラーをログに記録
 */
export function logError(error: AppError, context?: Record<string, unknown>): void {
  console.error('[App Error]', {
    type: error.type,
    message: error.message,
    userMessage: error.userMessage,
    canRetry: error.canRetry,
    retryAfter: error.retryAfter,
    context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * リトライ可能かチェック
 */
export function canRetry(error: AppError): boolean {
  return error.canRetry;
}

/**
 * リトライまでの待機時間を取得（ミリ秒）
 */
export function getRetryDelay(error: AppError, attempt: number = 1): number {
  if (error.retryAfter) {
    return error.retryAfter * 1000;
  }

  // エクスポネンシャルバックオフ: 1秒, 2秒, 4秒, 8秒...
  const baseDelay = 1000;
  const maxDelay = 30000;
  const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

  return delay;
}
