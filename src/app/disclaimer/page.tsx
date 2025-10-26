import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Info, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: '免責事項 | YouTubeスコープ',
  description: 'YouTubeスコープの免責事項とサービス利用に関する注意事項',
  robots: {
    index: false,
    follow: true,
  },
};

export default function DisclaimerPage() {
  return (
    <div className="container-custom py-8">
      {/* 戻るリンク */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF0000] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        ホームに戻る
      </Link>

      {/* ページタイトル */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">免責事項</h1>
        <p className="text-gray-600 dark:text-gray-400">
          YouTubeスコープ（以下「本サービス」）をご利用いただく前に、以下の免責事項をお読みください。
        </p>
      </div>

      {/* 免責事項セクション */}
      <div className="space-y-6">
        {/* サービスの性質 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">サービスの性質について</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスは、YouTube Data API v3を利用してYouTubeの公開データを取得し、チャンネルや動画の分析情報を提供するツールです。
            </p>
            <p className="font-medium text-[#FF0000]">
              本サービスは、YouTube及びGoogle LLCとは一切提携しておらず、公式のサービスではありません。
            </p>
          </div>
        </div>

        {/* データの正確性 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">データの正確性について</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                表示されるデータは、YouTube Data APIから取得した公開情報に基づく<strong>参考値</strong>です。
              </li>
              <li>
                データの正確性、完全性、最新性について、当サービスは一切保証いたしません。
              </li>
              <li>
                分析結果やランキングは、特定の計算式に基づく推定値であり、実際の数値とは異なる場合があります。
              </li>
              <li>
                YouTubeの仕様変更やAPI制限により、データが取得できない場合や、表示が遅延する場合があります。
              </li>
              <li>
                過去のデータについては保存しておらず、リアルタイムのデータのみを表示します。
              </li>
            </ul>
          </div>
        </div>

        {/* 利用上の注意 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">利用上の注意事項</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                本サービスで提供される情報は、あくまで<strong>参考情報</strong>としてご利用ください。
              </li>
              <li>
                本サービスの情報に基づいて行った行動により生じたいかなる損害についても、当サービスは一切の責任を負いません。
              </li>
              <li>
                商業目的での利用や、第三者への情報提供を行う際は、自己の責任において行ってください。
              </li>
              <li>
                本サービスは予告なく内容の変更、機能の追加・削除、サービスの停止を行う場合があります。
              </li>
              <li>
                システムメンテナンスやサーバー障害により、サービスが一時的に利用できない場合があります。
              </li>
            </ul>
          </div>
        </div>

        {/* API制限について */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">API利用制限について</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              YouTube Data APIには1日あたりのリクエスト制限（クォータ）があります。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                多数のユーザーが同時にアクセスした場合、API制限に達し、一時的にサービスが利用できなくなる場合があります。
              </li>
              <li>
                API制限に達した場合は、時間をおいて再度お試しください。
              </li>
              <li>
                過度なリクエストを行うユーザーに対しては、アクセス制限を行う場合があります。
              </li>
            </ul>
          </div>
        </div>

        {/* 著作権・商標について */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Info className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">著作権・商標について</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                YouTube、YouTubeロゴは、Google LLCの商標または登録商標です。
              </li>
              <li>
                本サービスで表示されるチャンネル名、動画タイトル、サムネイル画像等の著作権は、それぞれの権利者に帰属します。
              </li>
              <li>
                本サービスのコンテンツ（デザイン、レイアウト、テキスト等）の著作権は、当サービス運営者に帰属します。
              </li>
            </ul>
          </div>
        </div>

        {/* プライバシーについて */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">プライバシーについて</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                本サービスは、ユーザーの個人情報を収集・保存しません。
              </li>
              <li>
                検索履歴や閲覧履歴は、ブラウザのローカルストレージに一時的に保存される場合がありますが、サーバーには送信されません。
              </li>
              <li>
                アクセス解析のため、Google Analyticsを使用する場合があります。詳細はGoogle Analyticsのプライバシーポリシーをご確認ください。
              </li>
            </ul>
          </div>
        </div>

        {/* 免責事項の変更 */}
        <div className="card bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4">免責事項の変更について</h2>
          <p className="text-gray-700 dark:text-gray-300">
            本免責事項は、予告なく変更される場合があります。変更後の免責事項は、本ページに掲載された時点で効力を生じるものとします。
          </p>
        </div>

        {/* お問い合わせ */}
        <div className="card border-2 border-[#FF0000]">
          <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            本サービスに関するご質問やご意見は、GitHubのIssuesよりお問い合わせください。
          </p>
          <a
            href="https://github.com/hohoemi-rabo/channel-scope/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#FF0000] hover:underline font-medium"
          >
            GitHub Issues
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </a>
        </div>
      </div>

      {/* 最終更新日 */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        最終更新日: 2025年9月30日
      </div>

      {/* ホームに戻るボタン */}
      <div className="mt-8 text-center">
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}