import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Database, Cookie } from 'lucide-react';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | PrepFeed',
  description: 'PrepFeedのプライバシーポリシーと個人情報の取り扱いについて',
  robots: {
    index: false,
    follow: true,
  },
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-4">プライバシーポリシー</h1>
        <p className="text-gray-600 dark:text-gray-400">
          PrepFeed（以下「本サービス」）における個人情報の取り扱いについて説明します。
        </p>
      </div>

      {/* プライバシーポリシーセクション */}
      <div className="space-y-6">
        {/* 基本方針 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">基本方針</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスは、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
            </p>
            <p className="font-medium text-[#FF0000]">
              本サービスは、ユーザー登録機能を提供しておらず、個人を特定できる情報（氏名、メールアドレス、住所等）を収集・保存することはありません。
            </p>
          </div>
        </div>

        {/* 収集する情報 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Database className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">収集する情報</h2>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <div>
              <h3 className="font-bold mb-2">1. アクセス情報</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IPアドレス</li>
                <li>ブラウザの種類とバージョン</li>
                <li>アクセス日時</li>
                <li>参照元URL</li>
                <li>デバイス情報</li>
              </ul>
              <p className="mt-2 text-sm">
                これらの情報は、サービスの改善、セキュリティ確保、統計分析の目的で自動的に収集されます。
              </p>
            </div>

            <div>
              <h3 className="font-bold mb-2">2. 検索履歴</h3>
              <p>
                ユーザーが検索したチャンネル名は、ブラウザのローカルストレージに一時的に保存される場合があります。
                この情報はユーザーのブラウザ内にのみ保存され、サーバーには送信されません。
              </p>
            </div>
          </div>
        </div>

        {/* クッキーの使用 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Cookie className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">クッキー（Cookie）の使用</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスでは、ユーザー体験の向上のため、以下の目的でクッキーを使用する場合があります：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>テーマ設定（ダークモード/ライトモード）の保存</li>
              <li>検索履歴の一時保存</li>
              <li>アクセス解析（Google Analytics等）</li>
            </ul>
            <p className="mt-3">
              ブラウザの設定により、クッキーの使用を拒否することができます。ただし、一部の機能が正常に動作しない場合があります。
            </p>
          </div>
        </div>

        {/* アクセス解析ツール */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Eye className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">アクセス解析ツール</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスでは、サービス改善のため、Google Analyticsを使用してアクセス解析を行う場合があります。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Google Analyticsは、クッキーを使用してユーザーの利用状況を分析します</li>
              <li>収集されたデータは匿名化され、個人を特定することはできません</li>
              <li>データの取り扱いについては、Googleのプライバシーポリシーに準じます</li>
            </ul>
            <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                Google Analyticsのプライバシーポリシー：
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF0000] hover:underline ml-1"
                >
                  https://policies.google.com/privacy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* YouTube Data API */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Database className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">YouTube Data APIの利用</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスは、YouTube Data API v3を利用して、YouTubeの公開データを取得しています。
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>取得するのは、YouTubeで公開されているチャンネル情報と動画情報のみです</li>
              <li>ユーザーのYouTubeアカウント情報にはアクセスしません</li>
              <li>取得したデータは、一時的にキャッシュされる場合がありますが、長期保存はしません</li>
            </ul>
            <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-sm">
                YouTube API利用規約：
                <a
                  href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF0000] hover:underline ml-1"
                >
                  API Services Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 第三者への提供 */}
        <div className="card">
          <div className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <h2 className="text-xl font-bold">第三者への情報提供</h2>
          </div>
          <div className="space-y-3 text-gray-700 dark:text-gray-300">
            <p>
              本サービスは、以下の場合を除き、収集した情報を第三者に提供することはありません：
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づき開示が必要な場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合</li>
            </ul>
          </div>
        </div>

        {/* プライバシーポリシーの変更 */}
        <div className="card bg-gray-50 dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4">プライバシーポリシーの変更</h2>
          <p className="text-gray-700 dark:text-gray-300">
            本プライバシーポリシーは、法令の変更やサービス内容の変更に伴い、予告なく変更される場合があります。
            変更後のプライバシーポリシーは、本ページに掲載された時点で効力を生じるものとします。
          </p>
        </div>

        {/* お問い合わせ */}
        <div className="card border-2 border-[#FF0000]">
          <h2 className="text-xl font-bold mb-4">お問い合わせ</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            本プライバシーポリシーに関するご質問は、GitHubのIssuesよりお問い合わせください。
          </p>
          <a
            href="https://github.com/hohoemi-rabo/prepfeed/issues"
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