/**
 * ローディング状態の共通コンポーネント
 * 検索ページ等で一貫したローディング表示を提供
 */

interface LoadingStateProps {
  message: string;
  color?: string;
}

export default function LoadingState({
  message,
  color = '#3EA8FF',
}: LoadingStateProps) {
  return (
    <div className="container-custom py-8">
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-8 w-8 border-b-2"
          style={{ borderBottomColor: color }}
        />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}
