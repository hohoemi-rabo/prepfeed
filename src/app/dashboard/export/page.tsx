'use client';

import { FileSpreadsheet, Download, ExternalLink } from 'lucide-react';

export default function ExportPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="text-lg font-bold">データエクスポート</h2>

      {/* Google Sheets 連携 */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">Google Sheets 連携</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              収集データや分析結果をGoogle Sheetsに自動エクスポートできます。
              定期的な更新にも対応予定です。
            </p>
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <ExternalLink className="w-4 h-4" />
              Google Sheets に接続
            </button>
          </div>
        </div>
      </div>

      {/* CSV ダウンロード */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">CSV ダウンロード</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 font-medium">
                Coming Soon
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              収集したデータや分析結果をCSVファイルとしてダウンロードできます。
              Excel等での分析に便利です。
            </p>
            <button
              disabled
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              CSVをダウンロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
