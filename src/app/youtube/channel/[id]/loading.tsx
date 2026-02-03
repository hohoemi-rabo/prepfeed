import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container-custom py-8">
      {/* ヘッダースケルトン */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* チャンネルカードスケルトン */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カードスケルトン */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card text-center">
            <div className="h-8 w-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2 mx-auto w-24"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto w-16"></div>
          </div>
        ))}
      </div>

      {/* グラフスケルトン */}
      <div className="card mb-8">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-6"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* 動画リストスケルトン */}
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-48 mb-6"></div>

        {/* ソートタブスケルトン */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>

        {/* 動画カードスケルトン */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="aspect-video w-full lg:w-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <div key={j} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ローディングメッセージ */}
      <div className="fixed bottom-8 right-8 card flex items-center gap-3 shadow-lg">
        <Loader2 className="w-5 h-5 animate-spin text-[#FF0000]" />
        <span className="text-sm font-medium">チャンネル情報を読み込み中...</span>
      </div>
    </div>
  );
}